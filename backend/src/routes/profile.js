/**
 * Profile Routes
 * Handles profile checking and creation with CSP initialization
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { calculateCognitiveLoad, getAutonomyDescription } = require('../services/cognitiveLoad');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /profile
 * Check if user has a profile (used to determine onboarding status)
 */
router.get('/', async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.userId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            throw error;
        }
        
        if (!profile) {
            return res.json({ exists: false, profile: null });
        }
        
        res.json({ exists: true, profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * POST /profile
 * Create user profile with onboarding data and initialize CSP
 */
router.post('/', async (req, res) => {
    try {
        const {
            wake_time,
            sleep_time,
            peak_focus_start,
            peak_focus_end,
            diet_preference,
            work_style,
            break_preference
        } = req.body;
        
        // Initialize CSP vector based on onboarding preferences
        // This is the initial behavioral vector that will be updated through learning
        const initialCspVector = {
            // Time-based weights (adjusted based on wake/sleep times)
            morning_task_weight: 0.5,
            afternoon_task_weight: 0.5,
            evening_task_weight: 0.3,
            
            // Effort preferences (will be learned)
            high_effort_preference: work_style === 'deep_work' ? 0.7 : 0.5,
            low_effort_preference: work_style === 'flexible' ? 0.6 : 0.5,
            
            // Break and meal patterns
            break_frequency_weight: break_preference === 'short' ? 0.6 : 0.4,
            meal_regularity_weight: 0.5,
            
            // Focus duration (minutes) - based on work style
            focus_duration_preference: work_style === 'deep_work' ? 90 : 
                                       work_style === 'structured' ? 50 : 30,
            
            // Context weights (busy vs free calendar)
            context_busy_weight: 0.5,
            context_free_weight: 0.5,
            
            // Feedback tracking (for learning)
            accept_rate: 0.5,
            override_rate: 0.0,
            total_decisions: 0,
            total_accepts: 0,
            total_overrides: 0,
            total_ignores: 0
        };
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
                id: req.userId,
                wake_time: wake_time || '07:00',
                sleep_time: sleep_time || '23:00',
                peak_focus_start: peak_focus_start || '09:00',
                peak_focus_end: peak_focus_end || '12:00',
                diet_preference: diet_preference || 'balanced',
                work_style: work_style || 'flexible',
                break_preference: break_preference || 'short',
                csp_vector: initialCspVector,
                csp_last_updated: new Date().toISOString(),
                onboarding_completed: true
            })
            .select()
            .single();
        
        if (error) {
            // Check if profile already exists
            if (error.code === '23505') { // unique violation
                return res.status(409).json({ error: 'Profile already exists' });
            }
            throw error;
        }
        
        console.log(`[CSP] Initialized CSP for user ${req.userId}:`, initialCspVector);
        
        res.status(201).json({ 
            message: 'Profile created successfully',
            profile 
        });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
});

/**
 * PUT /profile
 * Update user profile
 */
router.put('/', async (req, res) => {
    try {
        const updates = req.body;
        
        // Don't allow direct CSP updates through this endpoint
        delete updates.csp_vector;
        delete updates.id;
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', req.userId)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ message: 'Profile updated', profile });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * GET /profile/cognitive-load
 * Get current cognitive load score and autonomy level
 */
router.get('/cognitive-load', async (req, res) => {
    try {
        const result = await calculateCognitiveLoad(req.userId);
        result.description = getAutonomyDescription(result.autonomyLevel);
        res.json(result);
    } catch (error) {
        console.error('Error calculating cognitive load:', error);
        res.status(500).json({ error: 'Failed to calculate cognitive load' });
    }
});

/**
 * GET /profile/csp
 * Get CSP vector (for debugging/display)
 */
router.get('/csp', async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('csp_vector, csp_last_updated')
            .eq('id', req.userId)
            .single();
        
        if (error) throw error;
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json({ 
            csp_vector: profile.csp_vector,
            last_updated: profile.csp_last_updated
        });
    } catch (error) {
        console.error('Error fetching CSP:', error);
        res.status(500).json({ error: 'Failed to fetch CSP' });
    }
});

module.exports = router;
