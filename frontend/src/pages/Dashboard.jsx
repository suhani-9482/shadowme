/**
 * Dashboard Page
 * Main interface for managing decisions and viewing daily plans
 * Enhanced with dynamic header and improved UX
 * Now with Dark/Light theme support!
 */
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { decisionsApi, profileApi } from '../lib/api';
import { DecisionForm } from '../components/DecisionForm';
import { DecisionList } from '../components/DecisionList';
import { CognitiveLoadMeter } from '../components/CognitiveLoadMeter';
import { DecisionCards } from '../components/DecisionCards';
import { ShadowMascot } from '../components/ShadowMascot';
import { ThemeToggle } from '../components/ThemeToggle';
import { sounds } from '../lib/sounds';
import { useToast } from '../components/Toast';
import { OnboardingGuide } from '../components/OnboardingGuide';
import { HelpButton } from '../components/HelpButton';

// Get time-based greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
    if (hour >= 17 && hour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Night owl mode', emoji: '🌙' };
};

export const Dashboard = () => {
    const { user, profile, signOut } = useAuth();
    const { currentTheme, isDark } = useTheme();
    const toast = useToast();
    
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    const [showForm, setShowForm] = useState(false);
    const [editingDecision, setEditingDecision] = useState(null);
    const [filter, setFilter] = useState('all'); // all, task, meal, break
    
    // Cognitive load state
    const [cognitiveLoad, setCognitiveLoad] = useState(null);
    
    // CSP stats state
    const [cspStats, setCspStats] = useState(null);
    
    // Onboarding guide state
    const [showGuide, setShowGuide] = useState(() => {
        // Show guide for first-time users
        return !localStorage.getItem('shadowme_onboarding_complete');
    });
    
    // Greeting
    const greeting = getGreeting();
    
    // Mascot state based on activity
    const mascotState = useMemo(() => {
        if (loading) return { state: 'thinking', message: 'Loading...' };
        if (showForm || editingDecision) return { state: 'curious', message: 'Adding something?' };
        
        const activeCount = decisions.filter(d => d.active).length;
        const acceptRate = cspStats?.accept_rate || 0;
        
        if (activeCount === 0) return { state: 'idle', message: 'Add your first decision!' };
        if (acceptRate > 0.7) return { state: 'happy', message: 'We think alike!' };
        if ((cspStats?.total_decisions || 0) > 15) return { state: 'learning', message: 'Getting smarter!' };
        
        return { state: 'idle', message: "I'm learning you" };
    }, [loading, showForm, editingDecision, decisions, cspStats]);

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
    
    // Toggle sound effects
    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        sounds.toggle(newState);
        if (newState) {
            sounds.click();
            toast('Sounds enabled 🔊');
        } else {
            toast('Sounds muted 🔇');
        }
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
    
    // Get user's first name
    const userName = user?.email?.split('@')[0] || 'there';

    // Dynamic styles based on theme
    const themedStyles = {
        container: {
            ...styles.container,
            backgroundColor: currentTheme.background,
        },
        header: {
            ...styles.header,
            background: currentTheme.headerBg,
        },
        statusBar: {
            ...styles.statusBar,
            backgroundColor: currentTheme.statusBarBg,
            borderBottom: `1px solid ${currentTheme.statusBarBorder}`,
        },
        statusText: {
            ...styles.statusText,
            color: currentTheme.statusBarText,
        },
        sectionTitle: {
            ...styles.sectionTitle,
            color: currentTheme.textPrimary,
        },
        addButton: {
            ...styles.addButton,
            backgroundColor: currentTheme.primary,
        },
        filterTab: (isActive) => ({
            ...styles.filterTab,
            backgroundColor: isActive ? currentTheme.primary : 'transparent',
            color: isActive ? '#fff' : currentTheme.textSecondary,
        }),
        placeholderCard: {
            ...styles.placeholderCard,
            backgroundColor: currentTheme.cardBg,
            boxShadow: currentTheme.shadow,
        },
        placeholderTitle: {
            ...styles.placeholderTitle,
            color: currentTheme.textPrimary,
        },
    };

    return (
        <div style={themedStyles.container}>
            {/* Enhanced Header with Mascot */}
            <header style={themedStyles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoSection}>
                        <div style={styles.mascotContainer}>
                            <ShadowMascot 
                                state={mascotState.state} 
                                message="" 
                                size="small" 
                            />
                        </div>
                        <div style={styles.brandText}>
                            <h1 style={styles.title}>ShadowMe</h1>
                            <p style={styles.tagline}>{mascotState.message}</p>
                        </div>
                    </div>
                    <p style={styles.greeting}>
                        {greeting.emoji} {greeting.text}, <span style={styles.userName}>{userName}</span>
                    </p>
                </div>
                <div style={styles.headerRight}>
                    {/* Animated Quick Stats */}
                    <div style={styles.quickStats}>
                        <div style={styles.quickStat} className="stat-pulse">
                            <span style={styles.quickStatValue}>{decisions.filter(d => d.active).length}</span>
                            <span style={styles.quickStatLabel}>Active</span>
                        </div>
                        <div style={styles.quickStatDivider}></div>
                        <div style={styles.quickStat} className="stat-pulse">
                            <span style={{
                                ...styles.quickStatValue,
                                color: (cspStats?.total_decisions || 0) >= 10 ? '#10B981' : '#fff',
                            }}>
                                {cspStats?.total_decisions || 0}
                            </span>
                            <span style={styles.quickStatLabel}>Learned</span>
                        </div>
                        {(cspStats?.accept_rate || 0) > 0.5 && (
                            <>
                                <div style={styles.quickStatDivider}></div>
                                <div style={styles.quickStat}>
                                    <span style={{
                                        ...styles.quickStatValue,
                                        color: '#F59E0B',
                                    }}>
                                        {Math.round((cspStats?.accept_rate || 0) * 100)}%
                                    </span>
                                    <span style={styles.quickStatLabel}>Match</span>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Theme Toggle */}
                    <ThemeToggle size="small" />
                    
                    <button 
                        onClick={toggleSound} 
                        style={styles.soundToggle}
                        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                    >
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>
                    <button onClick={signOut} style={styles.logoutButton}>
                        Log Out
                    </button>
                </div>
            </header>
            
            {/* Sub-header status bar */}
            <div style={themedStyles.statusBar}>
                <div style={styles.statusItem}>
                    <span style={styles.statusIcon}>
                        {(cspStats?.total_decisions || 0) >= 10 ? '🧠' : '🌱'}
                    </span>
                    <span style={themedStyles.statusText}>
                        {(cspStats?.total_decisions || 0) >= 20 
                            ? 'Your shadow knows you well!'
                            : (cspStats?.total_decisions || 0) >= 10 
                                ? 'Shadow is learning fast...'
                                : 'Shadow is getting to know you...'}
                    </span>
                </div>
                {(cspStats?.accept_rate || 0) > 0.5 && (
                    <div style={styles.statusItem}>
                        <span style={styles.statusIcon}>✨</span>
                        <span style={themedStyles.statusText}>
                            {Math.round((cspStats?.accept_rate || 0) * 100)}% match rate
                        </span>
                    </div>
                )}
            </div>

            <main style={styles.main}>
                {/* Left Column - Decisions Management */}
                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={themedStyles.sectionTitle}>Your Decisions</h2>
                        <button 
                            onClick={() => {
                                setShowForm(!showForm);
                                setEditingDecision(null);
                            }}
                            style={themedStyles.addButton}
                            data-guide="add-decision"
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
                                style={themedStyles.filterTab(filter === type)}
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
                    <div data-guide="decision-cards">
                        <DecisionCards 
                            onFeedbackComplete={(action, card) => {
                                console.log('Feedback completed:', action, card);
                                // Refresh CSP stats when feedback is submitted
                                fetchCspStats();
                            }}
                        />
                    </div>

                    {/* Real Cognitive Load Meter */}
                    <div data-guide="cognitive-meter">
                        <CognitiveLoadMeter onLoadChange={handleCognitiveLoadChange} />
                    </div>

                    {/* CSP Stats - Learning Visualization */}
                    <div style={themedStyles.placeholderCard} data-guide="shadow-stats">
                        <h3 style={themedStyles.placeholderTitle}>Your Shadow Stats</h3>
                        
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
            
            {/* Floating Action Button for mobile/quick access */}
            {!showForm && !editingDecision && (
                <button 
                    onClick={() => {
                        setShowForm(true);
                        setEditingDecision(null);
                        // Scroll to form
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    style={styles.fab}
                    className="fab-button"
                    title="Quick add decision"
                >
                    <span style={styles.fabIcon}>+</span>
                </button>
            )}
            
            {/* Onboarding hint for new users */}
            {decisions.length === 0 && !showForm && !showGuide && (
                <div style={styles.onboardingHint}>
                    <div style={styles.onboardingArrow}>↑</div>
                    <p style={styles.onboardingText}>
                        Start by adding your first recurring decision!
                    </p>
                </div>
            )}
            
            {/* Help Button */}
            <HelpButton onShowFullGuide={() => setShowGuide(true)} />
            
            {/* Onboarding Guide */}
            {showGuide && (
                <OnboardingGuide 
                    onComplete={() => setShowGuide(false)}
                    isFirstTime={!localStorage.getItem('shadowme_onboarding_complete')}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
    },
    header: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    mascotContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandText: {
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        margin: 0,
        fontSize: '26px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    tagline: {
        margin: 0,
        fontSize: '12px',
        color: 'rgba(165, 180, 252, 0.8)',
        fontStyle: 'italic',
    },
    userName: {
        color: '#A5B4FC',
        fontWeight: '600',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    quickStats: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '10px 20px',
        borderRadius: '12px',
    },
    quickStat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'white',
    },
    quickStatLabel: {
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
    },
    quickStatDivider: {
        width: '1px',
        height: '30px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    soundToggle: {
        padding: '8px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        fontSize: '18px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    statusBar: {
        backgroundColor: '#EEF2FF',
        padding: '10px 24px',
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid #E0E7FF',
    },
    statusItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statusIcon: {
        fontSize: '16px',
    },
    statusText: {
        fontSize: '13px',
        color: '#4F46E5',
        fontWeight: '500',
    },
    greeting: {
        margin: 0,
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    logoutButton: {
        padding: '10px 18px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
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
    fab: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        border: 'none',
        boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        zIndex: 1000,
    },
    fabIcon: {
        fontSize: '28px',
        fontWeight: '300',
        color: 'white',
        lineHeight: 1,
    },
    onboardingHint: {
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        backgroundColor: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxWidth: '200px',
        textAlign: 'center',
        zIndex: 999,
        animation: 'bounce-hint 2s ease-in-out infinite',
    },
    onboardingArrow: {
        fontSize: '24px',
        color: '#4F46E5',
        animation: 'arrow-bounce 1s ease-in-out infinite',
    },
    onboardingText: {
        margin: 0,
        fontSize: '13px',
        color: '#374151',
    },
};

// Responsive media query and animations
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    @media (max-width: 900px) {
        .main {
            grid-template-columns: 1fr !important;
        }
    }
    
    @keyframes stat-pulse-animation {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.3); }
        50% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.5); }
    }
    
    @keyframes slide-in {
        from { 
            opacity: 0; 
            transform: translateY(-10px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
    
    @keyframes count-up {
        from { opacity: 0; transform: scale(0.5); }
        to { opacity: 1; transform: scale(1); }
    }
    
    .stat-pulse:hover {
        animation: stat-pulse-animation 0.3s ease;
    }
    
    .stat-value-animate {
        animation: count-up 0.5s ease-out;
    }
    
    .header-animate {
        animation: slide-in 0.5s ease-out;
    }
    
    /* Add glow to logout on hover */
    button:hover {
        filter: brightness(1.1);
    }
    
    /* Smooth transitions for cards */
    .decision-card {
        transition: all 0.3s ease;
    }
    
    .decision-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* FAB animations */
    .fab-button:hover {
        transform: scale(1.1) rotate(90deg);
        box-shadow: 0 6px 25px rgba(79, 70, 229, 0.5);
    }
    
    .fab-button:active {
        transform: scale(0.95);
    }
    
    @keyframes bounce-hint {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes arrow-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    
    /* Pulse animation for FAB when user has no decisions */
    @keyframes fab-pulse {
        0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.5); }
        70% { box-shadow: 0 0 0 20px rgba(79, 70, 229, 0); }
        100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
    
    .fab-pulse {
        animation: fab-pulse 2s infinite;
    }
`;
document.head.appendChild(dashboardStyles);
