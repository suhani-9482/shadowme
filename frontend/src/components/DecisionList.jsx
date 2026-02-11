/**
 * Decision List Component - Redesigned
 * Beautiful card layout with interactive elements
 * Theme-aware (dark/light mode support)
 */
import { sounds } from '../lib/sounds';
import { useTheme } from '../context/ThemeContext';

export const DecisionList = ({ decisions, onEdit, onDelete, onToggleActive }) => {
    const { currentTheme, isDark } = useTheme();
    
    if (!decisions || decisions.length === 0) {
        return (
            <div style={{
                ...styles.empty,
                backgroundColor: currentTheme.cardBg,
                boxShadow: currentTheme.shadow,
            }}>
                <span style={styles.emptyIcon}>📝</span>
                <p style={{...styles.emptyText, color: currentTheme.textPrimary}}>No decisions yet</p>
                <p style={{...styles.emptyHint, color: currentTheme.textMuted}}>
                    Click "+ Add Decision" to teach your shadow what you do daily
                </p>
            </div>
        );
    }

    const getTypeConfig = (type) => {
        switch (type) {
            case 'task': return { icon: '📋', color: '#4F46E5', bg: '#EEF2FF', label: 'Task' };
            case 'meal': return { icon: '🍽️', color: '#10B981', bg: '#ECFDF5', label: 'Meal' };
            case 'break': return { icon: '☕', color: '#F59E0B', bg: '#FFFBEB', label: 'Break' };
            default: return { icon: '📌', color: '#6B7280', bg: '#F3F4F6', label: 'Item' };
        }
    };

    const getEffortDots = (effort) => {
        const colors = ['#10B981', '#10B981', '#F59E0B', '#EF4444', '#EF4444'];
        return Array(5).fill(0).map((_, i) => (
            <span 
                key={i} 
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i < effort ? colors[effort - 1] : '#E5E7EB',
                    display: 'inline-block',
                }}
            />
        ));
    };

    // Theme-aware styles
    const themedCard = {
        ...styles.card,
        backgroundColor: currentTheme.cardBg,
        boxShadow: currentTheme.shadow,
    };
    
    const themedMetaChip = {
        ...styles.metaChip,
        backgroundColor: isDark ? currentTheme.backgroundSecondary : '#F3F4F6',
        color: currentTheme.textSecondary,
    };
    
    const themedActionBtn = {
        ...styles.actionBtn,
        backgroundColor: isDark ? currentTheme.backgroundSecondary : '#F3F4F6',
    };

    return (
        <div style={styles.list}>
            {decisions.map((decision) => {
                const config = getTypeConfig(decision.type);
                
                return (
                    <div 
                        key={decision.id} 
                        style={{
                            ...themedCard,
                            opacity: decision.active ? 1 : 0.5,
                            borderLeftColor: config.color,
                        }}
                    >
                        {/* Card Header */}
                        <div style={styles.cardHeader}>
                            <div style={styles.titleSection}>
                                <div style={{
                                    ...styles.iconBadge,
                                    backgroundColor: isDark ? `${config.color}33` : config.bg,
                                }}>
                                    <span>{config.icon}</span>
                                </div>
                                <div style={styles.titleInfo}>
                                    <span style={{...styles.title, color: currentTheme.textPrimary}}>{decision.title}</span>
                                    <span style={{
                                        ...styles.typeBadge,
                                        backgroundColor: isDark ? `${config.color}33` : config.bg,
                                        color: config.color,
                                    }}>
                                        {config.label}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.actions}>
                                <button 
                                    onClick={() => {
                                        sounds.click();
                                        onToggleActive(decision);
                                    }}
                                    style={{
                                        ...styles.toggleBtn,
                                        backgroundColor: decision.active ? '#10B981' : (isDark ? currentTheme.backgroundSecondary : '#E5E7EB'),
                                        color: decision.active ? 'white' : currentTheme.textMuted,
                                    }}
                                    title={decision.active ? 'Active - Click to pause' : 'Paused - Click to activate'}
                                >
                                    {decision.active ? '✓' : '○'}
                                </button>
                                <button 
                                    onClick={() => {
                                        sounds.click();
                                        onEdit(decision);
                                    }}
                                    style={themedActionBtn}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={() => {
                                        sounds.delete();
                                        onDelete(decision.id);
                                    }}
                                    style={{...themedActionBtn, backgroundColor: isDark ? '#4A2020' : '#FEE2E2'}}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        {decision.description && (
                            <p style={{...styles.description, color: currentTheme.textMuted}}>{decision.description}</p>
                        )}

                        {/* Meta Info - Compact Chips */}
                        <div style={styles.metaRow}>
                            {/* Frequency */}
                            <div style={themedMetaChip}>
                                <span>🔄</span>
                                <span>{decision.frequency}</span>
                            </div>

                            {/* Task-specific: Effort dots */}
                            {decision.type === 'task' && decision.effort && (
                                <div style={themedMetaChip}>
                                    <div style={styles.effortDots}>
                                        {getEffortDots(decision.effort)}
                                    </div>
                                </div>
                            )}

                            {/* Task-specific: Duration */}
                            {decision.type === 'task' && decision.estimated_minutes && (
                                <div style={themedMetaChip}>
                                    <span>⏱️</span>
                                    <span>{decision.estimated_minutes}min</span>
                                </div>
                            )}

                            {/* Meal-specific */}
                            {decision.type === 'meal' && decision.meal_type && (
                                <div style={themedMetaChip}>
                                    <span>
                                        {decision.meal_type === 'breakfast' ? '🍳' :
                                         decision.meal_type === 'lunch' ? '🥗' :
                                         decision.meal_type === 'dinner' ? '🍽️' : '🍎'}
                                    </span>
                                    <span style={{textTransform: 'capitalize'}}>{decision.meal_type}</span>
                                </div>
                            )}

                            {/* Break-specific */}
                            {decision.type === 'break' && decision.break_duration && (
                                <div style={themedMetaChip}>
                                    <span>⏱️</span>
                                    <span>{decision.break_duration}min</span>
                                </div>
                            )}

                            {/* Preferred time */}
                            {decision.preferred_time && (
                                <div style={themedMetaChip}>
                                    <span>🕐</span>
                                    <span>{decision.preferred_time}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {decision.tags && decision.tags.length > 0 && (
                            <div style={styles.tagsRow}>
                                {decision.tags.map((tag, i) => (
                                    <span key={i} style={{
                                        ...styles.tag,
                                        backgroundColor: isDark ? '#4338CA44' : '#E0E7FF',
                                        color: isDark ? '#C4B5FD' : '#4338CA',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const styles = {
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        borderLeft: '4px solid #ddd',
        transition: 'all 0.2s ease',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    iconBadge: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
    },
    titleInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    title: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1F2937',
    },
    typeBadge: {
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        width: 'fit-content',
    },
    actions: {
        display: 'flex',
        gap: '6px',
    },
    toggleBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    actionBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#F3F4F6',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.2s',
    },
    deleteBtn: {
        backgroundColor: '#FEE2E2',
    },
    description: {
        margin: '0 0 12px 0',
        fontSize: '13px',
        color: '#6B7280',
        lineHeight: '1.5',
        paddingLeft: '52px',
    },
    metaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        paddingLeft: '52px',
    },
    metaChip: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        backgroundColor: '#F3F4F6',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#4B5563',
    },
    effortDots: {
        display: 'flex',
        gap: '3px',
    },
    tagsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '10px',
        paddingLeft: '52px',
    },
    tag: {
        backgroundColor: '#E0E7FF',
        color: '#4338CA',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
    },
    empty: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    },
    emptyIcon: {
        fontSize: '48px',
        display: 'block',
        marginBottom: '16px',
    },
    emptyText: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
    },
    emptyHint: {
        margin: 0,
        fontSize: '14px',
        color: '#6B7280',
        maxWidth: '300px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
};

// Add hover effect
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .decision-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(styleSheet);
