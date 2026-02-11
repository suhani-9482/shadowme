/**
 * Feedback Routes
 * Handles accept/override/ignore feedback and CSP updates
 * 
 * NOTE: Person 2 (teammate) will implement the CSP update logic.
 * This file provides the route structure and basic storage.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /feedback
 * Record feedback for a decision card item
 * 
 * Body:
 * {
 *   plan_id: string (required) - the daily plan ID
 *   item_type: string (required) - 'card', 'task', 'meal', 'break'
 *   item_id: string (optional) - ID of the specific item
 *   item_value: string (optional) - what was suggested
 *   action: string (required) - 'accept', 'override', 'ignore'
 *   override_value: string (optional) - what user chose instead (for override)
 *   rating: number (optional) - -1, 0, or 1
 *   context: object (optional) - additional context
 * }
 */
router.post('/', async (req, res) => {
    try {
        const {
            plan_id,
            item_type,
            item_id,
            item_value,
            action,
            override_value,
            rating,
            context
        } = req.body;
        
        // Validate required fields
        if (!plan_id || !item_type || !action) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['plan_id', 'item_type', 'action']
            });
        }
        
        // Validate action
        if (!['accept', 'override', 'ignore'].includes(action)) {
            return res.status(400).json({
                error: 'Invalid action',
                allowed: ['accept', 'override', 'ignore']
            });
        }
        
        // Store feedback
        const { data: feedback, error } = await supabase
            .from('feedback')
            .insert({
                user_id: req.userId,
                plan_id,
                item_type,
                item_id: item_id || null,
                item_value: item_value || null,
                action,
                override_value: override_value || null,
                rating: rating || 0,
                context: context || {
                    time_of_day: new Date().toTimeString().split(' ')[0],
                    timestamp: new Date().toISOString()
                }
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // PLACEHOLDER: CSP update logic
        // Person 2 will implement full CSP weight updates here
        console.log(`[Feedback] User ${req.userId} - Action: ${action}, Item: ${item_type}`);
        
        // Basic CSP counter update (Person 2 will expand)
        await updateCspCounters(req.userId, action);
        
        res.status(201).json({
            message: 'Feedback recorded',
            feedback,
            csp_updated: true
        });
    } catch (error) {
        console.error('Error recording feedback:', error);
        res.status(500).json({ error: 'Failed to record feedback' });
    }
});

/**
 * Helper function to update basic CSP counters
 * Person 2 will expand this with full weight update logic
 */
async function updateCspCounters(userId, action) {
    try {
        // Fetch current CSP
        const { data: profile } = await supabase
            .from('profiles')
            .select('csp_vector')
            .eq('id', userId)
            .single();
        
        if (!profile) return;
        
        const csp = profile.csp_vector || {};
        
        // Update counters
        csp.total_decisions = (csp.total_decisions || 0) + 1;
        
        if (action === 'accept') {
            csp.total_accepts = (csp.total_accepts || 0) + 1;
        } else if (action === 'override') {
            csp.total_overrides = (csp.total_overrides || 0) + 1;
        } else if (action === 'ignore') {
            csp.total_ignores = (csp.total_ignores || 0) + 1;
        }
        
        // Update rates
        if (csp.total_decisions > 0) {
            csp.accept_rate = csp.total_accepts / csp.total_decisions;
            csp.override_rate = csp.total_overrides / csp.total_decisions;
        }
        
        // Save updated CSP
        await supabase
            .from('profiles')
            .update({
                csp_vector: csp,
                csp_last_updated: new Date().toISOString()
            })
            .eq('id', userId);
        
        console.log(`[CSP] Updated counters for user ${userId}:`, {
            total: csp.total_decisions,
            accepts: csp.total_accepts,
            overrides: csp.total_overrides,
            ignores: csp.total_ignores,
            accept_rate: csp.accept_rate?.toFixed(2)
        });
    } catch (error) {
        console.error('Error updating CSP counters:', error);
    }
}

/**
 * GET /feedback
 * Get user's feedback history
 */
router.get('/', async (req, res) => {
    try {
        const { plan_id, limit = 50 } = req.query;
        
        let query = supabase
            .from('feedback')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));
        
        if (plan_id) {
            query = query.eq('plan_id', plan_id);
        }
        
        const { data: feedback, error } = await query;
        
        if (error) throw error;
        
        res.json({ feedback });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

/**
 * GET /feedback/stats
 * Get feedback statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const { data: feedback, error } = await supabase
            .from('feedback')
            .select('action')
            .eq('user_id', req.userId);
        
        if (error) throw error;
        
        const stats = {
            total: feedback.length,
            accepts: feedback.filter(f => f.action === 'accept').length,
            overrides: feedback.filter(f => f.action === 'override').length,
            ignores: feedback.filter(f => f.action === 'ignore').length
        };
        
        stats.accept_rate = stats.total > 0 ? (stats.accepts / stats.total).toFixed(2) : 0;
        stats.override_rate = stats.total > 0 ? (stats.overrides / stats.total).toFixed(2) : 0;
        
        res.json({ stats });
    } catch (error) {
        console.error('Error fetching feedback stats:', error);
        res.status(500).json({ error: 'Failed to fetch feedback stats' });
    }
});

module.exports = router;
