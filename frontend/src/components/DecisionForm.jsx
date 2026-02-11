/**
 * Decision Form Component - Redesigned for Easy & Fun Input
 * 
 * Features:
 * - Quick-add with smart detection
 * - One-click preset templates
 * - Visual effort selector (dots instead of dropdown)
 * - Clickable tag chips
 * - Collapsible advanced options
 * - Theme support (dark/light mode)
 */
import { useState } from 'react';
import { useToast } from './Toast';
import { sounds } from '../lib/sounds';
import { useTheme } from '../context/ThemeContext';

// Preset templates for quick adding - expanded with more options
const PRESETS = {
    task: [
        { title: 'Deep focus work', effort: 4, estimated_minutes: 90, tags: ['work', 'focus'] },
        { title: 'Quick emails', effort: 2, estimated_minutes: 15, tags: ['work', 'quick'] },
        { title: 'Team meeting', effort: 3, estimated_minutes: 60, tags: ['work'] },
        { title: 'Code review', effort: 3, estimated_minutes: 45, tags: ['work'] },
        { title: 'Learning time', effort: 3, estimated_minutes: 60, tags: ['growth'] },
        { title: 'Exercise/Workout', effort: 4, estimated_minutes: 45, tags: ['health'] },
        { title: 'Creative work', effort: 4, estimated_minutes: 60, tags: ['creative', 'focus'] },
        { title: 'Admin tasks', effort: 2, estimated_minutes: 30, tags: ['work', 'quick'] },
    ],
    meal: [
        { title: 'Healthy breakfast', meal_type: 'breakfast', tags: ['healthy'] },
        { title: 'Quick lunch', meal_type: 'lunch', tags: ['quick'] },
        { title: 'Dinner time', meal_type: 'dinner', tags: [] },
        { title: 'Afternoon snack', meal_type: 'snack', tags: ['energy'] },
        { title: 'Smoothie/Shake', meal_type: 'snack', tags: ['healthy', 'quick'] },
        { title: 'Protein meal', meal_type: 'lunch', tags: ['healthy'] },
    ],
    break: [
        { title: 'Coffee break ☕', break_duration: 10, tags: ['energy'] },
        { title: 'Tea time 🍵', break_duration: 15, tags: ['energy', 'relax'] },
        { title: 'Quick stretch 🧘', break_duration: 5, tags: ['health', 'quick'] },
        { title: 'Walk outside 🚶', break_duration: 15, tags: ['health', 'energy'] },
        { title: 'Power nap 😴', break_duration: 20, tags: ['rest'] },
        { title: 'Meditation 🧘‍♀️', break_duration: 10, tags: ['mindfulness'] },
        { title: 'Eye rest 👀', break_duration: 5, tags: ['health', 'quick'] },
        { title: 'Fresh air break 🌿', break_duration: 10, tags: ['energy'] },
        { title: 'Social chat 💬', break_duration: 15, tags: ['personal'] },
        { title: 'Music break 🎵', break_duration: 10, tags: ['relax'] },
        { title: 'Hydration break 💧', break_duration: 5, tags: ['health', 'quick'] },
        { title: 'Long walk 🏃', break_duration: 30, tags: ['health', 'energy'] },
    ],
};

// Suggested tags - expanded
const SUGGESTED_TAGS = ['work', 'personal', 'health', 'urgent', 'quick', 'focus', 'energy', 'creative', 'relax', 'mindfulness'];

export const DecisionForm = ({ onSubmit, onCancel, initialData = null }) => {
    const toast = useToast();
    const { currentTheme, isDark } = useTheme();
    
    const [formData, setFormData] = useState({
        type: initialData?.type || 'task',
        title: initialData?.title || '',
        description: initialData?.description || '',
        tags: initialData?.tags || [],
        effort: initialData?.effort || 3,
        estimated_minutes: initialData?.estimated_minutes || 30,
        meal_type: initialData?.meal_type || 'lunch',
        break_duration: initialData?.break_duration || 10,
        frequency: initialData?.frequency || 'daily',
        preferred_time: initialData?.preferred_time || '',
        active: initialData?.active ?? true,
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [quickInput, setQuickInput] = useState('');

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag) 
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    // Smart detection from quick input
    const handleQuickInput = (value) => {
        setQuickInput(value);
        
        const lowerVal = value.toLowerCase();
        
        // ===== BREAK DETECTION (check first - most specific) =====
        const breakKeywords = [
            // Direct break words
            'break', 'rest', 'pause', 'relax', 'chill', 'unwind',
            // Beverages
            'coffee', 'tea', 'chai', 'water', 'hydrate', 'drink',
            // Physical activities
            'walk', 'walking', 'stretch', 'stretching', 'exercise', 'workout', 'gym',
            'yoga', 'meditate', 'meditation', 'breathe', 'breathing',
            // Rest activities
            'nap', 'power nap', 'sleep', 'siesta',
            // Social/Fun
            'chat', 'socialize', 'music', 'podcast', 'scroll', 'browse',
            // Outdoor
            'fresh air', 'outside', 'sunshine', 'nature',
            // Short activities
            'quick break', 'short break', '5 min', '10 min', '15 min',
            'step away', 'step outside', 'take a breather',
            // Eye/Screen breaks
            'eye break', 'screen break', 'look away', 'rest eyes',
        ];
        
        // ===== MEAL DETECTION =====
        const mealKeywords = [
            // Main meals
            'breakfast', 'lunch', 'dinner', 'brunch', 'supper',
            // Snacks
            'snack', 'snacking', 'munch', 'nibble', 'bite',
            // Food words
            'meal', 'food', 'eat', 'eating', 'hungry', 'feed',
            // Cooking
            'cook', 'cooking', 'prepare food', 'make food',
            // Specific foods (common ones)
            'sandwich', 'salad', 'soup', 'pizza', 'pasta', 'rice',
            'fruit', 'fruits', 'veggies', 'vegetables',
            'smoothie', 'shake', 'juice',
            // Health related
            'healthy meal', 'light meal', 'heavy meal',
            'protein', 'vitamins',
        ];
        
        // Check for breaks first (more specific patterns)
        const isBreak = breakKeywords.some(keyword => lowerVal.includes(keyword));
        const isMeal = mealKeywords.some(keyword => lowerVal.includes(keyword));
        
        if (isBreak && !isMeal) {
            updateForm('type', 'break');
            // Auto-detect break duration
            if (lowerVal.includes('5 min') || lowerVal.includes('quick')) {
                updateForm('break_duration', 5);
            } else if (lowerVal.includes('10 min')) {
                updateForm('break_duration', 10);
            } else if (lowerVal.includes('15 min') || lowerVal.includes('short')) {
                updateForm('break_duration', 15);
            } else if (lowerVal.includes('20 min') || lowerVal.includes('nap')) {
                updateForm('break_duration', 20);
            } else if (lowerVal.includes('30 min') || lowerVal.includes('long') || lowerVal.includes('walk') || lowerVal.includes('exercise')) {
                updateForm('break_duration', 30);
            }
        } else if (isMeal) {
            updateForm('type', 'meal');
            // Auto-detect meal type
            if (lowerVal.includes('breakfast') || lowerVal.includes('morning')) {
                updateForm('meal_type', 'breakfast');
            } else if (lowerVal.includes('lunch') || lowerVal.includes('midday') || lowerVal.includes('noon')) {
                updateForm('meal_type', 'lunch');
            } else if (lowerVal.includes('dinner') || lowerVal.includes('supper') || lowerVal.includes('evening meal')) {
                updateForm('meal_type', 'dinner');
            } else if (lowerVal.includes('snack') || lowerVal.includes('munch') || lowerVal.includes('bite') || lowerVal.includes('fruit')) {
                updateForm('meal_type', 'snack');
            } else if (lowerVal.includes('brunch')) {
                updateForm('meal_type', 'breakfast'); // Closest match
            }
        } else {
            // Default to task
            updateForm('type', 'task');
            // Auto-detect effort level for tasks
            if (lowerVal.includes('deep') || lowerVal.includes('focus') || lowerVal.includes('complex') || lowerVal.includes('hard')) {
                updateForm('effort', 4);
            } else if (lowerVal.includes('quick') || lowerVal.includes('easy') || lowerVal.includes('simple')) {
                updateForm('effort', 2);
            }
        }
        
        // ===== AUTO-DETECT TAGS =====
        const detectedTags = [];
        
        // Urgency
        if (lowerVal.includes('urgent') || lowerVal.includes('asap') || lowerVal.includes('important') || lowerVal.includes('priority')) {
            detectedTags.push('urgent');
        }
        // Speed
        if (lowerVal.includes('quick') || lowerVal.includes('fast') || lowerVal.includes('brief')) {
            detectedTags.push('quick');
        }
        // Focus
        if (lowerVal.includes('focus') || lowerVal.includes('deep') || lowerVal.includes('concentrate')) {
            detectedTags.push('focus');
        }
        // Work
        if (lowerVal.includes('work') || lowerVal.includes('meeting') || lowerVal.includes('email') || 
            lowerVal.includes('call') || lowerVal.includes('project') || lowerVal.includes('report') ||
            lowerVal.includes('presentation') || lowerVal.includes('deadline')) {
            detectedTags.push('work');
        }
        // Health
        if (lowerVal.includes('health') || lowerVal.includes('exercise') || lowerVal.includes('workout') ||
            lowerVal.includes('gym') || lowerVal.includes('yoga') || lowerVal.includes('meditat') ||
            lowerVal.includes('walk') || lowerVal.includes('run') || lowerVal.includes('stretch')) {
            detectedTags.push('health');
        }
        // Personal
        if (lowerVal.includes('personal') || lowerVal.includes('family') || lowerVal.includes('friend') ||
            lowerVal.includes('hobby') || lowerVal.includes('fun') || lowerVal.includes('relax')) {
            detectedTags.push('personal');
        }
        // Energy
        if (lowerVal.includes('energy') || lowerVal.includes('boost') || lowerVal.includes('refresh') ||
            lowerVal.includes('recharge') || lowerVal.includes('coffee') || lowerVal.includes('tea')) {
            detectedTags.push('energy');
        }
        // Creative
        if (lowerVal.includes('creative') || lowerVal.includes('design') || lowerVal.includes('write') ||
            lowerVal.includes('brainstorm') || lowerVal.includes('idea')) {
            detectedTags.push('creative');
        }
        
        if (detectedTags.length > 0) {
            updateForm('tags', [...new Set(detectedTags)]); // Remove duplicates
        }
        
        updateForm('title', value);
    };

    // Apply a preset
    const applyPreset = (preset) => {
        sounds.click();
        setFormData(prev => ({
            ...prev,
            ...preset,
            frequency: 'daily',
            active: true,
        }));
        setQuickInput(preset.title);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const processedData = {
                ...formData,
                preferred_time: formData.preferred_time || null,
            };

            // Remove type-specific fields that don't apply
            if (processedData.type !== 'task') {
                delete processedData.effort;
                delete processedData.estimated_minutes;
            }
            if (processedData.type !== 'meal') {
                delete processedData.meal_type;
            }
            if (processedData.type !== 'break') {
                delete processedData.break_duration;
            }

            await onSubmit(processedData);
            sounds.add(); // Play add sound
            toast.success(`Added: ${formData.title}`);
            
            // Reset form
            setQuickInput('');
            setFormData({
                type: 'task',
                title: '',
                description: '',
                tags: [],
                effort: 3,
                estimated_minutes: 30,
                meal_type: 'lunch',
                break_duration: 10,
                frequency: 'daily',
                preferred_time: '',
                active: true,
            });
        } catch (err) {
            setError(err.message);
            sounds.error();
            toast.error('Failed to add decision');
        } finally {
            setLoading(false);
        }
    };

    const typeConfig = {
        task: { emoji: '📋', color: '#4F46E5', label: 'Task' },
        meal: { emoji: '🍽️', color: '#10B981', label: 'Meal' },
        break: { emoji: '☕', color: '#F59E0B', label: 'Break' },
    };

    // Theme-aware dynamic styles
    const themedForm = {
        ...styles.form,
        backgroundColor: currentTheme.cardBg,
        borderColor: currentTheme.border,
        boxShadow: currentTheme.shadow,
    };
    
    const themedFormTitle = {
        ...styles.formTitle,
        color: currentTheme.textPrimary,
    };
    
    const themedQuickInputWrapper = {
        ...styles.quickInputWrapper,
        backgroundColor: currentTheme.inputBg,
        borderColor: currentTheme.inputBorder,
    };
    
    const themedQuickInput = {
        ...styles.quickInput,
        color: currentTheme.textPrimary,
    };
    
    const themedOptionBox = {
        ...styles.optionBox,
        backgroundColor: isDark ? currentTheme.backgroundSecondary : '#F9FAFB',
    };

    return (
        <form onSubmit={handleSubmit} style={themedForm}>
            {/* Header */}
            <div style={styles.header}>
                <h3 style={themedFormTitle}>
                    {initialData ? '✏️ Edit Decision' : '✨ Add Decision'}
                </h3>
                {onCancel && (
                    <button type="button" onClick={onCancel} style={{
                        ...styles.closeBtn,
                        color: currentTheme.textMuted,
                    }}>
                        ✕
                    </button>
                )}
            </div>

            {error && <div style={styles.error}>⚠️ {error}</div>}

            {/* Quick Input */}
            <div style={styles.quickInputSection} data-guide="quick-input">
                <div style={themedQuickInputWrapper}>
                    <span style={styles.quickInputIcon}>⚡</span>
                    <input
                        type="text"
                        value={quickInput}
                        onChange={(e) => handleQuickInput(e.target.value)}
                        placeholder="Type anything... e.g., 'Morning coffee break'"
                        style={themedQuickInput}
                        autoFocus
                    />
                </div>
                <p style={{...styles.quickHint, color: currentTheme.textMuted}}>
                    Smart detection: I'll figure out if it's a task, meal, or break!
                </p>
            </div>

            {/* Type Pills - Auto-selected but can override */}
            <div style={styles.typePills}>
                {Object.entries(typeConfig).map(([type, config]) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => updateForm('type', type)}
                        style={{
                            ...styles.typePill,
                            backgroundColor: formData.type === type ? config.color : '#F3F4F6',
                            color: formData.type === type ? 'white' : '#6B7280',
                            transform: formData.type === type ? 'scale(1.05)' : 'scale(1)',
                        }}
                    >
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                    </button>
                ))}
            </div>

            {/* Quick Presets */}
            {!initialData && (
                <div style={styles.presetsSection} data-guide="presets">
                    <p style={styles.presetsLabel}>⚡ Quick add:</p>
                    <div style={styles.presetChips}>
                        {PRESETS[formData.type].slice(0, 4).map((preset, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                style={styles.presetChip}
                            >
                                {preset.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            <div style={styles.tagsSection}>
                <p style={styles.tagsLabel}>🏷️ Tags:</p>
                <div style={styles.tagChips}>
                    {SUGGESTED_TAGS.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            style={{
                                ...styles.tagChip,
                                backgroundColor: formData.tags.includes(tag) ? '#4F46E5' : '#F3F4F6',
                                color: formData.tags.includes(tag) ? 'white' : '#6B7280',
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Type-specific options - Always visible but compact */}
            {formData.type === 'task' && (
                <div style={styles.optionsRow}>
                    {/* Visual Effort Selector */}
                    <div style={styles.optionBox}>
                        <span style={styles.optionLabel}>Effort</span>
                        <div style={styles.effortDots}>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => updateForm('effort', level)}
                                    style={{
                                        ...styles.effortDot,
                                        backgroundColor: level <= formData.effort 
                                            ? level <= 2 ? '#10B981' : level <= 3 ? '#F59E0B' : '#EF4444'
                                            : '#E5E7EB',
                                        transform: level === formData.effort ? 'scale(1.2)' : 'scale(1)',
                                    }}
                                    title={['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'][level - 1]}
                                />
                            ))}
                        </div>
                        <span style={styles.effortLabel}>
                            {['', 'Easy', 'Light', 'Medium', 'Hard', 'Intense'][formData.effort]}
                        </span>
                    </div>

                    {/* Time Quick Select */}
                    <div style={styles.optionBox}>
                        <span style={styles.optionLabel}>Duration</span>
                        <div style={styles.timeChips}>
                            {[15, 30, 60, 90].map((mins) => (
                                <button
                                    key={mins}
                                    type="button"
                                    onClick={() => updateForm('estimated_minutes', mins)}
                                    style={{
                                        ...styles.timeChip,
                                        backgroundColor: formData.estimated_minutes === mins ? '#4F46E5' : '#F3F4F6',
                                        color: formData.estimated_minutes === mins ? 'white' : '#6B7280',
                                    }}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {formData.type === 'meal' && (
                <div style={styles.mealTypes}>
                    {[
                        { value: 'breakfast', emoji: '🍳', label: 'Breakfast' },
                        { value: 'lunch', emoji: '🥗', label: 'Lunch' },
                        { value: 'dinner', emoji: '🍽️', label: 'Dinner' },
                        { value: 'snack', emoji: '🍎', label: 'Snack' },
                    ].map((meal) => (
                        <button
                            key={meal.value}
                            type="button"
                            onClick={() => updateForm('meal_type', meal.value)}
                            style={{
                                ...styles.mealTypeBtn,
                                backgroundColor: formData.meal_type === meal.value ? '#10B981' : '#F3F4F6',
                                color: formData.meal_type === meal.value ? 'white' : '#6B7280',
                            }}
                        >
                            <span style={styles.mealEmoji}>{meal.emoji}</span>
                            <span>{meal.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {formData.type === 'break' && (
                <div style={styles.breakDurations}>
                    {[
                        { value: 5, label: '5 min', emoji: '⚡' },
                        { value: 10, label: '10 min', emoji: '☕' },
                        { value: 15, label: '15 min', emoji: '🚶' },
                        { value: 20, label: '20 min', emoji: '😴' },
                    ].map((brk) => (
                        <button
                            key={brk.value}
                            type="button"
                            onClick={() => updateForm('break_duration', brk.value)}
                            style={{
                                ...styles.breakDurationBtn,
                                backgroundColor: formData.break_duration === brk.value ? '#F59E0B' : '#F3F4F6',
                                color: formData.break_duration === brk.value ? 'white' : '#6B7280',
                            }}
                        >
                            <span>{brk.emoji}</span>
                            <span>{brk.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Advanced Options Toggle */}
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={styles.advancedToggle}
            >
                {showAdvanced ? '▼' : '▶'} Advanced options
            </button>

            {/* Advanced Options (Collapsed by default) */}
            {showAdvanced && (
                <div style={styles.advancedSection}>
                    <div style={styles.advancedRow}>
                        <div style={styles.advancedField}>
                            <label style={styles.advancedLabel}>Frequency</label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => updateForm('frequency', e.target.value)}
                                style={styles.select}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekdays">Weekdays</option>
                                <option value="weekends">Weekends</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                        <div style={styles.advancedField}>
                            <label style={styles.advancedLabel}>Preferred Time</label>
                            <input
                                type="time"
                                value={formData.preferred_time}
                                onChange={(e) => updateForm('preferred_time', e.target.value)}
                                style={styles.timeInput}
                            />
                        </div>
                    </div>
                    <div style={styles.advancedField}>
                        <label style={styles.advancedLabel}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateForm('description', e.target.value)}
                            placeholder="Add more details (optional)..."
                            rows={2}
                            style={styles.textarea}
                        />
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading || !formData.title.trim()}
                style={{
                    ...styles.submitBtn,
                    opacity: (loading || !formData.title.trim()) ? 0.6 : 1,
                    backgroundColor: typeConfig[formData.type].color,
                }}
            >
                {loading ? (
                    <span>Adding...</span>
                ) : (
                    <span>
                        {typeConfig[formData.type].emoji} {initialData ? 'Update' : 'Add'} {typeConfig[formData.type].label}
                    </span>
                )}
            </button>
        </form>
    );
};

const styles = {
    form: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #E5E7EB',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    formTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#1F2937',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#9CA3AF',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '6px',
    },
    error: {
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
        padding: '12px 16px',
        borderRadius: '10px',
        marginBottom: '16px',
        fontSize: '14px',
    },
    quickInputSection: {
        marginBottom: '20px',
    },
    quickInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        padding: '4px',
        border: '2px solid #E5E7EB',
    },
    quickInputIcon: {
        padding: '12px',
        fontSize: '18px',
    },
    quickInput: {
        flex: 1,
        border: 'none',
        background: 'none',
        padding: '12px',
        fontSize: '16px',
        outline: 'none',
    },
    quickHint: {
        margin: '8px 0 0 0',
        fontSize: '12px',
        color: '#9CA3AF',
        textAlign: 'center',
    },
    typePills: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    typePill: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    presetsSection: {
        marginBottom: '20px',
    },
    presetsLabel: {
        margin: '0 0 10px 0',
        fontSize: '13px',
        color: '#6B7280',
        fontWeight: '500',
    },
    presetChips: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    presetChip: {
        padding: '8px 14px',
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        border: 'none',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    tagsSection: {
        marginBottom: '20px',
    },
    tagsLabel: {
        margin: '0 0 10px 0',
        fontSize: '13px',
        color: '#6B7280',
        fontWeight: '500',
    },
    tagChips: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    tagChip: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    optionsRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
    },
    optionBox: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        padding: '14px',
    },
    optionLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#6B7280',
        marginBottom: '10px',
        fontWeight: '500',
    },
    effortDots: {
        display: 'flex',
        gap: '8px',
        marginBottom: '6px',
    },
    effortDot: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    effortLabel: {
        fontSize: '12px',
        color: '#374151',
        fontWeight: '500',
    },
    timeChips: {
        display: 'flex',
        gap: '6px',
    },
    timeChip: {
        padding: '6px 10px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    mealTypes: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px',
    },
    mealTypeBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '14px 8px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    mealEmoji: {
        fontSize: '24px',
    },
    breakDurations: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px',
    },
    breakDurationBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '14px 8px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    advancedToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        color: '#6B7280',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '8px 0',
        marginBottom: '12px',
    },
    advancedSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
    },
    advancedRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '12px',
    },
    advancedField: {
        flex: 1,
    },
    advancedLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#6B7280',
        marginBottom: '6px',
        fontWeight: '500',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
    },
    timeInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '14px',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    submitBtn: {
        width: '100%',
        padding: '16px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .preset-chip:hover {
        transform: scale(1.05);
        background-color: #4F46E5 !important;
        color: white !important;
    }
`;
document.head.appendChild(styleSheet);
