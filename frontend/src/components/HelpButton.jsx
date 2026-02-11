/**
 * Help Button Component
 * Floating help button with quick tips and access to full guide
 */
import { useState } from 'react';
import { sounds } from '../lib/sounds';

const QUICK_TIPS = [
    {
        icon: '➕',
        title: 'Adding Decisions',
        tip: 'Type naturally in the quick-add box. I detect task/meal/break automatically!',
    },
    {
        icon: '⚡',
        title: 'Generate Plan',
        tip: 'Click "Generate My Plan" to create smart decision cards for your day.',
    },
    {
        icon: '✓',
        title: 'Accept Cards',
        tip: 'Accept = "Yes!" | Override = "I prefer..." | Skip = "Not now"',
    },
    {
        icon: '🧠',
        title: 'Learning',
        tip: 'Every choice teaches your shadow. More interactions = better suggestions!',
    },
    {
        icon: '📊',
        title: 'Cognitive Load',
        tip: 'When tired, I take more control. Fresh? You get more choices.',
    },
    {
        icon: '🔊',
        title: 'Sounds',
        tip: 'Toggle sounds on/off with the speaker button in the header.',
    },
];

export const HelpButton = ({ onShowFullGuide }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const toggleHelp = () => {
        sounds.click();
        setIsOpen(!isOpen);
    };

    const handleShowGuide = () => {
        sounds.click();
        setIsOpen(false);
        onShowFullGuide?.();
    };

    return (
        <div style={styles.container}>
            {/* Help Panel */}
            {isOpen && (
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <h3 style={styles.panelTitle}>💡 Quick Help</h3>
                        <button onClick={toggleHelp} style={styles.closeBtn}>✕</button>
                    </div>
                    
                    <div style={styles.tipsGrid}>
                        {QUICK_TIPS.map((item, i) => (
                            <div key={i} style={styles.tipCard}>
                                <span style={styles.tipIcon}>{item.icon}</span>
                                <div style={styles.tipContent}>
                                    <span style={styles.tipTitle}>{item.title}</span>
                                    <span style={styles.tipText}>{item.tip}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.panelFooter}>
                        <button onClick={handleShowGuide} style={styles.guideButton}>
                            📖 View Full Tutorial
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button 
                onClick={toggleHelp}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                    ...styles.fab,
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
            >
                {isOpen ? '✕' : '?'}
            </button>

            {/* Tooltip */}
            {showTooltip && !isOpen && (
                <div style={styles.tooltip}>Need help?</div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        zIndex: 9000,
    },
    fab: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        color: 'white',
        border: 'none',
        fontSize: '24px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tooltip: {
        position: 'absolute',
        bottom: '60px',
        right: '0',
        backgroundColor: '#1F2937',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
    },
    panel: {
        position: 'absolute',
        bottom: '60px',
        right: '0',
        width: '320px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
    },
    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
    },
    panelTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#1F2937',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: '#6B7280',
        cursor: 'pointer',
        padding: '4px',
    },
    tipsGrid: {
        padding: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
    },
    tipCard: {
        display: 'flex',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        borderRadius: '10px',
        marginBottom: '8px',
        transition: 'all 0.2s',
    },
    tipIcon: {
        fontSize: '20px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    tipContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    tipTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1F2937',
    },
    tipText: {
        fontSize: '12px',
        color: '#6B7280',
        lineHeight: '1.4',
    },
    panelFooter: {
        padding: '12px 16px',
        borderTop: '1px solid #E5E7EB',
    },
    guideButton: {
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};

// Add animation
const helpStyles = document.createElement('style');
helpStyles.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(helpStyles);

export default HelpButton;
