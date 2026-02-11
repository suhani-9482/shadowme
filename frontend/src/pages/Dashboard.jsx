/**
 * Dashboard Page
 * Main interface for managing decisions and viewing daily plans
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { decisionsApi, profileApi } from '../lib/api';
import { DecisionForm } from '../components/DecisionForm';
import { DecisionList } from '../components/DecisionList';
import { CognitiveLoadMeter } from '../components/CognitiveLoadMeter';
import { DecisionCards } from '../components/DecisionCards';

export const Dashboard = () => {
    const { user, profile, signOut } = useAuth();
    
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showForm, setShowForm] = useState(false);
    const [editingDecision, setEditingDecision] = useState(null);
    const [filter, setFilter] = useState('all'); // all, task, meal, break
    
    // Cognitive load state
    const [cognitiveLoad, setCognitiveLoad] = useState(null);
    
    // CSP stats state
    const [cspStats, setCspStats] = useState(null);

    // Fetch decisions and CSP on mount
    useEffect(() => {
        fetchDecisions();
        fetchCspStats();
    }, [user]);
    
    // Fetch CSP stats
    const fetchCspStats = async () => {
        try {
            const data = await profileApi.getCsp(user.id);
            setCspStats(data.csp_vector);
        } catch (err) {
            console.error('Failed to fetch CSP stats:', err);
        }
    };
    
    // Handle cognitive load change from meter
    const handleCognitiveLoadChange = (loadData) => {
        setCognitiveLoad(loadData);
    };

    const fetchDecisions = async () => {
        try {
            setLoading(true);
            const data = await decisionsApi.list(user.id);
            setDecisions(data.decisions || []);
        } catch (err) {
            setError('Failed to load decisions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDecision = async (formData) => {
        await decisionsApi.create(user.id, formData);
        await fetchDecisions();
        setShowForm(false);
    };

    const handleUpdateDecision = async (formData) => {
        await decisionsApi.update(user.id, editingDecision.id, formData);
        await fetchDecisions();
        setEditingDecision(null);
    };

    const handleDeleteDecision = async (id) => {
        if (!window.confirm('Delete this decision?')) return;
        
        try {
            await decisionsApi.delete(user.id, id);
            await fetchDecisions();
        } catch (err) {
            setError('Failed to delete decision');
        }
    };

    const handleToggleActive = async (decision) => {
        try {
            await decisionsApi.update(user.id, decision.id, { active: !decision.active });
            await fetchDecisions();
        } catch (err) {
            setError('Failed to update decision');
        }
    };

    const handleEdit = (decision) => {
        setEditingDecision(decision);
        setShowForm(false);
    };

    const filteredDecisions = filter === 'all' 
        ? decisions 
        : decisions.filter(d => d.type === filter);

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>ShadowMe</h1>
                    <p style={styles.greeting}>
                        Welcome back{profile?.wake_time ? ` — Your shadow is learning` : ''}
                    </p>
                </div>
                <button onClick={signOut} style={styles.logoutButton}>
                    Log Out
                </button>
            </header>

            <main style={styles.main}>
                {/* Left Column - Decisions Management */}
                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Your Decisions</h2>
                        <button 
                            onClick={() => {
                                setShowForm(!showForm);
                                setEditingDecision(null);
                            }}
                            style={styles.addButton}
                        >
                            {showForm ? '✕ Cancel' : '+ Add Decision'}
                        </button>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    {/* Add Form */}
                    {showForm && (
                        <DecisionForm 
                            onSubmit={handleCreateDecision}
                            onCancel={() => setShowForm(false)}
                        />
                    )}

                    {/* Edit Form */}
                    {editingDecision && (
                        <DecisionForm 
                            initialData={editingDecision}
                            onSubmit={handleUpdateDecision}
                            onCancel={() => setEditingDecision(null)}
                        />
                    )}

                    {/* Filter Tabs */}
                    <div style={styles.filterTabs}>
                        {['all', 'task', 'meal', 'break'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                style={{
                                    ...styles.filterTab,
                                    backgroundColor: filter === type ? '#4F46E5' : 'transparent',
                                    color: filter === type ? 'white' : '#666',
                                }}
                            >
                                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                                {type === 'all' 
                                    ? ` (${decisions.length})`
                                    : ` (${decisions.filter(d => d.type === type).length})`
                                }
                            </button>
                        ))}
                    </div>

                    {/* Decisions List */}
                    {loading ? (
                        <p style={styles.loading}>Loading decisions...</p>
                    ) : (
                        <DecisionList 
                            decisions={filteredDecisions}
                            onEdit={handleEdit}
                            onDelete={handleDeleteDecision}
                            onToggleActive={handleToggleActive}
                        />
                    )}
                </section>

                {/* Right Column - Plan & Cognitive Load */}
                <aside style={styles.aside}>
                    {/* Today's Plan - Decision Cards */}
                    <DecisionCards 
                        onFeedbackComplete={(action, card) => {
                            console.log('Feedback completed:', action, card);
                            // Refresh CSP stats when feedback is submitted
                            fetchCspStats();
                        }}
                    />

                    {/* Real Cognitive Load Meter */}
                    <CognitiveLoadMeter onLoadChange={handleCognitiveLoadChange} />

                    {/* CSP Stats - Learning Visualization */}
                    <div style={styles.placeholderCard}>
                        <h3 style={styles.placeholderTitle}>Your Shadow Stats</h3>
                        
                        {/* Learning Progress */}
                        <div style={styles.learningSection}>
                            <div style={styles.learningHeader}>
                                <span style={styles.learningIcon}>
                                    {(cspStats?.total_decisions || 0) >= 10 ? '🧠' : '🌱'}
                                </span>
                                <span style={styles.learningLabel}>
                                    {(cspStats?.total_decisions || 0) >= 20 
                                        ? 'Shadow is well-trained' 
                                        : (cspStats?.total_decisions || 0) >= 10 
                                            ? 'Shadow is learning fast'
                                            : 'Shadow is starting to learn'}
                                </span>
                            </div>
                            <div style={styles.learningBar}>
                                <div style={{
                                    ...styles.learningFill,
                                    width: `${Math.min(100, ((cspStats?.total_decisions || 0) / 20) * 100)}%`,
                                }}/>
                            </div>
                            <span style={styles.learningCount}>
                                {cspStats?.total_decisions || 0}/20 interactions
                            </span>
                        </div>

                        <div style={styles.statGrid}>
                            <div style={styles.stat}>
                                <span style={{
                                    ...styles.statValue,
                                    color: (cspStats?.accept_rate || 0) > 0.7 ? '#10B981' : 
                                           (cspStats?.accept_rate || 0) > 0.4 ? '#F59E0B' : '#6B7280'
                                }}>
                                    {cspStats?.accept_rate 
                                        ? `${Math.round(cspStats.accept_rate * 100)}%` 
                                        : '—'}
                                </span>
                                <span style={styles.statLabel}>Accept Rate</span>
                            </div>
                            <div style={styles.stat}>
                                <span style={styles.statValue}>
                                    {cspStats?.total_decisions || 0}
                                </span>
                                <span style={styles.statLabel}>Decisions</span>
                            </div>
                            <div style={styles.stat}>
                                <span style={{...styles.statValue, color: '#10B981'}}>
                                    {cspStats?.total_accepts || 0}
                                </span>
                                <span style={styles.statLabel}>Accepts</span>
                            </div>
                            <div style={styles.stat}>
                                <span style={{...styles.statValue, color: '#F59E0B'}}>
                                    {cspStats?.total_overrides || 0}
                                </span>
                                <span style={styles.statLabel}>Overrides</span>
                            </div>
                        </div>

                        {/* Time Preferences Visualization */}
                        {cspStats?.morning_task_weight !== undefined && (
                            <div style={styles.preferencesSection}>
                                <p style={styles.prefTitle}>Time Preferences</p>
                                <div style={styles.prefBar}>
                                    <span style={styles.prefLabel}>🌅 Morning</span>
                                    <div style={styles.prefTrack}>
                                        <div style={{
                                            ...styles.prefFill,
                                            width: `${(cspStats.morning_task_weight || 0.5) * 100}%`,
                                            backgroundColor: '#F59E0B',
                                        }}/>
                                    </div>
                                </div>
                                <div style={styles.prefBar}>
                                    <span style={styles.prefLabel}>☀️ Afternoon</span>
                                    <div style={styles.prefTrack}>
                                        <div style={{
                                            ...styles.prefFill,
                                            width: `${(cspStats.afternoon_task_weight || 0.5) * 100}%`,
                                            backgroundColor: '#3B82F6',
                                        }}/>
                                    </div>
                                </div>
                                <div style={styles.prefBar}>
                                    <span style={styles.prefLabel}>🌙 Evening</span>
                                    <div style={styles.prefTrack}>
                                        <div style={{
                                            ...styles.prefFill,
                                            width: `${(cspStats.evening_task_weight || 0.3) * 100}%`,
                                            backgroundColor: '#8B5CF6',
                                        }}/>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p style={styles.cspHint}>
                            {(cspStats?.accept_rate || 0) > 0.7 
                                ? '✨ Your shadow is thinking like you!'
                                : 'Your shadow learns from every choice you make.'}
                        </p>
                    </div>
                </aside>
            </main>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: 'white',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    title: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    greeting: {
        margin: '4px 0 0 0',
        fontSize: '14px',
        color: '#666',
    },
    logoutButton: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    main: {
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '24px',
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    section: {
        minWidth: 0,
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
    },
    addButton: {
        padding: '8px 16px',
        backgroundColor: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    filterTabs: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
    },
    filterTab: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    aside: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    placeholderCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    placeholderTitle: {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    placeholderText: {
        margin: '0 0 8px 0',
        fontSize: '14px',
        color: '#666',
    },
    placeholderHint: {
        margin: 0,
        fontSize: '12px',
        color: '#999',
        fontStyle: 'italic',
    },
    cspHint: {
        margin: '12px 0 0 0',
        fontSize: '12px',
        color: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    // Learning visualization styles
    learningSection: {
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
    },
    learningHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
    },
    learningIcon: {
        fontSize: '18px',
    },
    learningLabel: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
    },
    learningBar: {
        height: '6px',
        backgroundColor: '#E5E7EB',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '4px',
    },
    learningFill: {
        height: '100%',
        backgroundColor: '#4F46E5',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
    },
    learningCount: {
        fontSize: '11px',
        color: '#9CA3AF',
    },
    // Time preferences visualization
    preferencesSection: {
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #E5E7EB',
    },
    prefTitle: {
        margin: '0 0 8px 0',
        fontSize: '12px',
        fontWeight: '500',
        color: '#6B7280',
    },
    prefBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
    },
    prefLabel: {
        fontSize: '11px',
        width: '80px',
        color: '#6B7280',
    },
    prefTrack: {
        flex: 1,
        height: '6px',
        backgroundColor: '#E5E7EB',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    prefFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
    },
    loadMeter: {
        marginBottom: '12px',
    },
    loadBar: {
        height: '8px',
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '4px',
    },
    loadFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: '4px',
        transition: 'width 0.3s',
    },
    loadValue: {
        fontSize: '12px',
        color: '#666',
    },
    statGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '12px',
    },
    stat: {
        textAlign: 'center',
    },
    statValue: {
        display: 'block',
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
    },
    statLabel: {
        fontSize: '12px',
        color: '#666',
    },
    error: {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px',
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
    },
};

// Responsive: On smaller screens, stack the columns
const mediaQuery = `
@media (max-width: 900px) {
    .main {
        grid-template-columns: 1fr !important;
    }
}
`;
