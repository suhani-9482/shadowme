/**
 * ThemeContext - Dark/Light Theme Toggle
 * 
 * Custom Purple Theme:
 * - Dark: #3F2A52 (deep purple)
 * - Light: #BEAEDB (soft lavender)
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme color definitions
export const themes = {
    light: {
        name: 'light',
        // Primary colors
        primary: '#4F46E5',
        primaryHover: '#4338CA',
        accent: '#7C3AED',
        
        // Background colors
        background: '#BEAEDB',
        backgroundSecondary: '#D4C8E8',
        backgroundCard: 'rgba(255, 255, 255, 0.95)',
        backgroundInput: 'rgba(255, 255, 255, 0.9)',
        
        // Header
        headerBg: 'linear-gradient(135deg, #3F2A52 0%, #5D4275 100%)',
        headerText: '#ffffff',
        
        // Text colors
        textPrimary: '#1F2937',
        textSecondary: '#4B5563',
        textMuted: '#6B7280',
        textInverse: '#ffffff',
        
        // Status bar
        statusBarBg: '#E8E0F0',
        statusBarBorder: '#D4C8E8',
        statusBarText: '#5D4275',
        
        // Borders & Shadows
        border: 'rgba(63, 42, 82, 0.2)',
        borderLight: 'rgba(63, 42, 82, 0.1)',
        shadow: '0 2px 10px rgba(63, 42, 82, 0.15)',
        shadowHover: '0 8px 25px rgba(63, 42, 82, 0.2)',
        
        // Component specific
        cardBg: '#ffffff',
        inputBg: '#ffffff',
        inputBorder: '#D4C8E8',
        buttonBg: '#4F46E5',
        buttonText: '#ffffff',
        
        // State colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        
        // Gradient
        gradient: 'linear-gradient(135deg, #BEAEDB 0%, #D4C8E8 100%)',
    },
    dark: {
        name: 'dark',
        // Primary colors
        primary: '#A78BFA',
        primaryHover: '#C4B5FD',
        accent: '#8B5CF6',
        
        // Background colors
        background: '#3F2A52',
        backgroundSecondary: '#2D1F3D',
        backgroundCard: 'rgba(45, 31, 61, 0.95)',
        backgroundInput: 'rgba(30, 20, 42, 0.8)',
        
        // Header
        headerBg: 'linear-gradient(135deg, #2D1F3D 0%, #3F2A52 100%)',
        headerText: '#ffffff',
        
        // Text colors
        textPrimary: '#F3F4F6',
        textSecondary: '#D1D5DB',
        textMuted: '#9CA3AF',
        textInverse: '#1F2937',
        
        // Status bar
        statusBarBg: '#4A3660',
        statusBarBorder: '#5D4275',
        statusBarText: '#D4C8E8',
        
        // Borders & Shadows
        border: 'rgba(190, 174, 219, 0.3)',
        borderLight: 'rgba(190, 174, 219, 0.15)',
        shadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        shadowHover: '0 8px 25px rgba(0, 0, 0, 0.4)',
        
        // Component specific
        cardBg: '#4A3660',
        inputBg: '#2D1F3D',
        inputBorder: '#5D4275',
        buttonBg: '#A78BFA',
        buttonText: '#1F2937',
        
        // State colors
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA',
        
        // Gradient
        gradient: 'linear-gradient(135deg, #3F2A52 0%, #2D1F3D 100%)',
    },
};

export const ThemeProvider = ({ children }) => {
    // Check for saved preference or system preference
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('shadowme_theme');
        if (saved) return saved;
        
        // Check system preference
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const currentTheme = themes[theme];

    // Toggle theme
    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('shadowme_theme', newTheme);
            return newTheme;
        });
    };

    // Set specific theme
    const setThemeMode = (mode) => {
        if (themes[mode]) {
            setTheme(mode);
            localStorage.setItem('shadowme_theme', mode);
        }
    };

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        const t = currentTheme;
        
        // Set CSS variables
        root.style.setProperty('--bg-primary', t.background);
        root.style.setProperty('--bg-secondary', t.backgroundSecondary);
        root.style.setProperty('--bg-card', t.cardBg);
        root.style.setProperty('--bg-input', t.inputBg);
        root.style.setProperty('--text-primary', t.textPrimary);
        root.style.setProperty('--text-secondary', t.textSecondary);
        root.style.setProperty('--text-muted', t.textMuted);
        root.style.setProperty('--border-color', t.border);
        root.style.setProperty('--shadow', t.shadow);
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--accent', t.accent);
        
        // Update body background
        document.body.style.backgroundColor = t.background;
        document.body.style.color = t.textPrimary;
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Update meta theme-color
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = t.background;
        
    }, [theme, currentTheme]);

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            currentTheme, 
            toggleTheme, 
            setThemeMode,
            isDark: theme === 'dark',
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
