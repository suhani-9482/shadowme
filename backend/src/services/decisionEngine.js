/**
 * Decision Engine Service
 * 
 * PURPOSE:
 * The "brain" of ShadowMe. Takes user's decisions and CSP, then generates
 * a smart daily plan with compressed decision cards.
 * 
 * NOW WITH LEARNING:
 * - Uses CSP weights learned from past accept/override/ignore actions
 * - Considers past feedback history to avoid repeating rejected suggestions
 * - Adapts "why" explanations based on learned patterns
 * - Adjusts confidence based on suggestion success rate
 */

const supabase = require('../lib/supabase');
const { calculateCognitiveLoad } = require('./cognitiveLoad');

/**
 * Generate a daily plan for a user
 * @param {string} userId - The user's ID
 * @returns {object} - { cards, cognitiveLoad, autonomyLevel }
 */
async function generateDailyPlan(userId) {
    try {
        // Step 1: Get cognitive load and autonomy level
        const loadData = await calculateCognitiveLoad(userId);
        const { score: cognitiveLoad, autonomyLevel } = loadData;

        // Step 2: Fetch user's profile and CSP
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const csp = profile?.csp_vector || getDefaultCsp();

        // Step 3: Fetch user's active decisions
        const { data: decisions } = await supabase
            .from('decisions')
            .select('*')
            .eq('user_id', userId)
            .eq('active', true);

        if (!decisions || decisions.length === 0) {
            return {
                cards: [],
                cognitiveLoad,
                autonomyLevel,
                message: 'No active decisions found. Add some tasks, meals, or breaks first!',
            };
        }

        // Step 4: Fetch recent feedback to learn from
        const { data: recentFeedback } = await supabase
            .from('feedback')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        // Step 5: Filter decisions applicable today
        const today = new Date();
        const dayOfWeek = today.getDay();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const applicableDecisions = decisions.filter(d => {
            if (d.frequency === 'daily') return true;
            if (d.frequency === 'weekdays' && isWeekday) return true;
            if (d.frequency === 'weekends' && isWeekend) return true;
            if (d.frequency === 'weekly') return true;
            return false;
        });

        // Step 6: Score decisions using CSP and feedback history
        const currentHour = today.getHours();
        const scoredDecisions = applicableDecisions.map(d => ({
            ...d,
            score: scoreDecision(d, csp, currentHour, recentFeedback),
        })).sort((a, b) => b.score - a.score);

        // Step 7: Separate by type
        const tasks = scoredDecisions.filter(d => d.type === 'task');
        const meals = scoredDecisions.filter(d => d.type === 'meal');
        const breaks = scoredDecisions.filter(d => d.type === 'break');

        // Step 8: Generate compressed cards with learned preferences
        const cards = generateCompressedCards(tasks, meals, breaks, csp, currentHour, autonomyLevel, recentFeedback);

        // Log learning insights
        console.log(`[DecisionEngine] Generated ${cards.length} cards for user ${userId}`);
        console.log(`  - Load: ${cognitiveLoad}, Level: ${autonomyLevel}`);
        console.log(`  - CSP Accept Rate: ${((csp.accept_rate || 0) * 100).toFixed(0)}%`);
        console.log(`  - Morning Weight: ${(csp.morning_task_weight || 0.5).toFixed(2)}`);
        console.log(`  - High Effort Pref: ${(csp.high_effort_preference || 0.5).toFixed(2)}`);

        return {
            cards,
            cognitiveLoad,
            autonomyLevel,
            totalDecisions: applicableDecisions.length,
            generatedAt: new Date().toISOString(),
            learningInsights: {
                acceptRate: csp.accept_rate || 0,
                totalLearned: csp.total_decisions || 0,
                confidenceLevel: csp.suggestion_confidence || 0.5,
            },
        };

    } catch (error) {
        console.error('[DecisionEngine] Error generating plan:', error);
        throw error;
    }
}

/**
 * Score a decision based on CSP weights, current context, AND past feedback
 */
function scoreDecision(decision, csp, currentHour, recentFeedback = []) {
    let score = 50; // Base score

    // ===== TIME-BASED SCORING (LEARNED) =====
    if (currentHour >= 6 && currentHour < 12) {
        // Morning - use learned morning weight
        const morningWeight = csp.morning_task_weight || 0.5;
        score += morningWeight * 30; // Up to 30 points
        
        // Bonus if user has high accept rate for morning tasks
        if (morningWeight > 0.6) {
            score += 10; // Extra bonus for strong morning preference
        }
    } else if (currentHour >= 12 && currentHour < 17) {
        // Afternoon
        const afternoonWeight = csp.afternoon_task_weight || 0.5;
        score += afternoonWeight * 30;
    } else {
        // Evening/Night - typically lower weight
        const eveningWeight = csp.evening_task_weight || 0.3;
        score += eveningWeight * 30;
        
        // Penalize high-effort tasks in evening
        if (decision.effort && decision.effort >= 4) {
            score -= 15;
        }
    }

    // ===== EFFORT-BASED SCORING (LEARNED) =====
    if (decision.effort) {
        if (decision.effort >= 4) {
            // High effort task
            const highEffortPref = csp.high_effort_preference || 0.5;
            score += highEffortPref * 20;
            
            // If user consistently overrides high-effort, reduce score
            if (highEffortPref < 0.4) {
                score -= 10;
            }
        } else if (decision.effort <= 2) {
            // Low effort task
            const lowEffortPref = csp.low_effort_preference || 0.5;
            score += lowEffortPref * 20;
        }
    }

    // ===== PREFERRED TIME BOOST =====
    if (decision.preferred_time) {
        const prefHour = parseInt(decision.preferred_time.split(':')[0]);
        const hourDiff = Math.abs(currentHour - prefHour);
        if (hourDiff <= 1) {
            score += 35; // Big boost if within 1 hour
        } else if (hourDiff <= 2) {
            score += 25;
        } else if (hourDiff <= 3) {
            score += 10;
        }
    }

    // ===== MEAL TYPE TIMING =====
    if (decision.type === 'meal' && decision.meal_type) {
        if (decision.meal_type === 'breakfast' && currentHour >= 6 && currentHour < 10) {
            score += 35;
        } else if (decision.meal_type === 'lunch' && currentHour >= 11 && currentHour < 14) {
            score += 35;
        } else if (decision.meal_type === 'dinner' && currentHour >= 17 && currentHour < 21) {
            score += 35;
        } else if (decision.meal_type === 'snack') {
            score += 10;
        }
    }

    // ===== FEEDBACK HISTORY LEARNING =====
    if (recentFeedback && recentFeedback.length > 0) {
        // Check if this decision was recently overridden or ignored
        const decisionFeedback = recentFeedback.filter(f => 
            f.item_value?.includes(decision.title) || 
            f.context?.card_items?.includes(decision.title)
        );

        // Count recent actions for this decision
        const recentOverrides = decisionFeedback.filter(f => f.action === 'override').length;
        const recentAccepts = decisionFeedback.filter(f => f.action === 'accept').length;
        const recentIgnores = decisionFeedback.filter(f => f.action === 'ignore').length;

        // Boost if recently accepted
        if (recentAccepts > 0) {
            score += recentAccepts * 8; // +8 per recent accept
        }

        // Penalize if recently overridden
        if (recentOverrides > 0) {
            score -= recentOverrides * 12; // -12 per recent override
        }

        // Slight penalty for ignores
        if (recentIgnores > 0) {
            score -= recentIgnores * 5; // -5 per recent ignore
        }

        // Check if user chose this as an override alternative
        const chosenAsAlternative = recentFeedback.filter(f => 
            f.override_value === decision.title
        ).length;
        
        if (chosenAsAlternative > 0) {
            score += chosenAsAlternative * 15; // Big boost if user specifically chose this
        }
    }

    // ===== SUGGESTION CONFIDENCE ADJUSTMENT =====
    const confidence = csp.suggestion_confidence || 0.5;
    if (confidence < 0.3) {
        // Low confidence - be more conservative, favor user's explicit preferences
        if (decision.preferred_time) {
            score += 10; // Extra weight on explicit preferences
        }
    }

    // ===== PRIORITY TAGS =====
    if (decision.tags && decision.tags.length > 0) {
        if (decision.tags.includes('urgent')) score += 20;
        if (decision.tags.includes('important')) score += 15;
        if (decision.tags.includes('quick')) score += 5;
    }

    return Math.max(0, Math.round(score));
}

/**
 * Generate compressed decision cards with learning
 */
function generateCompressedCards(tasks, meals, breaks, csp, currentHour, autonomyLevel, recentFeedback) {
    const cards = [];
    const focusDuration = csp.focus_duration_preference || 50;

    // Adjust card count based on autonomy level AND confidence
    const confidence = csp.suggestion_confidence || 0.5;
    let maxCards;
    
    if (autonomyLevel === 'auto') {
        maxCards = 2;
    } else if (autonomyLevel === 'assist') {
        maxCards = confidence > 0.6 ? 3 : 4; // More confident = fewer cards needed
    } else {
        maxCards = 4;
    }

    const timePeriod = getTimePeriod(currentHour);

    // Card 1: Primary Focus Block
    const primaryTask = tasks[0];
    const primaryBreak = breaks[0];
    
    if (primaryTask || primaryBreak) {
        const card1Items = [];
        let totalDuration = 0;
        
        if (primaryTask) {
            card1Items.push({
                type: 'task',
                decision: primaryTask,
                action: `Focus on: ${primaryTask.title}`,
            });
            totalDuration += primaryTask.estimated_minutes || focusDuration;
        }
        
        // Include break based on CSP break preference
        const breakFreq = csp.break_frequency_weight || 0.5;
        if (primaryBreak && card1Items.length > 0 && breakFreq > 0.3) {
            card1Items.push({
                type: 'break',
                decision: primaryBreak,
                action: `Then: ${primaryBreak.title} (${primaryBreak.break_duration || 10}min)`,
            });
            totalDuration += primaryBreak.break_duration || 10;
        }

        if (card1Items.length > 0) {
            cards.push({
                id: 'card_1',
                title: `${timePeriod} Focus Block`,
                emoji: getCardEmoji(timePeriod, 'focus'),
                items: card1Items,
                duration: totalDuration,
                why: generateSmartWhy(primaryTask, csp, currentHour, recentFeedback),
                autonomy_level: autonomyLevel,
                priority: 'high',
            });
        }
    }

    // Card 2: Meal (if applicable and time-appropriate)
    const relevantMeal = meals[0];
    if (relevantMeal && cards.length < maxCards) {
        const mealRelevance = getMealRelevance(relevantMeal, currentHour);
        if (mealRelevance > 0.5) { // Only show if meal is relevant now
            cards.push({
                id: 'card_2',
                title: getMealCardTitle(relevantMeal, currentHour),
                emoji: getMealEmoji(relevantMeal.meal_type),
                items: [{
                    type: 'meal',
                    decision: relevantMeal,
                    action: relevantMeal.title,
                }],
                duration: 30,
                why: generateMealWhy(relevantMeal, csp),
                autonomy_level: autonomyLevel,
                priority: 'medium',
            });
        }
    }

    // Card 3: Secondary task (based on autonomy and confidence)
    const secondaryTask = tasks[1];
    if (secondaryTask && cards.length < maxCards) {
        const secondaryBreak = breaks[1] || breaks[0];
        const card3Items = [{
            type: 'task',
            decision: secondaryTask,
            action: `Next up: ${secondaryTask.title}`,
        }];
        
        let totalDuration = secondaryTask.estimated_minutes || focusDuration;
        
        // Add break if not in auto mode and break preference allows
        if (secondaryBreak && autonomyLevel !== 'auto' && (csp.break_frequency_weight || 0.5) > 0.3) {
            card3Items.push({
                type: 'break',
                decision: secondaryBreak,
                action: `Break: ${secondaryBreak.title}`,
            });
            totalDuration += secondaryBreak.break_duration || 10;
        }

        cards.push({
            id: 'card_3',
            title: 'Next Block',
            emoji: '📋',
            items: card3Items,
            duration: totalDuration,
            why: generateSmartWhy(secondaryTask, csp, currentHour, recentFeedback),
            autonomy_level: autonomyLevel,
            priority: 'medium',
        });
    }

    // Card 4: Evening Wind-down OR Catch-up (only in manual mode)
    if (cards.length < maxCards && autonomyLevel === 'manual') {
        if (currentHour >= 18) {
            // Evening wind-down
            const lightTask = tasks.find(t => t.effort && t.effort <= 2) || tasks[2];
            if (lightTask) {
                cards.push({
                    id: 'card_4',
                    title: 'Evening Wind-down',
                    emoji: '🌙',
                    items: [{
                        type: 'task',
                        decision: lightTask,
                        action: `Light task: ${lightTask.title}`,
                    }],
                    duration: lightTask.estimated_minutes || 20,
                    why: generateEveningWhy(csp),
                    autonomy_level: autonomyLevel,
                    priority: 'low',
                });
            }
        } else if (tasks.length > 2) {
            // Additional task during the day
            const thirdTask = tasks[2];
            cards.push({
                id: 'card_4',
                title: 'Bonus Block',
                emoji: '⭐',
                items: [{
                    type: 'task',
                    decision: thirdTask,
                    action: `Also: ${thirdTask.title}`,
                }],
                duration: thirdTask.estimated_minutes || 30,
                why: 'You have capacity for one more task today.',
                autonomy_level: autonomyLevel,
                priority: 'low',
            });
        }
    }

    return cards;
}

/**
 * Generate intelligent "why" explanation using learned patterns
 */
function generateSmartWhy(decision, csp, currentHour, recentFeedback) {
    if (!decision) return 'Based on your preferences.';

    const reasons = [];
    const acceptRate = csp.accept_rate || 0;

    // Time-based learned reason
    if (currentHour >= 6 && currentHour < 12) {
        const morningWeight = csp.morning_task_weight || 0.5;
        if (morningWeight > 0.6) {
            reasons.push('Your shadow noticed you\'re most productive in mornings');
        } else if (morningWeight > 0.5) {
            reasons.push('Morning is a good time for focused work');
        }
    } else if (currentHour >= 12 && currentHour < 17) {
        const afternoonWeight = csp.afternoon_task_weight || 0.5;
        if (afternoonWeight > 0.6) {
            reasons.push('You tend to handle tasks well in the afternoon');
        }
    } else {
        const eveningWeight = csp.evening_task_weight || 0.3;
        if (eveningWeight > 0.4 && decision.effort && decision.effort <= 2) {
            reasons.push('Light evening task matches your pattern');
        } else {
            reasons.push('Winding down for the evening');
        }
    }

    // Effort-based learned reason
    if (decision.effort >= 4 && (csp.high_effort_preference || 0.5) > 0.6) {
        reasons.push('you\'ve shown you can handle challenging tasks');
    }

    // Feedback-based reason
    if (recentFeedback && recentFeedback.length > 0) {
        const wasAccepted = recentFeedback.some(f => 
            f.action === 'accept' && 
            (f.item_value?.includes(decision.title) || f.context?.card_items?.includes(decision.title))
        );
        
        if (wasAccepted) {
            reasons.push('you accepted this recently');
        }

        const wasChosenAsAlt = recentFeedback.some(f => f.override_value === decision.title);
        if (wasChosenAsAlt) {
            reasons.push('you specifically chose this before');
        }
    }

    // Preferred time reason
    if (decision.preferred_time) {
        const prefHour = parseInt(decision.preferred_time.split(':')[0]);
        if (Math.abs(currentHour - prefHour) <= 2) {
            reasons.push('matches your preferred time');
        }
    }

    // High accept rate confidence
    if (acceptRate > 0.7 && reasons.length > 0) {
        // User trusts suggestions, add confidence marker
        reasons.unshift('Your shadow is confident');
    }

    // Priority tags
    if (decision.tags?.includes('urgent')) {
        reasons.push('marked urgent');
    } else if (decision.tags?.includes('important')) {
        reasons.push('marked as important');
    }

    if (reasons.length === 0) {
        return 'Based on your schedule and preferences.';
    }

    // Format nicely
    let why = reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1);
    if (reasons.length > 1) {
        why += ', ' + reasons.slice(1).join(', ');
    }
    return why + '.';
}

/**
 * Generate meal-specific why
 */
function generateMealWhy(meal, csp) {
    const acceptRate = csp.accept_rate || 0;
    
    if (acceptRate > 0.7) {
        return `Your shadow knows it's ${meal.meal_type || 'meal'} time.`;
    }
    
    return `It's ${meal.meal_type || 'meal'} time based on your schedule.`;
}

/**
 * Generate evening-specific why
 */
function generateEveningWhy(csp) {
    const eveningWeight = csp.evening_task_weight || 0.3;
    
    if (eveningWeight > 0.5) {
        return 'You sometimes do light tasks in the evening.';
    }
    
    return 'Winding down with a lighter task for the evening.';
}

/**
 * Get meal relevance score (0-1) based on current time
 */
function getMealRelevance(meal, currentHour) {
    if (!meal.meal_type) return 0.5;
    
    switch (meal.meal_type) {
        case 'breakfast':
            if (currentHour >= 6 && currentHour < 10) return 1.0;
            if (currentHour >= 10 && currentHour < 11) return 0.5;
            return 0.2;
        case 'lunch':
            if (currentHour >= 11 && currentHour < 14) return 1.0;
            if (currentHour >= 14 && currentHour < 15) return 0.5;
            return 0.2;
        case 'dinner':
            if (currentHour >= 17 && currentHour < 21) return 1.0;
            if (currentHour >= 16 && currentHour < 17) return 0.5;
            return 0.2;
        case 'snack':
            return 0.6; // Snacks always somewhat relevant
        default:
            return 0.5;
    }
}

/**
 * Get time period name
 */
function getTimePeriod(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

/**
 * Get contextual card emoji
 */
function getCardEmoji(timePeriod, type) {
    if (type === 'focus') {
        switch (timePeriod) {
            case 'Morning': return '🌅';
            case 'Afternoon': return '🎯';
            case 'Evening': return '🌆';
            default: return '🌙';
        }
    }
    return '📋';
}

/**
 * Get meal card title
 */
function getMealCardTitle(meal, currentHour) {
    if (meal.meal_type === 'breakfast') return 'Breakfast Time';
    if (meal.meal_type === 'lunch') return 'Lunch Break';
    if (meal.meal_type === 'dinner') return 'Dinner Time';
    if (meal.meal_type === 'snack') return 'Snack Break';
    return 'Meal Time';
}

/**
 * Get meal emoji
 */
function getMealEmoji(mealType) {
    switch (mealType) {
        case 'breakfast': return '🍳';
        case 'lunch': return '🥗';
        case 'dinner': return '🍽️';
        case 'snack': return '🍎';
        default: return '🍴';
    }
}

/**
 * Get default CSP values
 */
function getDefaultCsp() {
    return {
        morning_task_weight: 0.5,
        afternoon_task_weight: 0.5,
        evening_task_weight: 0.3,
        high_effort_preference: 0.5,
        low_effort_preference: 0.5,
        break_frequency_weight: 0.5,
        focus_duration_preference: 50,
        suggestion_confidence: 0.5,
        accept_rate: 0,
        total_decisions: 0,
    };
}

module.exports = {
    generateDailyPlan,
    scoreDecision,
};
