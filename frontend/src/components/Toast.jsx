/**
 * Toast Notification Component
 * Shows brief, non-blocking feedback messages
 */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast types with their configurations
const TOAST_TYPES = {
    success: {
        icon: '✓',
        bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: 'white',
    },
    error: {
        icon: '✕',
        bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        color: 'white',
    },
    info: {
        icon: 'ℹ',
        bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        color: 'white',
    },
    warning: {
        icon: '⚠',
        bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        color: 'white',
    },
    celebration: {
        icon: '🎉',
        bg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        color: 'white',
    },
    shadow: {
        icon: '🌑',
        bg: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        color: 'white',
    },
};

// Single Toast Component
const Toast = ({ id, message, type = 'info', duration = 3000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div 
            style={{
                ...styles.toast,
                background: config.bg,
                color: config.color,
                animation: isExiting ? 'toast-exit 0.3s ease forwards' : 'toast-enter 0.3s ease forwards',
            }}
            onClick={handleClose}
        >
            <span style={styles.icon}>{config.icon}</span>
            <span style={styles.message}>{message}</span>
            <button style={styles.closeBtn} onClick={handleClose}>×</button>
        </div>
    );
};

// Toast Container & Provider
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Convenience methods
    const toast = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
    toast.success = (message, duration) => addToast(message, 'success', duration);
    toast.error = (message, duration) => addToast(message, 'error', duration);
    toast.warning = (message, duration) => addToast(message, 'warning', duration);
    toast.celebrate = (message, duration) => addToast(message, 'celebration', duration);
    toast.shadow = (message, duration) => addToast(message, 'shadow', duration);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div style={styles.container}>
                {toasts.map(t => (
                    <Toast 
                        key={t.id} 
                        {...t} 
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
        pointerEvents: 'none',
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        pointerEvents: 'auto',
        minWidth: '200px',
        maxWidth: '400px',
    },
    icon: {
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
    },
    message: {
        flex: 1,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'inherit',
        fontSize: '18px',
        cursor: 'pointer',
        opacity: 0.7,
        padding: '0 4px',
    },
};

// Add animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes toast-enter {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes toast-exit {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
        }
    }
`;
document.head.appendChild(toastStyles);

export default ToastProvider;
