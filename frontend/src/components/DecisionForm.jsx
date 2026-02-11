/**
 * Decision Form Component
 * For creating and editing recurring decisions (tasks, meals, breaks)
 */
import { useState } from 'react';

export const DecisionForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        type: initialData?.type || 'task',
        title: initialData?.title || '',
        description: initialData?.description || '',
        tags: initialData?.tags?.join(', ') || '',
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

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Process tags from comma-separated string to array
            const processedData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>
                {initialData ? 'Edit Decision' : 'Add New Decision'}
            </h3>

            {error && <div style={styles.error}>{error}</div>}

            {/* Type Selection */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Type</label>
                <div style={styles.typeButtons}>
                    {['task', 'meal', 'break'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => updateForm('type', type)}
                            style={{
                                ...styles.typeButton,
                                backgroundColor: formData.type === type ? '#4F46E5' : 'white',
                                color: formData.type === type ? 'white' : '#333',
                            }}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Title *</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder={
                        formData.type === 'task' ? 'e.g., Review pull requests' :
                        formData.type === 'meal' ? 'e.g., Healthy lunch' :
                        'e.g., Stretch break'
                    }
                    required
                    style={styles.input}
                />
            </div>

            {/* Description */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Description (optional)</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Add more details..."
                    rows={2}
                    style={{ ...styles.input, resize: 'vertical' }}
                />
            </div>

            {/* Tags */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Tags (comma-separated)</label>
                <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => updateForm('tags', e.target.value)}
                    placeholder="e.g., work, urgent, coding"
                    style={styles.input}
                />
            </div>

            {/* Task-specific fields */}
            {formData.type === 'task' && (
                <>
                    <div style={styles.inputRow}>
                        <div style={styles.inputHalf}>
                            <label style={styles.label}>Effort (1-5)</label>
                            <select
                                value={formData.effort}
                                onChange={(e) => updateForm('effort', parseInt(e.target.value))}
                                style={styles.select}
                            >
                                <option value={1}>1 - Very Easy</option>
                                <option value={2}>2 - Easy</option>
                                <option value={3}>3 - Medium</option>
                                <option value={4}>4 - Hard</option>
                                <option value={5}>5 - Very Hard</option>
                            </select>
                        </div>
                        <div style={styles.inputHalf}>
                            <label style={styles.label}>Est. Time (min)</label>
                            <input
                                type="number"
                                value={formData.estimated_minutes}
                                onChange={(e) => updateForm('estimated_minutes', parseInt(e.target.value) || 30)}
                                min={5}
                                max={480}
                                style={styles.input}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Meal-specific fields */}
            {formData.type === 'meal' && (
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Meal Type</label>
                    <select
                        value={formData.meal_type}
                        onChange={(e) => updateForm('meal_type', e.target.value)}
                        style={styles.select}
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
            )}

            {/* Break-specific fields */}
            {formData.type === 'break' && (
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Break Duration (minutes)</label>
                    <select
                        value={formData.break_duration}
                        onChange={(e) => updateForm('break_duration', parseInt(e.target.value))}
                        style={styles.select}
                    >
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={30}>30 minutes</option>
                    </select>
                </div>
            )}

            {/* Frequency and Time */}
            <div style={styles.inputRow}>
                <div style={styles.inputHalf}>
                    <label style={styles.label}>Frequency</label>
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
                <div style={styles.inputHalf}>
                    <label style={styles.label}>Preferred Time</label>
                    <input
                        type="time"
                        value={formData.preferred_time}
                        onChange={(e) => updateForm('preferred_time', e.target.value)}
                        style={styles.input}
                    />
                </div>
            </div>

            {/* Active toggle */}
            <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => updateForm('active', e.target.checked)}
                        style={styles.checkbox}
                    />
                    Active (include in daily plans)
                </label>
            </div>

            {/* Buttons */}
            <div style={styles.buttonRow}>
                {onCancel && (
                    <button type="button" onClick={onCancel} style={styles.buttonSecondary}>
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        ...styles.button,
                        flex: onCancel ? 1 : undefined,
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Saving...' : (initialData ? 'Update' : 'Add Decision')}
                </button>
            </div>
        </form>
    );
};

const styles = {
    form: {
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
    },
    formTitle: {
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
    },
    inputRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
    },
    inputHalf: {
        flex: 1,
    },
    typeButtons: {
        display: 'flex',
        gap: '8px',
    },
    typeButton: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    checkboxGroup: {
        marginBottom: '20px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#333',
        cursor: 'pointer',
    },
    checkbox: {
        width: '18px',
        height: '18px',
    },
    buttonRow: {
        display: 'flex',
        gap: '12px',
    },
    button: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    buttonSecondary: {
        padding: '12px 20px',
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    error: {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px',
    },
};
