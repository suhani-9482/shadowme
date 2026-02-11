/**
 * Feedback Routes
 * Handles accept/override/ignore feedback and CSP updates
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { updateCspFromFeedback } = require('../services/cspLearning');

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
        
        console.log(`[Feedback] User ${req.userId} - Action: ${action}, Item: ${item_type}`);
        
        // Update CSP using the learning service
        const updatedCsp = await updateCspFromFeedback(req.userId, action, context || {});
        
        res.status(201).json({
            message: 'Feedback recorded',
            feedback,
            csp_updated: true,
            csp_snapshot: updatedCsp ? {
                accept_rate: updatedCsp.accept_rate,
                total_decisions: updatedCsp.total_decisions,
            } : null,
        });
    } catch (error) {
        console.error('Error recording feedback:', error);
        res.status(500).json({ error: 'Failed to record feedback' });
    }
});

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
