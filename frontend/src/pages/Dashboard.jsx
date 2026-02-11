/**
 * Dashboard Page
 * Main interface for managing decisions
 * 
 * Note: Person 2 (teammate) will add:
 * - Daily plan display with compressed decision cards
 * - Cognitive Load Meter
 * - Accept/Override/Ignore feedback buttons
 * - CSP stats display
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { decisionsApi } from '../lib/api';
import { DecisionForm } from '../components/DecisionForm';
import { DecisionList } from '../components/DecisionList';

export const Dashboard = () => {
    const { user, profile, signOut } = useAuth();
    
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showForm, setShowForm] = useState(false);
    const [editingDecision, setEditingDecision] = useState(null);
    const [filter, setFilter] = useState('all'); // all, task, meal, break

    // Fetch decisions on mount
    useEffect(() => {
        fetchDecisions();
    }, [user]);

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

                {/* Right Column - Plan & CSP (Placeholder for Person 2) */}
                <aside style={styles.aside}>
                    <div style={styles.placeholderCard}>
                        <h3 style={styles.placeholderTitle}>Today's Plan</h3>
                        <p style={styles.placeholderText}>
                            Compressed decision cards will appear here.
                        </p>
                        <p style={styles.placeholderHint}>
                            (Person 2 will implement daily plan generation)
                        </p>
                    </div>

                    <div style={styles.placeholderCard}>
                        <h3 style={styles.placeholderTitle}>Cognitive Load Meter</h3>
                        <div style={styles.loadMeter}>
                            <div style={styles.loadBar}>
                                <div style={{ ...styles.loadFill, width: '50%' }} />
                            </div>
                            <span style={styles.loadValue}>50 / 100</span>
                        </div>
                        <p style={styles.placeholderHint}>
                            Autonomy Level: <strong>Assist</strong>
                        </p>
                    </div>

                    <div style={styles.placeholderCard}>
                        <h3 style={styles.placeholderTitle}>Your CSP Stats</h3>
                        <div style={styles.statGrid}>
                            <div style={styles.stat}>
                                <span style={styles.statValue}>-</span>
                                <span style={styles.statLabel}>Decisions</span>
                            </div>
                            <div style={styles.stat}>
                                <span style={styles.statValue}>-</span>
                                <span style={styles.statLabel}>Accept Rate</span>
                            </div>
                        </div>
                        <p style={styles.placeholderHint}>
                            (Person 2 will implement feedback tracking)
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
