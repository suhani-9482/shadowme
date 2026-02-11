/**
 * Login Page
 * Handles email/password signup and login with Supabase Auth
 * Enhanced with interactive animations and ShadowMe branding
 * Theme-aware (dark/light mode support)
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login = () => {
    const { signIn, signUp } = useAuth();
    const { currentTheme, isDark } = useTheme();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Animated taglines
    const taglines = [
        "Reduce decision fatigue, not add more choices",
        "Your AI thinks so you don't have to",
        "Less thinking, more doing",
        "Let your shadow handle the small stuff",
    ];
    const [currentTagline, setCurrentTagline] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTagline(prev => (prev + 1) % taglines.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signUp(email, password);
                setMessage('Account created! Check your email to confirm, then log in.');
                setIsSignUp(false);
            } else {
                await signIn(email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Theme-aware container background
    const themedContainer = {
        ...styles.container,
        background: isDark 
            ? 'linear-gradient(135deg, #2D1F3D 0%, #3F2A52 50%, #4A3660 100%)'
            : 'linear-gradient(135deg, #BEAEDB 0%, #D4C8E8 50%, #E8E0F0 100%)',
    };
    
    const themedCard = {
        ...styles.card,
        backgroundColor: isDark ? 'rgba(45, 31, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        boxShadow: isDark 
            ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(139, 92, 246, 0.15)'
            : '0 25px 50px rgba(63, 42, 82, 0.2), 0 0 100px rgba(79, 70, 229, 0.1)',
    };

    return (
        <div style={themedContainer}>
            {/* Theme toggle in top right */}
            <div style={styles.themeToggleContainer}>
                <ThemeToggle size="small" />
            </div>
            
            {/* Animated background elements */}
            <div style={{
                ...styles.bgOrb1,
                background: isDark 
                    ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)',
            }}></div>
            <div style={{
                ...styles.bgOrb2,
                background: isDark 
                    ? 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            }}></div>
            <div style={{
                ...styles.bgOrb3,
                background: isDark 
                    ? 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            }}></div>

            <div style={themedCard}>
                {/* Logo and Branding */}
                <div style={styles.logoSection}>
                    <div style={styles.logoContainer}>
                        <span style={styles.logoIcon}>{isDark ? '🌙' : '🌑'}</span>
                        <div style={{
                            ...styles.logoGlow,
                            background: isDark 
                                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)',
                        }}></div>
                    </div>
                    <h1 style={styles.title}>ShadowMe</h1>
                    <p style={{...styles.subtitle, color: currentTheme.textSecondary}}>Your AI Cognitive Twin</p>
                    <p style={{...styles.tagline, color: currentTheme.textMuted}} key={currentTagline}>
                        {taglines[currentTagline]}
                    </p>
                </div>

                {/* Features preview */}
                <div style={styles.features}>
                    <div style={{
                        ...styles.feature,
                        backgroundColor: isDark ? currentTheme.backgroundSecondary : '#F3F4F6',
                    }}>
                        <span style={styles.featureIcon}>🧠</span>
                        <span style={{...styles.featureText, color: currentTheme.textSecondary}}>Learns your patterns</span>
                    </div>
                    <div style={{
                        ...styles.feature,
                        backgroundColor: isDark ? currentTheme.backgroundSecondary : '#F3F4F6',
                    }}>
                        <span style={styles.featureIcon}>⚡</span>
                        <span style={{...styles.featureText, color: currentTheme.textSecondary}}>Reduces decisions</span>
                    </div>
                    <div style={{
                        ...styles.feature,
                        backgroundColor: isDark ? currentTheme.backgroundSecondary : '#F3F4F6',
                    }}>
                        <span style={styles.featureIcon}>🎯</span>
                        <span style={{...styles.featureText, color: currentTheme.textSecondary}}>Adapts to you</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2 style={{...styles.formTitle, color: currentTheme.textPrimary}}>
                        {isSignUp ? '✨ Create Account' : '👋 Welcome Back'}
                    </h2>

                    {error && (
                        <div style={styles.error}>
                            <span style={styles.errorIcon}>⚠️</span>
                            {error}
                        </div>
                    )}
                    {message && (
                        <div style={styles.success}>
                            <span style={styles.successIcon}>✅</span>
                            {message}
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={{...styles.label, color: currentTheme.textSecondary}}>
                            <span style={styles.labelIcon}>📧</span>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="you@example.com"
                            required
                            style={{
                                ...styles.input,
                                backgroundColor: isDark ? currentTheme.inputBg : '#FAFAFA',
                                color: currentTheme.textPrimary,
                                borderColor: focusedField === 'email' ? currentTheme.primary : currentTheme.inputBorder,
                                boxShadow: focusedField === 'email' ? `0 0 0 3px ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(79, 70, 229, 0.1)'}` : 'none',
                            }}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={{...styles.label, color: currentTheme.textSecondary}}>
                            <span style={styles.labelIcon}>🔒</span>
                            Password
                        </label>
                        <div style={styles.passwordContainer}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                style={{
                                    ...styles.input,
                                    ...styles.passwordInput,
                                    backgroundColor: isDark ? currentTheme.inputBg : '#FAFAFA',
                                    color: currentTheme.textPrimary,
                                    borderColor: focusedField === 'password' ? currentTheme.primary : currentTheme.inputBorder,
                                    boxShadow: focusedField === 'password' ? `0 0 0 3px ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(79, 70, 229, 0.1)'}` : 'none',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.showPasswordBtn}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {isSignUp && (
                            <p style={{...styles.passwordHint, color: currentTheme.textMuted}}>
                                Must be at least 6 characters
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.8 : 1,
                            transform: loading ? 'scale(0.98)' : 'scale(1)',
                        }}
                    >
                        {loading ? (
                            <span style={styles.loadingContent}>
                                <span style={styles.spinner}></span>
                                Please wait...
                            </span>
                        ) : (
                            <span>
                                {isSignUp ? '🚀 Create Account' : '🔓 Log In'}
                            </span>
                        )}
                    </button>

                    <div style={styles.divider}>
                        <span style={{...styles.dividerLine, backgroundColor: currentTheme.border}}></span>
                        <span style={{...styles.dividerText, color: currentTheme.textMuted}}>or</span>
                        <span style={{...styles.dividerLine, backgroundColor: currentTheme.border}}></span>
                    </div>

                    <p style={{...styles.switchText, color: currentTheme.textSecondary}}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setMessage('');
                            }}
                            style={{...styles.switchButton, color: currentTheme.primary}}
                        >
                            {isSignUp ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </form>

                {/* Footer */}
                <div style={{...styles.footer, borderTopColor: currentTheme.border}}>
                    <p style={{...styles.footerText, color: currentTheme.textMuted}}>
                        🌙 Built for humans who are tired of deciding
                    </p>
                </div>
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    themeToggleContainer: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
    },
    // Animated background orbs
    bgOrb1: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)',
        top: '-100px',
        right: '-100px',
        animation: 'float 6s ease-in-out infinite',
    },
    bgOrb2: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
        bottom: '-50px',
        left: '-50px',
        animation: 'float 8s ease-in-out infinite reverse',
    },
    bgOrb3: {
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
        top: '50%',
        left: '20%',
        animation: 'float 10s ease-in-out infinite',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 100px rgba(79, 70, 229, 0.1)',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)',
    },
    logoSection: {
        marginBottom: '24px',
    },
    logoContainer: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '12px',
    },
    logoIcon: {
        fontSize: '56px',
        display: 'block',
        animation: 'pulse 2s ease-in-out infinite',
    },
    logoGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)',
        animation: 'glow 2s ease-in-out infinite',
        zIndex: -1,
    },
    title: {
        margin: '0 0 4px 0',
        fontSize: '36px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        margin: '0 0 8px 0',
        fontSize: '16px',
        color: '#6B7280',
        fontWeight: '500',
    },
    tagline: {
        margin: 0,
        fontSize: '14px',
        color: '#9CA3AF',
        fontStyle: 'italic',
        minHeight: '20px',
        animation: 'fadeIn 0.5s ease-in-out',
    },
    features: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: '#F3F4F6',
        borderRadius: '20px',
        fontSize: '12px',
    },
    featureIcon: {
        fontSize: '14px',
    },
    featureText: {
        color: '#4B5563',
        fontWeight: '500',
    },
    form: {
        textAlign: 'left',
    },
    formTitle: {
        margin: '0 0 20px 0',
        fontSize: '22px',
        textAlign: 'center',
        color: '#1F2937',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: '18px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
    },
    labelIcon: {
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #E5E7EB',
        borderRadius: '12px',
        fontSize: '16px',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        outline: 'none',
        backgroundColor: '#FAFAFA',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: '50px',
    },
    showPasswordBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '4px',
    },
    passwordHint: {
        margin: '6px 0 0 0',
        fontSize: '12px',
        color: '#9CA3AF',
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
    },
    loadingContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    spinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        padding: '0 16px',
        color: '#9CA3AF',
        fontSize: '13px',
    },
    error: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
        padding: '12px 16px',
        borderRadius: '10px',
        marginBottom: '16px',
        fontSize: '14px',
        border: '1px solid #FECACA',
    },
    errorIcon: {
        fontSize: '16px',
    },
    success: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#F0FDF4',
        color: '#16A34A',
        padding: '12px 16px',
        borderRadius: '10px',
        marginBottom: '16px',
        fontSize: '14px',
        border: '1px solid #BBF7D0',
    },
    successIcon: {
        fontSize: '16px',
    },
    switchText: {
        textAlign: 'center',
        fontSize: '14px',
        color: '#6B7280',
    },
    switchButton: {
        background: 'none',
        border: 'none',
        color: '#4F46E5',
        fontWeight: '600',
        cursor: 'pointer',
        marginLeft: '4px',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
    },
    footer: {
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid #E5E7EB',
    },
    footerText: {
        margin: 0,
        fontSize: '13px',
        color: '#9CA3AF',
    },
};

// Add keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes glow {
        0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    input::placeholder {
        color: #9CA3AF;
    }
    
    button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }
    
    button:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(styleSheet);
