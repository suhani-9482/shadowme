/**
 * Login Page
 * Handles email/password signup and login with Supabase Auth
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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
                // Auth context will handle redirect
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>ShadowMe</h1>
                <p style={styles.subtitle}>Your AI Cognitive Twin</p>
                <p style={styles.tagline}>Reduce decision fatigue, not add more choices</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2 style={styles.formTitle}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    {error && <div style={styles.error}>{error}</div>}
                    {message && <div style={styles.success}>{message}</div>}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={styles.input}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>

                    <p style={styles.switchText}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setMessage('');
                            }}
                            style={styles.switchButton}
                        >
                            {isSignUp ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </form>
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
        backgroundColor: '#f5f5f5',
        padding: '20px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        margin: '0 0 4px 0',
        fontSize: '16px',
        color: '#666',
    },
    tagline: {
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#888',
        fontStyle: 'italic',
    },
    form: {
        textAlign: 'left',
    },
    formTitle: {
        margin: '0 0 20px 0',
        fontSize: '20px',
        textAlign: 'center',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
    },
    error: {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px',
    },
    success: {
        backgroundColor: '#D1FAE5',
        color: '#059669',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px',
    },
    switchText: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
        color: '#666',
    },
    switchButton: {
        background: 'none',
        border: 'none',
        color: '#4F46E5',
        fontWeight: '600',
        cursor: 'pointer',
        marginLeft: '4px',
    },
};
