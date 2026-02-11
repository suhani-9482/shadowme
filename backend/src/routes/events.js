/**
 * Events Routes
 * Handles interaction tracking events from the frontend
 * This is for Person 2 (teammate) to expand - basic structure provided
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /events
 * Store interaction events (page_load, visibility_change, idle, actions)
 * 
 * Body:
 * {
 *   event_type: string (required) - page_load, page_unload, visibility_change, idle, action, session_start, session_end
 *   metadata: object (optional) - additional event data
 *   session_id: string (optional) - to group events by session
 *   timestamp: string (optional) - ISO timestamp, defaults to now
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { event_type, metadata, session_id, timestamp } = req.body;
        
        if (!event_type) {
            return res.status(400).json({ error: 'event_type is required' });
        }
        
        const { data: event, error } = await supabase
            .from('interaction_events')
            .insert({
                user_id: req.userId,
                event_type,
                metadata: metadata || {},
                session_id: session_id || null,
                timestamp: timestamp || new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({ 
            message: 'Event recorded',
            event 
        });
    } catch (error) {
        console.error('Error recording event:', error);
        res.status(500).json({ error: 'Failed to record event' });
    }
});

/**
 * POST /events/batch
 * Store multiple events at once (for efficiency)
 */
router.post('/batch', async (req, res) => {
    try {
        const { events } = req.body;
        
        if (!events || !Array.isArray(events)) {
            return res.status(400).json({ error: 'events array is required' });
        }
        
        // Add user_id to each event
        const eventsWithUser = events.map(event => ({
            user_id: req.userId,
            event_type: event.event_type,
            metadata: event.metadata || {},
            session_id: event.session_id || null,
            timestamp: event.timestamp || new Date().toISOString()
        }));
        
        const { data, error } = await supabase
            .from('interaction_events')
            .insert(eventsWithUser)
            .select();
        
        if (error) throw error;
        
        res.status(201).json({ 
            message: `${data.length} events recorded`,
            count: data.length
        });
    } catch (error) {
        console.error('Error recording batch events:', error);
        res.status(500).json({ error: 'Failed to record events' });
    }
});

/**
 * GET /events
 * Get user's interaction events (for debugging/analysis)
 * Query params: limit, event_type, session_id
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 100, event_type, session_id } = req.query;
        
        let query = supabase
            .from('interaction_events')
            .select('*')
            .eq('user_id', req.userId)
            .order('timestamp', { ascending: false })
            .limit(parseInt(limit));
        
        if (event_type) {
            query = query.eq('event_type', event_type);
        }
        if (session_id) {
            query = query.eq('session_id', session_id);
        }
        
        const { data: events, error } = await query;
        
        if (error) throw error;
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

module.exports = router;
