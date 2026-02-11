/**
 * Shadow Mascot Component
 * An animated character that represents the user's "shadow"
 * Reacts to different states: thinking, happy, learning, idle
 */
import { useState, useEffect } from 'react';

export const ShadowMascot = ({ state = 'idle', message = '', size = 'medium' }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(message);

    useEffect(() => {
        setIsAnimating(true);
        setCurrentMessage(message);
        const timer = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timer);
    }, [state, message]);

    // Size configurations
    const sizes = {
        small: { container: 60, face: 40, eye: 6 },
        medium: { container: 80, face: 56, eye: 8 },
        large: { container: 120, face: 80, eye: 12 },
    };
    const s = sizes[size] || sizes.medium;

    // State configurations
    const stateConfig = {
        idle: {
            bgColor: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            eyeStyle: 'normal',
            animation: 'float',
            defaultMessage: "I'm here to help",
        },
        thinking: {
            bgColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            eyeStyle: 'looking-up',
            animation: 'pulse',
            defaultMessage: 'Thinking...',
        },
        happy: {
            bgColor: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            eyeStyle: 'happy',
            animation: 'bounce',
            defaultMessage: 'Great choice!',
        },
        learning: {
            bgColor: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            eyeStyle: 'curious',
            animation: 'wiggle',
            defaultMessage: 'Learning from you...',
        },
        sleeping: {
            bgColor: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
            eyeStyle: 'closed',
            animation: 'none',
            defaultMessage: 'Zzz...',
        },
        celebrating: {
            bgColor: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
            eyeStyle: 'sparkle',
            animation: 'celebrate',
            defaultMessage: 'Amazing!',
        },
    };

    const config = stateConfig[state] || stateConfig.idle;
    const displayMessage = currentMessage || config.defaultMessage;

    // Render eyes based on state
    const renderEyes = () => {
        const eyeSize = s.eye;
        const eyeGap = s.face * 0.3;

        switch (config.eyeStyle) {
            case 'happy':
                return (
                    <>
                        <div style={{
                            ...styles.eye,
                            width: eyeSize * 1.2,
                            height: eyeSize * 0.6,
                            borderRadius: `${eyeSize}px ${eyeSize}px 0 0`,
                            backgroundColor: 'white',
                            marginRight: eyeGap / 2,
                        }} />
                        <div style={{
                            ...styles.eye,
                            width: eyeSize * 1.2,
                            height: eyeSize * 0.6,
                            borderRadius: `${eyeSize}px ${eyeSize}px 0 0`,
                            backgroundColor: 'white',
                            marginLeft: eyeGap / 2,
                        }} />
                    </>
                );
            case 'closed':
                return (
                    <>
                        <div style={{
                            width: eyeSize * 1.5,
                            height: 2,
                            backgroundColor: 'white',
                            marginRight: eyeGap / 2,
                            borderRadius: 2,
                        }} />
                        <div style={{
                            width: eyeSize * 1.5,
                            height: 2,
                            backgroundColor: 'white',
                            marginLeft: eyeGap / 2,
                            borderRadius: 2,
                        }} />
                    </>
                );
            case 'looking-up':
                return (
                    <>
                        <div style={{
                            ...styles.eye,
                            width: eyeSize,
                            height: eyeSize,
                            backgroundColor: 'white',
                            marginRight: eyeGap / 2,
                            position: 'relative',
                        }}>
                            <div style={{
                                ...styles.pupil,
                                width: eyeSize * 0.5,
                                height: eyeSize * 0.5,
                                top: 0,
                            }} />
                        </div>
                        <div style={{
                            ...styles.eye,
                            width: eyeSize,
                            height: eyeSize,
                            backgroundColor: 'white',
                            marginLeft: eyeGap / 2,
                            position: 'relative',
                        }}>
                            <div style={{
                                ...styles.pupil,
                                width: eyeSize * 0.5,
                                height: eyeSize * 0.5,
                                top: 0,
                            }} />
                        </div>
                    </>
                );
            case 'sparkle':
                return (
                    <>
                        <span style={{ fontSize: eyeSize * 1.5, marginRight: eyeGap / 2 }}>✨</span>
                        <span style={{ fontSize: eyeSize * 1.5, marginLeft: eyeGap / 2 }}>✨</span>
                    </>
                );
            case 'curious':
                return (
                    <>
                        <div style={{
                            ...styles.eye,
                            width: eyeSize * 1.2,
                            height: eyeSize * 1.2,
                            backgroundColor: 'white',
                            marginRight: eyeGap / 2,
                        }} />
                        <div style={{
                            ...styles.eye,
                            width: eyeSize * 0.8,
                            height: eyeSize * 0.8,
                            backgroundColor: 'white',
                            marginLeft: eyeGap / 2,
                        }} />
                    </>
                );
            default: // normal
                return (
                    <>
                        <div style={{
                            ...styles.eye,
                            width: eyeSize,
                            height: eyeSize,
                            backgroundColor: 'white',
                            marginRight: eyeGap / 2,
                        }} />
                        <div style={{
                            ...styles.eye,
                            width: eyeSize,
                            height: eyeSize,
                            backgroundColor: 'white',
                            marginLeft: eyeGap / 2,
                        }} />
                    </>
                );
        }
    };

    return (
        <div style={styles.wrapper}>
            <div 
                style={{
                    ...styles.container,
                    width: s.container,
                    height: s.container,
                }}
                className={`mascot-${config.animation}`}
            >
                {/* Shadow/Glow effect */}
                <div style={{
                    ...styles.glow,
                    background: config.bgColor,
                    opacity: 0.3,
                    filter: 'blur(15px)',
                }} />
                
                {/* Face */}
                <div 
                    style={{
                        ...styles.face,
                        width: s.face,
                        height: s.face,
                        background: config.bgColor,
                        transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
                    }}
                >
                    {/* Eyes */}
                    <div style={styles.eyes}>
                        {renderEyes()}
                    </div>
                    
                    {/* Mouth (optional based on state) */}
                    {state === 'happy' && (
                        <div style={styles.mouth} />
                    )}
                </div>
            </div>
            
            {/* Message bubble */}
            {displayMessage && (
                <div style={styles.messageBubble}>
                    <span>{displayMessage}</span>
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    container: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    face: {
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease',
    },
    eyes: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '-4px',
    },
    eye: {
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pupil: {
        backgroundColor: '#1F2937',
        borderRadius: '50%',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    mouth: {
        width: '12px',
        height: '6px',
        borderRadius: '0 0 12px 12px',
        backgroundColor: 'white',
        marginTop: '4px',
    },
    messageBubble: {
        backgroundColor: 'white',
        padding: '6px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#374151',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '150px',
        textAlign: 'center',
        position: 'relative',
    },
};

// Add animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes mascot-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes mascot-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes mascot-bounce {
        0%, 100% { transform: translateY(0px); }
        25% { transform: translateY(-8px); }
        50% { transform: translateY(0px); }
        75% { transform: translateY(-4px); }
    }
    
    @keyframes mascot-wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
    }
    
    @keyframes mascot-celebrate {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        50% { transform: scale(1) rotate(0deg); }
        75% { transform: scale(1.1) rotate(5deg); }
    }
    
    .mascot-float { animation: mascot-float 3s ease-in-out infinite; }
    .mascot-pulse { animation: mascot-pulse 1s ease-in-out infinite; }
    .mascot-bounce { animation: mascot-bounce 0.6s ease-in-out; }
    .mascot-wiggle { animation: mascot-wiggle 0.5s ease-in-out infinite; }
    .mascot-celebrate { animation: mascot-celebrate 0.5s ease-in-out infinite; }
`;
document.head.appendChild(styleSheet);

export default ShadowMascot;
