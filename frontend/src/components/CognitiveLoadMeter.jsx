/**
 * CognitiveLoadMeter Component
 * 
 * PURPOSE:
 * Displays the user's current cognitive load as a visual meter.
 * Shows the autonomy level and explains what it means.
 * 
 * VISUAL DESIGN:
 * - Animated progress bar that changes color based on load
 * - Green (0-33): Low load, user is fresh
 * - Yellow/Orange (34-66): Medium load, balanced mode
 * - Red (67-100): High load, user is tired
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../lib/api';

export const CognitiveLoadMeter = ({ onLoadChange }) => {
    const { user } = useAuth();
    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch cognitive load on mount and periodically
    useEffect(() => {
        if (!user?.id) return;

        const fetchLoad = async () => {
            try {
                const data = await profileApi.getCognitiveLoad(user.id);
                setLoadData(data);
                setError(null);
                
                // Notify parent component of load change
                if (onLoadChange) {
                    onLoadChange(data);
                }
            } catch (err) {
                console.error('Failed to fetch cognitive load:', err);
                setError('Could not calculate load');
            } finally {
                setLoading(false);
            }
        };

        fetchLoad();
        
        // Refresh every 2 minutes
        const interval = setInterval(fetchLoad, 120000);
        return () => clearInterval(interval);
    }, [user?.id, onLoadChange]);

    // Get color based on score
    const getColor = (score) => {
        if (score <= 33) return '#10B981'; // Green
        if (score <= 66) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    // Get background gradient based on score
    const getGradient = (score) => {
        if (score <= 33) return 'linear-gradient(90deg, #10B981, #34D399)';
        if (score <= 66) return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
        return 'linear-gradient(90deg, #EF4444, #F87171)';
    };

    // Get autonomy level badge style
    const getAutonomyStyle = (level) => {
        switch (level) {
            case 'manual':
                return { bg: '#D1FAE5', color: '#059669', icon: '🎯' };
            case 'assist':
                return { bg: '#FEF3C7', color: '#D97706', icon: '🤝' };
            case 'auto':
                return { bg: '#FEE2E2', color: '#DC2626', icon: '🤖' };
            default:
                return { bg: '#E5E7EB', color: '#374151', icon: '⚡' };
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>Cognitive Load Meter</h3>
                <div style={styles.skeleton}></div>
                <p style={styles.loading}>Calculating...</p>
            </div>
        );
    }

    if (error || !loadData) {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>Cognitive Load Meter</h3>
                <div style={{ ...styles.meterBar, backgroundColor: '#E5E7EB' }}>
                    <div style={{ ...styles.meterFill, width: '50%', background: '#9CA3AF' }} />
                </div>
                <p style={styles.errorText}>{error || 'Unable to load'}</p>
            </div>
        );
    }

    const { score, autonomyLevel, description, breakdown } = loadData;
    const autonomyStyle = getAutonomyStyle(autonomyLevel);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>Cognitive Load Meter</h3>
                <span style={styles.score}>{score}</span>
            </div>

            {/* Main meter bar */}
            <div style={styles.meterBar}>
                <div 
                    style={{ 
                        ...styles.meterFill, 
                        width: `${score}%`,
                        background: getGradient(score),
                    }} 
                />
                {/* Threshold markers */}
                <div style={{ ...styles.marker, left: '33%' }} />
                <div style={{ ...styles.marker, left: '66%' }} />
            </div>

            {/* Scale labels */}
            <div style={styles.scaleLabels}>
                <span>Fresh</span>
                <span>Moderate</span>
                <span>Tired</span>
            </div>

            {/* Autonomy level badge */}
            <div style={{
                ...styles.autonomyBadge,
                backgroundColor: autonomyStyle.bg,
                color: autonomyStyle.color,
            }}>
                <span style={styles.autonomyIcon}>{autonomyStyle.icon}</span>
                <span style={styles.autonomyLabel}>
                    {autonomyLevel.charAt(0).toUpperCase() + autonomyLevel.slice(1)} Mode
                </span>
            </div>

            {/* Description */}
            <p style={styles.description}>{description}</p>

            {/* Breakdown details (collapsible) */}
            <details style={styles.details}>
                <summary style={styles.summary}>See breakdown</summary>
                <div style={styles.breakdownGrid}>
                    <div style={styles.breakdownItem}>
                        <span style={styles.breakdownLabel}>Decisions today</span>
                        <span style={styles.breakdownValue}>
                            {breakdown?.decisions?.count || 0} (+{breakdown?.decisions?.value || 0}pts)
                        </span>
                    </div>
                    <div style={styles.breakdownItem}>
                        <span style={styles.breakdownLabel}>Override rate</span>
                        <span style={styles.breakdownValue}>
                            {breakdown?.overrides?.rate || 0}% (+{breakdown?.overrides?.value || 0}pts)
                        </span>
                    </div>
                    <div style={styles.breakdownItem}>
                        <span style={styles.breakdownLabel}>Time on site</span>
                        <span style={styles.breakdownValue}>
                            {breakdown?.timeOnSite?.minutes || 0}min (+{breakdown?.timeOnSite?.value || 0}pts)
                        </span>
                    </div>
                    <div style={styles.breakdownItem}>
                        <span style={styles.breakdownLabel}>Time of day</span>
                        <span style={styles.breakdownValue}>
                            {breakdown?.timeOfDay?.hour || 0}:00 (+{breakdown?.timeOfDay?.value || 0}pts)
                        </span>
                    </div>
                </div>
            </details>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    title: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    score: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#4F46E5',
    },
    meterBar: {
        position: 'relative',
        height: '12px',
        backgroundColor: '#E5E7EB',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '8px',
    },
    meterFill: {
        height: '100%',
        borderRadius: '6px',
        transition: 'width 0.5s ease-out, background 0.5s ease-out',
    },
    marker: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    scaleLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#9CA3AF',
        marginBottom: '16px',
    },
    autonomyBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    autonomyIcon: {
        fontSize: '14px',
    },
    autonomyLabel: {
        textTransform: 'capitalize',
    },
    description: {
        margin: '0 0 12px 0',
        fontSize: '13px',
        color: '#666',
        fontStyle: 'italic',
    },
    details: {
        borderTop: '1px solid #E5E7EB',
        paddingTop: '12px',
    },
    summary: {
        fontSize: '12px',
        color: '#6B7280',
        cursor: 'pointer',
        userSelect: 'none',
    },
    breakdownGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '12px',
    },
    breakdownItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    breakdownLabel: {
        fontSize: '11px',
        color: '#9CA3AF',
    },
    breakdownValue: {
        fontSize: '13px',
        color: '#374151',
        fontWeight: '500',
    },
    skeleton: {
        height: '12px',
        backgroundColor: '#E5E7EB',
        borderRadius: '6px',
        marginBottom: '8px',
        animation: 'pulse 1.5s infinite',
    },
    loading: {
        fontSize: '13px',
        color: '#9CA3AF',
        textAlign: 'center',
    },
    errorText: {
        fontSize: '13px',
        color: '#EF4444',
        textAlign: 'center',
    },
};

export default CognitiveLoadMeter;
