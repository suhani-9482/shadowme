/**
 * Cognitive Load Service
 * 
 * PURPOSE:
 * Calculates how mentally tired/overwhelmed the user is on a scale of 0-100.
 * This score determines the autonomy level (how much ShadowMe takes over).
 * 
 * HOW IT WORKS:
 * The score is calculated from 4 factors:
 * 1. Decisions made today (0-30 points) - More decisions = more fatigue
 * 2. Override rate today (0-25 points) - More overrides = suggestions were wrong = more mental work
 * 3. Time on site today (0-20 points) - Longer sessions = more fatigue
 * 4. Time of day (0-25 points) - Evening = more tired than morning
 * 
 * AUTONOMY LEVELS:
 * - 0-33: "manual" - User is fresh, show all options
 * - 34-66: "assist" - Balanced, show recommendations but allow changes
 * - 67-100: "auto" - User is tired, strong defaults, minimal choices
 */

const supabase = require('../lib/supabase');

/**
 * Calculate cognitive load score for a user
 * @param {string} userId - The user's ID
 * @returns {object} - { score, autonomyLevel, breakdown }
 */
async function calculateCognitiveLoad(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Initialize breakdown for transparency
    const breakdown = {
        decisions: { value: 0, max: 30, count: 0 },
        overrides: { value: 0, max: 25, rate: 0 },
        timeOnSite: { value: 0, max: 20, minutes: 0 },
        timeOfDay: { value: 0, max: 25, hour: new Date().getHours() },
    };

    try {
        // --- FACTOR 1: Decisions made today (0-30 points) ---
        const { data: feedbackToday } = await supabase
            .from('feedback')
            .select('action')
            .eq('user_id', userId)
            .gte('created_at', todayISO);

        const decisionCount = feedbackToday?.length || 0;
        breakdown.decisions.count = decisionCount;
        // 0 decisions = 0 points, 10+ decisions = 30 points
        breakdown.decisions.value = Math.min(30, Math.round((decisionCount / 10) * 30));

        // --- FACTOR 2: Override rate today (0-25 points) ---
        if (decisionCount > 0) {
            const overrideCount = feedbackToday.filter(f => f.action === 'override').length;
            const overrideRate = overrideCount / decisionCount;
            breakdown.overrides.rate = Math.round(overrideRate * 100);
            // 0% overrides = 0 points, 50%+ overrides = 25 points
            breakdown.overrides.value = Math.min(25, Math.round((overrideRate / 0.5) * 25));
        }

        // --- FACTOR 3: Time on site today (0-20 points) ---
        const { data: events } = await supabase
            .from('interaction_events')
            .select('metadata')
            .eq('user_id', userId)
            .eq('event_type', 'session_end')
            .gte('timestamp', todayISO);

        // Sum up all session durations
        const totalTimeMs = events?.reduce((sum, e) => {
            return sum + (e.metadata?.total_duration_ms || 0);
        }, 0) || 0;
        
        const totalMinutes = Math.round(totalTimeMs / 60000);
        breakdown.timeOnSite.minutes = totalMinutes;
        // 0-15 min = 0 points, 60+ min = 20 points
        breakdown.timeOnSite.value = Math.min(20, Math.round(Math.max(0, (totalMinutes - 15) / 45) * 20));

        // --- FACTOR 4: Time of day (0-25 points) ---
        const hour = new Date().getHours();
        breakdown.timeOfDay.hour = hour;
        
        if (hour >= 6 && hour < 12) {
            // Morning: 0-5 points (fresh)
            breakdown.timeOfDay.value = Math.round(((hour - 6) / 6) * 5);
        } else if (hour >= 12 && hour < 17) {
            // Afternoon: 10-15 points (moderate)
            breakdown.timeOfDay.value = 10 + Math.round(((hour - 12) / 5) * 5);
        } else if (hour >= 17 && hour < 21) {
            // Evening: 15-20 points (tired)
            breakdown.timeOfDay.value = 15 + Math.round(((hour - 17) / 4) * 5);
        } else {
            // Night: 20-25 points (very tired)
            breakdown.timeOfDay.value = 20 + Math.min(5, hour >= 21 ? hour - 21 : 5);
        }

        // --- CALCULATE TOTAL SCORE ---
        const score = Math.min(100,
            breakdown.decisions.value +
            breakdown.overrides.value +
            breakdown.timeOnSite.value +
            breakdown.timeOfDay.value
        );

        // --- DETERMINE AUTONOMY LEVEL ---
        let autonomyLevel;
        if (score <= 33) {
            autonomyLevel = 'manual';
        } else if (score <= 66) {
            autonomyLevel = 'assist';
        } else {
            autonomyLevel = 'auto';
        }

        console.log(`[CognitiveLoad] User ${userId}: Score=${score}, Level=${autonomyLevel}`, breakdown);

        return {
            score,
            autonomyLevel,
            breakdown,
            calculatedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('[CognitiveLoad] Error calculating:', error);
        // Return default values on error
        return {
            score: 50,
            autonomyLevel: 'assist',
            breakdown,
            error: error.message,
            calculatedAt: new Date().toISOString(),
        };
    }
}

/**
 * Get autonomy level description
 */
function getAutonomyDescription(level) {
    switch (level) {
        case 'manual':
            return 'You\'re fresh! Full control mode - all options available.';
        case 'assist':
            return 'Balanced mode - I\'ll suggest, you decide.';
        case 'auto':
            return 'You seem tired. I\'ll handle the routine stuff.';
        default:
            return 'Assist mode active.';
    }
}

module.exports = {
    calculateCognitiveLoad,
    getAutonomyDescription,
};
