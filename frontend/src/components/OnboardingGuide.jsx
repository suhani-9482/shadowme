/**
 * Onboarding Guide Component - Interactive Version
 * Step-by-step tutorial with animations, interactions, and celebrations
 */
import { useState, useEffect } from 'react';
import { ShadowMascot } from './ShadowMascot';
import { sounds } from '../lib/sounds';

// Guide steps configuration
const GUIDE_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to ShadowMe! 👋',
        content: "I'm your AI cognitive twin. I learn how you make decisions and help reduce your mental load.",
        mascotState: 'happy',
        mascotMessage: 'Nice to meet you!',
        interactive: {
            type: 'wave',
            instruction: 'Click the mascot to say hi!',
        },
    },
    {
        id: 'concept',
        title: 'What is a Cognitive Twin? 🧠',
        content: "Think of me as a smart assistant that learns YOUR preferences over time.",
        mascotState: 'learning',
        mascotMessage: 'I get smarter!',
        features: [
            { icon: '🎯', text: 'Learns your preferences' },
            { icon: '⏰', text: 'Knows your best times' },
            { icon: '🔄', text: 'Adapts to changes' },
        ],
    },
    {
        id: 'decisions',
        title: 'Step 1: Add Decisions 📋',
        content: "Add things you do regularly. I'll help you decide when to do them!",
        mascotState: 'curious',
        mascotMessage: 'What do you do daily?',
        cards: [
            { emoji: '📋', label: 'Tasks', example: 'Deep work, meetings', color: '#4F46E5' },
            { emoji: '🍽️', label: 'Meals', example: 'Breakfast, lunch', color: '#10B981' },
            { emoji: '☕', label: 'Breaks', example: 'Coffee, walks', color: '#F59E0B' },
        ],
    },
    {
        id: 'quick-add',
        title: 'Magic Quick-Add ✨',
        content: "Just type naturally! I detect tasks, meals, AND breaks automatically.",
        mascotState: 'happy',
        mascotMessage: 'So smart!',
        interactive: {
            type: 'typing-demo',
            examples: [
                { input: 'quick stretch break', detected: '☕ Break' },
                { input: 'team standup meeting', detected: '📋 Task' },
                { input: 'healthy lunch', detected: '🍽️ Meal' },
                { input: 'coffee and walk', detected: '☕ Break' },
                { input: 'deep focus work', detected: '📋 Task' },
            ],
        },
    },
    {
        id: 'generate',
        title: 'Step 2: Generate Plan ⚡',
        content: "Click one button, get your whole day planned!",
        mascotState: 'thinking',
        mascotMessage: 'Let me think...',
        interactive: {
            type: 'button-demo',
            buttonText: '✨ Generate My Plan',
        },
    },
    {
        id: 'cards',
        title: 'Decision Cards 🃏',
        content: "Instead of 10 tiny choices, you get 2-3 smart bundles!",
        mascotState: 'happy',
        mascotMessage: 'Less thinking!',
        demoCard: {
            emoji: '☀️',
            title: 'Morning Focus Block',
            items: ['Deep work session', 'Quick emails check'],
            why: 'You focus best in the morning!',
        },
    },
    {
        id: 'actions',
        title: 'Step 3: Teach Me! 🎓',
        content: "Your choices help me learn. Try the buttons below!",
        mascotState: 'curious',
        mascotMessage: 'Teach me!',
        interactive: {
            type: 'action-buttons',
        },
    },
    {
        id: 'learning',
        title: 'Watch Me Grow 📈',
        content: "Every interaction makes me smarter. Check your stats anytime!",
        mascotState: 'celebrating',
        mascotMessage: 'Getting better!',
        stats: [
            { label: 'Match Rate', value: '87%', color: '#10B981' },
            { label: 'Decisions', value: '24', color: '#4F46E5' },
            { label: 'Days Active', value: '7', color: '#F59E0B' },
        ],
    },
    {
        id: 'done',
        title: "You're Ready! 🎉",
        content: "Start with 3-5 decisions and watch the magic happen!",
        mascotState: 'celebrating',
        mascotMessage: "Let's go!",
        interactive: {
            type: 'celebration',
        },
    },
];

export const OnboardingGuide = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [animating, setAnimating] = useState(false);
    const [interactionDone, setInteractionDone] = useState({});
    const [typingDemo, setTypingDemo] = useState({ text: '', index: 0 });
    const [showConfetti, setShowConfetti] = useState(false);

    const step = GUIDE_STEPS[currentStep];
    const isLastStep = currentStep === GUIDE_STEPS.length - 1;
    const isFirstStep = currentStep === 0;
    const progress = ((currentStep + 1) / GUIDE_STEPS.length) * 100;

    // Typing demo animation
    useEffect(() => {
        if (step.interactive?.type === 'typing-demo' && !interactionDone[step.id]) {
            const examples = step.interactive.examples;
            let charIndex = 0;
            let exampleIndex = 0;
            
            const typeInterval = setInterval(() => {
                if (exampleIndex >= examples.length) {
                    clearInterval(typeInterval);
                    setInteractionDone(prev => ({ ...prev, [step.id]: true }));
                    return;
                }
                
                const currentExample = examples[exampleIndex].input;
                if (charIndex <= currentExample.length) {
                    setTypingDemo({
                        text: currentExample.slice(0, charIndex),
                        index: exampleIndex,
                        detected: charIndex === currentExample.length ? examples[exampleIndex].detected : null,
                    });
                    charIndex++;
                } else {
                    setTimeout(() => {
                        charIndex = 0;
                        exampleIndex++;
                    }, 1000);
                }
            }, 80);
            
            return () => clearInterval(typeInterval);
        }
    }, [step.id, step.interactive?.type, interactionDone]);

    // Celebration on last step
    useEffect(() => {
        if (isLastStep) {
            setShowConfetti(true);
            sounds.celebrate();
        }
    }, [isLastStep]);

    const goToStep = (direction) => {
        setAnimating(true);
        sounds.click();
        
        setTimeout(() => {
            if (direction === 'next' && currentStep < GUIDE_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
                // Play success sound on milestone steps
                if ((currentStep + 1) % 3 === 0) {
                    sounds.success();
                }
            } else if (direction === 'prev' && currentStep > 0) {
                setCurrentStep(prev => prev - 1);
            }
            setAnimating(false);
        }, 200);
    };

    const handleComplete = () => {
        sounds.celebrate();
        setIsVisible(false);
        localStorage.setItem('shadowme_onboarding_complete', 'true');
        setTimeout(() => onComplete?.(), 300);
    };

    const handleSkip = () => {
        sounds.click();
        setIsVisible(false);
        localStorage.setItem('shadowme_onboarding_complete', 'true');
        setTimeout(() => onComplete?.(), 300);
    };

    const handleMascotClick = () => {
        if (step.interactive?.type === 'wave') {
            sounds.success();
            setInteractionDone(prev => ({ ...prev, [step.id]: true }));
        }
    };

    const handleDemoButtonClick = () => {
        sounds.generate();
        setInteractionDone(prev => ({ ...prev, [step.id]: true }));
    };

    const handleActionButton = (action) => {
        if (action === 'accept') sounds.accept();
        else if (action === 'override') sounds.override();
        else sounds.ignore();
        setInteractionDone(prev => ({ ...prev, [step.id]: action }));
    };

    if (!isVisible) return null;

    return (
        <div style={styles.overlay}>
            {/* Confetti */}
            {showConfetti && (
                <div style={styles.confettiContainer}>
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                ...styles.confettiPiece,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][i % 5],
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Skip button */}
            <button onClick={handleSkip} style={styles.skipButton}>
                Skip ✕
            </button>

            {/* Progress bar at top */}
            <div style={styles.topProgress}>
                <div style={{ ...styles.topProgressFill, width: `${progress}%` }} />
            </div>

            {/* Main modal */}
            <div 
                style={{
                    ...styles.modal,
                    opacity: animating ? 0 : 1,
                    transform: animating ? 'scale(0.95)' : 'scale(1)',
                }}
            >
                {/* Step indicator */}
                <div style={styles.stepIndicator}>
                    Step {currentStep + 1} of {GUIDE_STEPS.length}
                </div>

                {/* Mascot */}
                <div 
                    style={{
                        ...styles.mascotContainer,
                        cursor: step.interactive?.type === 'wave' ? 'pointer' : 'default',
                        transform: interactionDone[step.id] && step.interactive?.type === 'wave' 
                            ? 'scale(1.1)' 
                            : 'scale(1)',
                    }}
                    onClick={handleMascotClick}
                >
                    <ShadowMascot 
                        state={interactionDone[step.id] && step.interactive?.type === 'wave' 
                            ? 'celebrating' 
                            : step.mascotState
                        } 
                        message={step.mascotMessage}
                        size="medium"
                    />
                    {step.interactive?.type === 'wave' && !interactionDone[step.id] && (
                        <div style={styles.clickHint}>👆 Tap me!</div>
                    )}
                </div>

                {/* Content */}
                <div style={styles.content}>
                    <h2 style={styles.title}>{step.title}</h2>
                    <p style={styles.description}>{step.content}</p>

                    {/* Features list */}
                    {step.features && (
                        <div style={styles.featuresGrid}>
                            {step.features.map((feature, i) => (
                                <div 
                                    key={i} 
                                    style={{
                                        ...styles.featureItem,
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                    className="feature-animate"
                                >
                                    <span style={styles.featureIcon}>{feature.icon}</span>
                                    <span style={styles.featureText}>{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Decision type cards */}
                    {step.cards && (
                        <div style={styles.cardsGrid}>
                            {step.cards.map((card, i) => (
                                <div 
                                    key={i} 
                                    style={{
                                        ...styles.typeCard,
                                        borderColor: card.color,
                                        animationDelay: `${i * 0.15}s`,
                                    }}
                                    className="card-pop"
                                >
                                    <span style={styles.cardEmoji}>{card.emoji}</span>
                                    <span style={styles.cardLabel}>{card.label}</span>
                                    <span style={styles.cardExample}>{card.example}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Typing demo */}
                    {step.interactive?.type === 'typing-demo' && (
                        <div style={styles.typingDemo}>
                            <div style={styles.typingInput}>
                                <span style={styles.typingIcon}>⚡</span>
                                <span style={styles.typingText}>
                                    {typingDemo.text}
                                    <span style={styles.cursor}>|</span>
                                </span>
                            </div>
                            {typingDemo.detected && (
                                <div style={styles.detectedBadge}>
                                    Detected: {typingDemo.detected}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Button demo */}
                    {step.interactive?.type === 'button-demo' && (
                        <div style={styles.buttonDemo}>
                            <button 
                                onClick={handleDemoButtonClick}
                                style={{
                                    ...styles.demoButton,
                                    transform: interactionDone[step.id] ? 'scale(0.95)' : 'scale(1)',
                                }}
                                disabled={interactionDone[step.id]}
                            >
                                {interactionDone[step.id] ? '✓ Plan Generated!' : step.interactive.buttonText}
                            </button>
                            {!interactionDone[step.id] && (
                                <p style={styles.tryIt}>👆 Try clicking!</p>
                            )}
                            {interactionDone[step.id] && (
                                <p style={styles.successText}>🎉 That's how easy it is!</p>
                            )}
                        </div>
                    )}

                    {/* Demo decision card */}
                    {step.demoCard && (
                        <div style={styles.demoCard}>
                            <div style={styles.demoCardHeader}>
                                <span style={styles.demoCardEmoji}>{step.demoCard.emoji}</span>
                                <span style={styles.demoCardTitle}>{step.demoCard.title}</span>
                            </div>
                            <ul style={styles.demoCardItems}>
                                {step.demoCard.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                            <div style={styles.demoCardWhy}>
                                <span>💡</span> {step.demoCard.why}
                            </div>
                        </div>
                    )}

                    {/* Action buttons demo */}
                    {step.interactive?.type === 'action-buttons' && (
                        <div style={styles.actionDemo}>
                            <p style={styles.actionInstruction}>
                                {interactionDone[step.id] 
                                    ? `You chose: ${interactionDone[step.id].toUpperCase()}! I learned from that.`
                                    : 'Pick any option to see how I learn:'
                                }
                            </p>
                            <div style={styles.actionButtons}>
                                <button 
                                    onClick={() => handleActionButton('accept')}
                                    style={{
                                        ...styles.acceptBtn,
                                        opacity: interactionDone[step.id] && interactionDone[step.id] !== 'accept' ? 0.5 : 1,
                                        transform: interactionDone[step.id] === 'accept' ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                >
                                    ✓ Accept
                                </button>
                                <button 
                                    onClick={() => handleActionButton('override')}
                                    style={{
                                        ...styles.overrideBtn,
                                        opacity: interactionDone[step.id] && interactionDone[step.id] !== 'override' ? 0.5 : 1,
                                        transform: interactionDone[step.id] === 'override' ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                >
                                    ↻ Override
                                </button>
                                <button 
                                    onClick={() => handleActionButton('skip')}
                                    style={{
                                        ...styles.skipBtn,
                                        opacity: interactionDone[step.id] && interactionDone[step.id] !== 'skip' ? 0.5 : 1,
                                        transform: interactionDone[step.id] === 'skip' ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                >
                                    ✕ Skip
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats demo */}
                    {step.stats && (
                        <div style={styles.statsGrid}>
                            {step.stats.map((stat, i) => (
                                <div 
                                    key={i} 
                                    style={styles.statItem}
                                    className="stat-pop"
                                >
                                    <span style={{ ...styles.statValue, color: stat.color }}>
                                        {stat.value}
                                    </span>
                                    <span style={styles.statLabel}>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Celebration */}
                    {step.interactive?.type === 'celebration' && (
                        <div style={styles.celebrationBox}>
                            <div style={styles.celebrationEmojis}>🎉 🚀 ✨</div>
                            <p style={styles.celebrationText}>
                                You're all set to start using ShadowMe!
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div style={styles.navigation}>
                    <button 
                        onClick={() => goToStep('prev')}
                        style={{
                            ...styles.navButton,
                            ...styles.prevButton,
                            visibility: isFirstStep ? 'hidden' : 'visible',
                        }}
                    >
                        ← Back
                    </button>
                    
                    {/* Step dots */}
                    <div style={styles.dots}>
                        {GUIDE_STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    sounds.click();
                                    setAnimating(true);
                                    setTimeout(() => {
                                        setCurrentStep(i);
                                        setAnimating(false);
                                    }, 200);
                                }}
                                style={{
                                    ...styles.dot,
                                    backgroundColor: i <= currentStep ? '#4F46E5' : '#E5E7EB',
                                    transform: i === currentStep ? 'scale(1.3)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>

                    {isLastStep ? (
                        <button 
                            onClick={handleComplete}
                            style={{ ...styles.navButton, ...styles.ctaButton }}
                        >
                            Start Using ShadowMe! 🚀
                        </button>
                    ) : (
                        <button 
                            onClick={() => goToStep('next')}
                            style={{ ...styles.navButton, ...styles.nextButton }}
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto',
    },
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
    },
    confettiPiece: {
        position: 'absolute',
        width: '10px',
        height: '10px',
        borderRadius: '2px',
        animation: 'confetti-fall 3s ease-in-out infinite',
    },
    topProgress: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 10002,
    },
    topProgressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899)',
        transition: 'width 0.5s ease',
    },
    skipButton: {
        position: 'fixed',
        top: '16px',
        right: '16px',
        padding: '8px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: 10003,
        transition: 'all 0.2s',
    },
    modal: {
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '85vh',
        overflow: 'auto',
    },
    stepIndicator: {
        textAlign: 'center',
        fontSize: '12px',
        color: '#9CA3AF',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    mascotContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        transition: 'transform 0.3s ease',
    },
    clickHint: {
        marginTop: '8px',
        padding: '4px 12px',
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        animation: 'bounce-hint 1s infinite',
    },
    content: {
        textAlign: 'center',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '22px',
        fontWeight: '700',
        color: '#1F2937',
    },
    description: {
        margin: '0 0 20px 0',
        fontSize: '15px',
        color: '#6B7280',
        lineHeight: '1.5',
    },
    featuresGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '16px',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        animation: 'slide-in 0.4s ease forwards',
        opacity: 0,
    },
    featureIcon: {
        fontSize: '24px',
    },
    featureText: {
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500',
    },
    cardsGrid: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    typeCard: {
        flex: 1,
        padding: '16px 12px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '2px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        animation: 'pop-in 0.4s ease forwards',
        opacity: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    cardEmoji: {
        fontSize: '28px',
    },
    cardLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1F2937',
    },
    cardExample: {
        fontSize: '11px',
        color: '#9CA3AF',
    },
    typingDemo: {
        marginBottom: '16px',
    },
    typingInput: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 18px',
        backgroundColor: '#F3F4F6',
        borderRadius: '12px',
        marginBottom: '10px',
    },
    typingIcon: {
        fontSize: '18px',
    },
    typingText: {
        fontSize: '15px',
        color: '#374151',
        fontFamily: 'inherit',
    },
    cursor: {
        animation: 'blink 1s infinite',
        color: '#4F46E5',
    },
    detectedBadge: {
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: '#ECFDF5',
        color: '#059669',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        animation: 'pop-in 0.3s ease',
    },
    buttonDemo: {
        marginBottom: '16px',
    },
    demoButton: {
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
    },
    tryIt: {
        marginTop: '12px',
        fontSize: '14px',
        color: '#6B7280',
        animation: 'bounce-hint 1s infinite',
    },
    successText: {
        marginTop: '12px',
        fontSize: '14px',
        color: '#059669',
        fontWeight: '600',
    },
    demoCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        textAlign: 'left',
        border: '2px solid #E5E7EB',
    },
    demoCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
    },
    demoCardEmoji: {
        fontSize: '24px',
    },
    demoCardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1F2937',
    },
    demoCardItems: {
        margin: '0 0 12px 24px',
        padding: 0,
        fontSize: '14px',
        color: '#4B5563',
    },
    demoCardWhy: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        backgroundColor: '#EEF2FF',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#4F46E5',
    },
    actionDemo: {
        marginBottom: '16px',
    },
    actionInstruction: {
        fontSize: '14px',
        color: '#6B7280',
        marginBottom: '12px',
    },
    actionButtons: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
    },
    acceptBtn: {
        padding: '10px 18px',
        backgroundColor: '#10B981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    overrideBtn: {
        padding: '10px 18px',
        backgroundColor: '#F59E0B',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    skipBtn: {
        padding: '10px 18px',
        backgroundColor: '#6B7280',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    statsGrid: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    statItem: {
        textAlign: 'center',
        padding: '16px 20px',
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        animation: 'pop-in 0.4s ease forwards',
    },
    statValue: {
        display: 'block',
        fontSize: '28px',
        fontWeight: '700',
    },
    statLabel: {
        fontSize: '12px',
        color: '#6B7280',
    },
    celebrationBox: {
        padding: '24px',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FDF4FF 100%)',
        borderRadius: '16px',
        marginBottom: '16px',
    },
    celebrationEmojis: {
        fontSize: '32px',
        marginBottom: '12px',
    },
    celebrationText: {
        fontSize: '16px',
        color: '#4F46E5',
        fontWeight: '600',
        margin: 0,
    },
    navigation: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #E5E7EB',
        gap: '12px',
    },
    dots: {
        display: 'flex',
        gap: '6px',
        flex: 1,
        justifyContent: 'center',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s',
        padding: 0,
    },
    navButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
    prevButton: {
        backgroundColor: '#F3F4F6',
        color: '#374151',
    },
    nextButton: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    },
    ctaButton: {
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        padding: '12px 24px',
    },
};

// Add CSS animations
const guideStyles = document.createElement('style');
guideStyles.textContent = `
    @keyframes confetti-fall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    @keyframes slide-in {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes pop-in {
        0% { opacity: 0; transform: scale(0.8); }
        70% { transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes bounce-hint {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
    
    .feature-animate {
        animation: slide-in 0.4s ease forwards;
    }
    
    .card-pop {
        animation: pop-in 0.4s ease forwards;
    }
    
    .stat-pop {
        animation: pop-in 0.5s ease forwards;
    }
`;
document.head.appendChild(guideStyles);

export default OnboardingGuide;
