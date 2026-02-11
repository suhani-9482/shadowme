/**
 * ThemeToggle Component
 * 
 * A beautiful animated toggle switch for dark/light theme
 * Features smooth sun/moon animation
 */

import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ size = 'medium' }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    const sizes = {
        small: { width: 50, height: 26, circle: 20, icon: 12 },
        medium: { width: 60, height: 30, circle: 24, icon: 14 },
        large: { width: 72, height: 36, circle: 28, icon: 18 },
    };
    
    const s = sizes[size] || sizes.medium;

    return (
        <button
            onClick={toggleTheme}
            style={{
                ...styles.toggle,
                width: s.width,
                height: s.height,
                backgroundColor: isDark ? '#4A3660' : '#E8E0F0',
                borderColor: isDark ? '#7C3AED' : '#BEAEDB',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {/* Track background icons */}
            <span style={{
                ...styles.trackIcon,
                left: 6,
                opacity: isDark ? 0.3 : 0,
            }}>🌙</span>
            <span style={{
                ...styles.trackIcon,
                right: 6,
                opacity: isDark ? 0 : 0.3,
            }}>☀️</span>
            
            {/* Sliding circle with icon */}
            <span 
                style={{
                    ...styles.circle,
                    width: s.circle,
                    height: s.circle,
                    transform: isDark 
                        ? `translateX(${s.width - s.circle - 6}px)` 
                        : 'translateX(0)',
                    backgroundColor: isDark ? '#8B5CF6' : '#F59E0B',
                    boxShadow: isDark 
                        ? '0 2px 8px rgba(139, 92, 246, 0.5)' 
                        : '0 2px 8px rgba(245, 158, 11, 0.5)',
                }}
            >
                <span style={{
                    ...styles.icon,
                    fontSize: s.icon,
                    transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)',
                }}>
                    {isDark ? '🌙' : '☀️'}
                </span>
            </span>
        </button>
    );
};

// Compact icon-only toggle
export const ThemeToggleIcon = () => {
    const { toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={styles.iconButton}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <span style={{
                ...styles.iconEmoji,
                transform: isDark ? 'rotate(360deg) scale(1)' : 'rotate(0deg) scale(1)',
            }}>
                {isDark ? '🌙' : '☀️'}
            </span>
        </button>
    );
};

const styles = {
    toggle: {
        position: 'relative',
        border: '2px solid',
        borderRadius: '50px',
        padding: '3px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
    },
    trackIcon: {
        position: 'absolute',
        fontSize: '14px',
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
    },
    circle: {
        position: 'relative',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        zIndex: 1,
    },
    icon: {
        transition: 'transform 0.5s ease',
        lineHeight: 1,
    },
    iconButton: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
    },
    iconEmoji: {
        fontSize: '20px',
        transition: 'transform 0.5s ease',
        display: 'block',
    },
};

// Add hover animation
const toggleStyles = document.createElement('style');
toggleStyles.textContent = `
    button:has(.theme-toggle):hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(toggleStyles);

export default ThemeToggle;
