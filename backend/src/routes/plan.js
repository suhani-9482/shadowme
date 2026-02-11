/**
 * Plan Routes
 * Generates daily plans with compressed decision cards
 * 
 * NOTE: Person 2 (teammate) will implement the full decision engine logic.
 * This file provides the route structure and basic placeholder implementation.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /plan/generate
 * Generate today's plan with compressed decision cards
 * 
 * This is a placeholder - Person 2 will implement:
 * - Cognitive Load Meter calculation
 * - Decision Engine with CSP weights
 * - Compressed decision card generation
 */
router.post('/generate', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if plan already exists for today
        const { data: existingPlan } = await supabase
            .from('daily_plans')
            .select('*')
            .eq('user_id', req.userId)
            .eq('plan_date', today)
            .single();
        
        if (existingPlan) {
            return res.json({
                message: 'Plan already exists for today',
                plan: existingPlan,
                regenerated: false
            });
        }
        
        // Fetch user's profile and CSP
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.userId)
            .single();
        
        // Fetch user's active decisions
        const { data: decisions } = await supabase
            .from('decisions')
            .select('*')
            .eq('user_id', req.userId)
            .eq('active', true);
        
        // PLACEHOLDER: Basic plan generation
        // Person 2 will replace with full decision engine
        const cognitiveLoad = 50; // Placeholder
        const autonomyLevel = 'assist'; // Placeholder
        
        // Create placeholder compressed decision cards
        const compressedCards = [
            {
                id: 'card_1',
                title: 'Morning Block',
                recommended_action: 'Start your day',
                why: 'Based on your wake time preference',
                items: decisions?.filter(d => d.type === 'task').slice(0, 1) || [],
                autonomy_level: autonomyLevel
            }
        ];
        
        // Store the plan
        const { data: plan, error } = await supabase
            .from('daily_plans')
            .insert({
                user_id: req.userId,
                plan_date: today,
                compressed_decision_cards: compressedCards,
                cognitive_load: cognitiveLoad,
                autonomy_level: autonomyLevel,
                generation_context: {
                    profile_snapshot: profile?.csp_vector,
                    decisions_count: decisions?.length || 0,
                    generated_at: new Date().toISOString()
                }
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`[Plan] Generated plan for user ${req.userId} - Load: ${cognitiveLoad}, Autonomy: ${autonomyLevel}`);
        
        res.status(201).json({
            message: 'Plan generated successfully',
            plan,
            regenerated: false
        });
    } catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({ error: 'Failed to generate plan' });
    }
});

/**
 * GET /plan/today
 * Get today's plan
 */
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: plan, error } = await supabase
            .from('daily_plans')
            .select('*')
            .eq('user_id', req.userId)
            .eq('plan_date', today)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        if (!plan) {
            return res.json({ exists: false, plan: null });
        }
        
        res.json({ exists: true, plan });
    } catch (error) {
        console.error('Error fetching today plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
});

/**
 * POST /plan/accept
 * Mark the plan as accepted
 */
router.post('/accept', async (req, res) => {
    try {
        const { plan_id } = req.body;
        
        if (!plan_id) {
            return res.status(400).json({ error: 'plan_id is required' });
        }
        
        const { data: plan, error } = await supabase
            .from('daily_plans')
            .update({
                accepted: true,
                accepted_at: new Date().toISOString()
            })
            .eq('id', plan_id)
            .eq('user_id', req.userId)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ message: 'Plan accepted', plan });
    } catch (error) {
        console.error('Error accepting plan:', error);
        res.status(500).json({ error: 'Failed to accept plan' });
    }
});

/**
 * GET /plan/history
 * Get historical plans
 */
router.get('/history', async (req, res) => {
    try {
        const { limit = 7 } = req.query;
        
        const { data: plans, error } = await supabase
            .from('daily_plans')
            .select('*')
            .eq('user_id', req.userId)
            .order('plan_date', { ascending: false })
            .limit(parseInt(limit));
        
        if (error) throw error;
        
        res.json({ plans });
    } catch (error) {
        console.error('Error fetching plan history:', error);
        res.status(500).json({ error: 'Failed to fetch plan history' });
    }
});

module.exports = router;
