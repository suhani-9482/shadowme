/**
 * Onboarding Page
 * Collects user preferences and creates initial CSP (Cognitive Shadow Profile)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../lib/api';

export const Onboarding = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form data
    const [formData, setFormData] = useState({
        wake_time: '07:00',
        sleep_time: '23:00',
        peak_focus_start: '09:00',
        peak_focus_end: '12:00',
        diet_preference: 'balanced',
        work_style: 'flexible',
        break_preference: 'short',
    });

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            await profileApi.create(user.id, formData);
            await refreshProfile();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Let's Set Up Your Shadow</h1>
                <p style={styles.subtitle}>
                    Tell us about your preferences so ShadowMe can think like you
                </p>

                {/* Progress indicator */}
                <div style={styles.progress}>
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            style={{
                                ...styles.progressDot,
                                backgroundColor: s <= step ? '#4F46E5' : '#ddd',
                            }}
                        />
                    ))}
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {/* Step 1: Schedule */}
                {step === 1 && (
                    <div style={styles.stepContent}>
                        <h2 style={styles.stepTitle}>Your Daily Schedule</h2>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>What time do you usually wake up?</label>
                            <input
                                type="time"
                                value={formData.wake_time}
                                onChange={(e) => updateForm('wake_time', e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>What time do you usually go to sleep?</label>
                            <input
                                type="time"
                                value={formData.sleep_time}
                                onChange={(e) => updateForm('sleep_time', e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputRow}>
                            <div style={styles.inputHalf}>
                                <label style={styles.label}>Peak focus starts</label>
                                <input
                                    type="time"
                                    value={formData.peak_focus_start}
                                    onChange={(e) => updateForm('peak_focus_start', e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputHalf}>
                                <label style={styles.label}>Peak focus ends</label>
                                <input
                                    type="time"
                                    value={formData.peak_focus_end}
                                    onChange={(e) => updateForm('peak_focus_end', e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <button onClick={nextStep} style={styles.button}>
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Work Style */}
                {step === 2 && (
                    <div style={styles.stepContent}>
                        <h2 style={styles.stepTitle}>Your Work Style</h2>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>How do you prefer to work?</label>
                            <div style={styles.optionsGrid}>
                                {[
                                    { value: 'flexible', label: 'Flexible', desc: 'Adapt as I go' },
                                    { value: 'structured', label: 'Structured', desc: 'Clear time blocks' },
                                    { value: 'deep_work', label: 'Deep Work', desc: 'Long focus sessions' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateForm('work_style', option.value)}
                                        style={{
                                            ...styles.optionCard,
                                            borderColor: formData.work_style === option.value ? '#4F46E5' : '#ddd',
                                            backgroundColor: formData.work_style === option.value ? '#EEF2FF' : 'white',
                                        }}
                                    >
                                        <strong>{option.label}</strong>
                                        <span style={styles.optionDesc}>{option.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Break preference</label>
                            <div style={styles.optionsRow}>
                                {[
                                    { value: 'short', label: 'Short breaks (5-10 min)' },
                                    { value: 'long', label: 'Long breaks (15-20 min)' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateForm('break_preference', option.value)}
                                        style={{
                                            ...styles.optionButton,
                                            borderColor: formData.break_preference === option.value ? '#4F46E5' : '#ddd',
                                            backgroundColor: formData.break_preference === option.value ? '#EEF2FF' : 'white',
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.buttonRow}>
                            <button onClick={prevStep} style={styles.buttonSecondary}>
                                Back
                            </button>
                            <button onClick={nextStep} style={styles.button}>
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Diet & Review */}
                {step === 3 && (
                    <div style={styles.stepContent}>
                        <h2 style={styles.stepTitle}>Diet & Confirmation</h2>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Diet preference (for meal suggestions)</label>
                            <select
                                value={formData.diet_preference}
                                onChange={(e) => updateForm('diet_preference', e.target.value)}
                                style={styles.select}
                            >
                                <option value="balanced">Balanced</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="vegan">Vegan</option>
                                <option value="keto">Keto</option>
                                <option value="no_preference">No Preference</option>
                            </select>
                        </div>

                        {/* Summary */}
                        <div style={styles.summary}>
                            <h3 style={styles.summaryTitle}>Your Shadow Profile</h3>
                            <div style={styles.summaryItem}>
                                <span>Schedule:</span>
                                <span>{formData.wake_time} - {formData.sleep_time}</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Peak Focus:</span>
                                <span>{formData.peak_focus_start} - {formData.peak_focus_end}</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Work Style:</span>
                                <span style={{ textTransform: 'capitalize' }}>{formData.work_style.replace('_', ' ')}</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Breaks:</span>
                                <span style={{ textTransform: 'capitalize' }}>{formData.break_preference}</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Diet:</span>
                                <span style={{ textTransform: 'capitalize' }}>{formData.diet_preference.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <p style={styles.note}>
                            Your Cognitive Shadow Profile (CSP) will learn and adapt based on your choices over time.
                        </p>

                        <div style={styles.buttonRow}>
                            <button onClick={prevStep} style={styles.buttonSecondary}>
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={loading}
                                style={{
                                    ...styles.button,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Creating...' : 'Create My Shadow'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
    },
    progress: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '24px',
    },
    progressDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        transition: 'background-color 0.3s',
    },
    stepContent: {
        marginTop: '16px',
    },
    stepTitle: {
        margin: '0 0 20px 0',
        fontSize: '20px',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
    },
    inputRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
    },
    inputHalf: {
        flex: 1,
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
    },
    optionCard: {
        padding: '16px 12px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s',
    },
    optionDesc: {
        fontSize: '12px',
        color: '#666',
    },
    optionsRow: {
        display: 'flex',
        gap: '12px',
    },
    optionButton: {
        flex: 1,
        padding: '12px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    buttonSecondary: {
        padding: '14px 24px',
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    },
    summary: {
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
    },
    summaryTitle: {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px',
    },
    note: {
        fontSize: '13px',
        color: '#888',
        textAlign: 'center',
        marginBottom: '16px',
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
