/**
 * Decisions Routes
 * CRUD operations for recurring decisions (tasks, meals, breaks)
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /decisions
 * List all decisions for the user
 * Query params: type (optional filter), active (optional filter)
 */
router.get('/', async (req, res) => {
    try {
        const { type, active } = req.query;
        
        let query = supabase
            .from('decisions')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });
        
        // Apply filters if provided
        if (type) {
            query = query.eq('type', type);
        }
        if (active !== undefined) {
            query = query.eq('active', active === 'true');
        }
        
        const { data: decisions, error } = await query;
        
        if (error) throw error;
        
        res.json({ decisions });
    } catch (error) {
        console.error('Error fetching decisions:', error);
        res.status(500).json({ error: 'Failed to fetch decisions' });
    }
});

/**
 * GET /decisions/:id
 * Get a single decision by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { data: decision, error } = await supabase
            .from('decisions')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Decision not found' });
            }
            throw error;
        }
        
        res.json({ decision });
    } catch (error) {
        console.error('Error fetching decision:', error);
        res.status(500).json({ error: 'Failed to fetch decision' });
    }
});

/**
 * POST /decisions
 * Create a new decision
 */
router.post('/', async (req, res) => {
    try {
        const {
            type,
            title,
            description,
            tags,
            effort,
            estimated_minutes,
            meal_type,
            break_duration,
            frequency,
            preferred_time,
            active
        } = req.body;
        
        // Validate required fields
        if (!type || !title) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['type', 'title']
            });
        }
        
        // Validate type
        if (!['task', 'meal', 'break'].includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid type',
                allowed: ['task', 'meal', 'break']
            });
        }
        
        // Build decision object
        const decisionData = {
            user_id: req.userId,
            type,
            title,
            description: description || null,
            tags: tags || [],
            frequency: frequency || 'daily',
            preferred_time: preferred_time || null,
            active: active !== undefined ? active : true
        };
        
        // Add type-specific fields
        if (type === 'task') {
            decisionData.effort = effort || 3; // default medium effort
            decisionData.estimated_minutes = estimated_minutes || 30;
        } else if (type === 'meal') {
            decisionData.meal_type = meal_type || null;
        } else if (type === 'break') {
            decisionData.break_duration = break_duration || 10;
        }
        
        const { data: decision, error } = await supabase
            .from('decisions')
            .insert(decisionData)
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({ 
            message: 'Decision created successfully',
            decision 
        });
    } catch (error) {
        console.error('Error creating decision:', error);
        res.status(500).json({ error: 'Failed to create decision' });
    }
});

/**
 * PUT /decisions/:id
 * Update a decision
 */
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        
        // Don't allow changing user_id
        delete updates.user_id;
        delete updates.id;
        
        const { data: decision, error } = await supabase
            .from('decisions')
            .update(updates)
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Decision not found' });
            }
            throw error;
        }
        
        res.json({ 
            message: 'Decision updated successfully',
            decision 
        });
    } catch (error) {
        console.error('Error updating decision:', error);
        res.status(500).json({ error: 'Failed to update decision' });
    }
});

/**
 * DELETE /decisions/:id
 * Delete a decision
 */
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('decisions')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);
        
        if (error) throw error;
        
        res.json({ message: 'Decision deleted successfully' });
    } catch (error) {
        console.error('Error deleting decision:', error);
        res.status(500).json({ error: 'Failed to delete decision' });
    }
});

module.exports = router;
