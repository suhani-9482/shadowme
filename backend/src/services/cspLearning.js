/**
 * CSP Learning Service
 * 
 * PURPOSE:
 * Updates the Cognitive Shadow Profile (CSP) based on user feedback.
 * This is the "learning" part of ShadowMe that makes it smarter over time.
 * 
 * HOW IT WORKS:
 * - When user ACCEPTS a suggestion, increase weights for that type/time/context
 * - When user OVERRIDES a suggestion, decrease weights and learn the preference
 * - When user IGNORES a suggestion, slightly decrease weights
 * 
 * LEARNING RATE: 0.1 (10% adjustment per action)
 * This prevents wild swings while still learning over time.
 */

const supabase = require('../lib/supabase');

// Learning rate - how much to adjust weights per action
const LEARNING_RATE = 0.1;

/**
 * Update CSP based on feedback action
 * @param {string} userId - User ID
 * @param {string} action - 'accept', 'override', or 'ignore'
 * @param {object} context - Additional context about the feedback
 */
async function updateCspFromFeedback(userId, action, context = {}) {
    try {
        // Fetch current profile and CSP
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error('[CSPLearning] Failed to fetch profile:', fetchError);
            return;
        }

        // Get current CSP or initialize default
        const csp = profile.csp_vector || getDefaultCsp();
        
        // Update counters
        csp.total_decisions = (csp.total_decisions || 0) + 1;
        
        if (action === 'accept') {
            csp.total_accepts = (csp.total_accepts || 0) + 1;
            await applyAcceptLearning(csp, context);
        } else if (action === 'override') {
            csp.total_overrides = (csp.total_overrides || 0) + 1;
            await applyOverrideLearning(csp, context);
        } else if (action === 'ignore') {
            csp.total_ignores = (csp.total_ignores || 0) + 1;
            await applyIgnoreLearning(csp, context);
        }

        // Update rates
        if (csp.total_decisions > 0) {
            csp.accept_rate = csp.total_accepts / csp.total_decisions;
            csp.override_rate = csp.total_overrides / csp.total_decisions;
            csp.ignore_rate = csp.total_ignores / csp.total_decisions;
        }

        // Update last learned timestamp
        csp.last_learned_at = new Date().toISOString();

        // Save updated CSP
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                csp_vector: csp,
                csp_last_updated: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('[CSPLearning] Failed to update CSP:', updateError);
            return;
        }

        console.log(`[CSPLearning] Updated CSP for user ${userId}:`, {
            action,
            total_decisions: csp.total_decisions,
            accept_rate: (csp.accept_rate * 100).toFixed(1) + '%',
            morning_weight: csp.morning_task_weight?.toFixed(2),
            afternoon_weight: csp.afternoon_task_weight?.toFixed(2),
            evening_weight: csp.evening_task_weight?.toFixed(2),
        });

        return csp;

    } catch (error) {
        console.error('[CSPLearning] Error:', error);
    }
}

/**
 * Apply learning when user ACCEPTS a suggestion
 * Increases weights for the accepted item's characteristics
 */
function applyAcceptLearning(csp, context) {
    const hour = new Date().getHours();
    
    // Time-based learning: increase weight for current time period
    if (hour >= 6 && hour < 12) {
        csp.morning_task_weight = clamp(
            (csp.morning_task_weight || 0.5) + LEARNING_RATE
        );
    } else if (hour >= 12 && hour < 17) {
        csp.afternoon_task_weight = clamp(
            (csp.afternoon_task_weight || 0.5) + LEARNING_RATE
        );
    } else {
        csp.evening_task_weight = clamp(
            (csp.evening_task_weight || 0.3) + LEARNING_RATE
        );
    }

    // If card items included high-effort tasks, increase preference
    if (context.card_items?.some(item => item?.includes('Focus') || item?.includes('Deep'))) {
        csp.high_effort_preference = clamp(
            (csp.high_effort_preference || 0.5) + LEARNING_RATE * 0.5
        );
    }

    // Track successful suggestion patterns
    csp.consecutive_accepts = (csp.consecutive_accepts || 0) + 1;
    csp.consecutive_overrides = 0;
    
    // If many consecutive accepts, boost confidence
    if (csp.consecutive_accepts >= 3) {
        csp.suggestion_confidence = clamp(
            (csp.suggestion_confidence || 0.5) + LEARNING_RATE
        );
    }
}

/**
 * Apply learning when user OVERRIDES a suggestion
 * Decreases weights for the rejected item and learns the preference
 */
function applyOverrideLearning(csp, context) {
    const hour = new Date().getHours();
    
    // Time-based learning: decrease weight for current time period
    // (user didn't like the suggestion at this time)
    if (hour >= 6 && hour < 12) {
        csp.morning_task_weight = clamp(
            (csp.morning_task_weight || 0.5) - LEARNING_RATE
        );
    } else if (hour >= 12 && hour < 17) {
        csp.afternoon_task_weight = clamp(
            (csp.afternoon_task_weight || 0.5) - LEARNING_RATE
        );
    } else {
        csp.evening_task_weight = clamp(
            (csp.evening_task_weight || 0.3) - LEARNING_RATE
        );
    }

    // If high cognitive load when override, user prefers more control
    if (context.cognitive_load > 66) {
        csp.high_load_override_tendency = clamp(
            (csp.high_load_override_tendency || 0.5) + LEARNING_RATE
        );
    }

    // Track override patterns
    csp.consecutive_overrides = (csp.consecutive_overrides || 0) + 1;
    csp.consecutive_accepts = 0;

    // If many consecutive overrides, decrease confidence
    if (csp.consecutive_overrides >= 3) {
        csp.suggestion_confidence = clamp(
            (csp.suggestion_confidence || 0.5) - LEARNING_RATE
        );
    }

    // Learn from the chosen alternative
    if (context.chosen_alternative) {
        csp.preferred_alternatives = csp.preferred_alternatives || [];
        csp.preferred_alternatives.push({
            original: context.original_items,
            chosen: context.chosen_alternative,
            time: hour,
            cognitive_load: context.cognitive_load,
        });
        // Keep only last 20 preferences
        if (csp.preferred_alternatives.length > 20) {
            csp.preferred_alternatives = csp.preferred_alternatives.slice(-20);
        }
    }
}

/**
 * Apply learning when user IGNORES a suggestion
 * Slightly decreases weights (less impactful than override)
 */
function applyIgnoreLearning(csp, context) {
    const hour = new Date().getHours();
    
    // Smaller decrease for ignore (user might just be busy)
    const ignoreRate = LEARNING_RATE * 0.3;
    
    if (hour >= 6 && hour < 12) {
        csp.morning_task_weight = clamp(
            (csp.morning_task_weight || 0.5) - ignoreRate
        );
    } else if (hour >= 12 && hour < 17) {
        csp.afternoon_task_weight = clamp(
            (csp.afternoon_task_weight || 0.5) - ignoreRate
        );
    } else {
        csp.evening_task_weight = clamp(
            (csp.evening_task_weight || 0.3) - ignoreRate
        );
    }

    // Track ignores - if too many, maybe suggestions are not relevant
    csp.consecutive_ignores = (csp.consecutive_ignores || 0) + 1;
    
    if (csp.consecutive_ignores >= 5) {
        // User is ignoring a lot - might need to refresh approach
        csp.needs_recalibration = true;
    }
}

/**
 * Clamp value between 0 and 1
 */
function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Get default CSP values
 */
function getDefaultCsp() {
    return {
        // Time-based weights
        morning_task_weight: 0.5,
        afternoon_task_weight: 0.5,
        evening_task_weight: 0.3,
        
        // Effort preferences
        high_effort_preference: 0.5,
        low_effort_preference: 0.5,
        
        // Break preferences
        break_frequency_weight: 0.5,
        
        // Focus duration (in minutes)
        focus_duration_preference: 50,
        
        // Counters
        total_decisions: 0,
        total_accepts: 0,
        total_overrides: 0,
        total_ignores: 0,
        
        // Rates
        accept_rate: 0,
        override_rate: 0,
        ignore_rate: 0,
        
        // Streaks
        consecutive_accepts: 0,
        consecutive_overrides: 0,
        consecutive_ignores: 0,
        
        // Confidence
        suggestion_confidence: 0.5,
        
        // Metadata
        last_learned_at: null,
    };
}

module.exports = {
    updateCspFromFeedback,
    getDefaultCsp,
};
