/**
 * Plan Routes
 * Generates daily plans with compressed decision cards
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { generateDailyPlan } = require('../services/decisionEngine');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /plan/generate
 * Generate today's plan with compressed decision cards
 * Query param: ?force=true to regenerate even if plan exists
 */
router.post('/generate', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const forceRegenerate = req.query.force === 'true';
        
        // Check if plan already exists for today
        const { data: existingPlan } = await supabase
            .from('daily_plans')
            .select('*')
            .eq('user_id', req.userId)
            .eq('plan_date', today)
            .single();
        
        // If plan exists and not forcing regeneration, return existing
        if (existingPlan && !forceRegenerate) {
            return res.json({
                message: 'Plan already exists for today',
                plan: existingPlan,
                regenerated: false
            });
        }
        
        // If forcing regeneration, delete existing plan first
        if (existingPlan && forceRegenerate) {
            await supabase
                .from('daily_plans')
                .delete()
                .eq('id', existingPlan.id);
        }
        
        // Generate the plan using Decision Engine
        const planData = await generateDailyPlan(req.userId);
        
        // If no cards generated (no decisions), return early
        if (planData.cards.length === 0) {
            return res.json({
                message: planData.message || 'No plan generated',
                plan: null,
                cognitiveLoad: planData.cognitiveLoad,
                autonomyLevel: planData.autonomyLevel,
            });
        }
        
        // Fetch profile for context
        const { data: profile } = await supabase
            .from('profiles')
            .select('csp_vector')
            .eq('id', req.userId)
            .single();
        
        // Store the plan in database
        const { data: plan, error } = await supabase
            .from('daily_plans')
            .insert({
                user_id: req.userId,
                plan_date: today,
                compressed_decision_cards: planData.cards,
                cognitive_load: planData.cognitiveLoad,
                autonomy_level: planData.autonomyLevel,
                generation_context: {
                    csp_snapshot: profile?.csp_vector,
                    total_decisions: planData.totalDecisions,
                    generated_at: planData.generatedAt,
                }
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`[Plan] Generated plan for user ${req.userId} - ${planData.cards.length} cards, Load: ${planData.cognitiveLoad}, Level: ${planData.autonomyLevel}`);
        
        res.status(201).json({
            message: forceRegenerate ? 'Plan regenerated successfully' : 'Plan generated successfully',
            plan,
            regenerated: forceRegenerate,
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
