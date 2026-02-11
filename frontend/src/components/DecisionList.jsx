/**
 * Decision List Component
 * Displays list of recurring decisions with actions
 */

export const DecisionList = ({ decisions, onEdit, onDelete, onToggleActive }) => {
    if (!decisions || decisions.length === 0) {
        return (
            <div style={styles.empty}>
                <p style={styles.emptyText}>No decisions yet.</p>
                <p style={styles.emptyHint}>Add your first task, meal, or break above!</p>
            </div>
        );
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'task': return '📋';
            case 'meal': return '🍽️';
            case 'break': return '☕';
            default: return '📌';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'task': return '#3B82F6';
            case 'meal': return '#10B981';
            case 'break': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getEffortLabel = (effort) => {
        const labels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
        return labels[effort] || '';
    };

    return (
        <div style={styles.list}>
            {decisions.map((decision) => (
                <div 
                    key={decision.id} 
                    style={{
                        ...styles.card,
                        opacity: decision.active ? 1 : 0.6,
                        borderLeftColor: getTypeColor(decision.type),
                    }}
                >
                    <div style={styles.cardHeader}>
                        <div style={styles.titleRow}>
                            <span style={styles.icon}>{getTypeIcon(decision.type)}</span>
                            <span style={styles.title}>{decision.title}</span>
                            <span style={{
                                ...styles.typeBadge,
                                backgroundColor: getTypeColor(decision.type) + '20',
                                color: getTypeColor(decision.type),
                            }}>
                                {decision.type}
                            </span>
                        </div>
                        <div style={styles.actions}>
                            <button 
                                onClick={() => onToggleActive(decision)}
                                style={styles.actionButton}
                                title={decision.active ? 'Deactivate' : 'Activate'}
                            >
                                {decision.active ? '✓' : '○'}
                            </button>
                            <button 
                                onClick={() => onEdit(decision)}
                                style={styles.actionButton}
                                title="Edit"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => onDelete(decision.id)}
                                style={{ ...styles.actionButton, color: '#DC2626' }}
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    {decision.description && (
                        <p style={styles.description}>{decision.description}</p>
                    )}

                    <div style={styles.meta}>
                        {/* Frequency */}
                        <span style={styles.metaItem}>
                            🔄 {decision.frequency}
                        </span>

                        {/* Task-specific */}
                        {decision.type === 'task' && (
                            <>
                                <span style={styles.metaItem}>
                                    ⚡ {getEffortLabel(decision.effort)}
                                </span>
                                <span style={styles.metaItem}>
                                    ⏱️ {decision.estimated_minutes}min
                                </span>
                            </>
                        )}

                        {/* Meal-specific */}
                        {decision.type === 'meal' && decision.meal_type && (
                            <span style={styles.metaItem}>
                                🍴 {decision.meal_type}
                            </span>
                        )}

                        {/* Break-specific */}
                        {decision.type === 'break' && (
                            <span style={styles.metaItem}>
                                ⏱️ {decision.break_duration}min
                            </span>
                        )}

                        {/* Preferred time */}
                        {decision.preferred_time && (
                            <span style={styles.metaItem}>
                                🕐 {decision.preferred_time}
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {decision.tags && decision.tags.length > 0 && (
                        <div style={styles.tags}>
                            {decision.tags.map((tag, i) => (
                                <span key={i} style={styles.tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
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
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderLeft: '4px solid #ddd',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    icon: {
        fontSize: '18px',
    },
    title: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    typeBadge: {
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    actions: {
        display: 'flex',
        gap: '4px',
    },
    actionButton: {
        background: 'none',
        border: 'none',
        padding: '4px 8px',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '14px',
        transition: 'background-color 0.2s',
    },
    description: {
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.4',
    },
    meta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '8px',
    },
    metaItem: {
        fontSize: '13px',
        color: '#666',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '8px',
    },
    tag: {
        backgroundColor: '#E5E7EB',
        color: '#374151',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    empty: {
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
    },
    emptyText: {
        margin: '0 0 8px 0',
        fontSize: '16px',
        color: '#666',
    },
    emptyHint: {
        margin: 0,
        fontSize: '14px',
        color: '#888',
    },
};
