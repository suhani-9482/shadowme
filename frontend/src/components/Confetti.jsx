/**
 * Confetti Celebration Component
 * Triggers a burst of confetti for achievements and celebrations
 */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Confetti Context
const ConfettiContext = createContext(null);

export const useConfetti = () => {
    const context = useContext(ConfettiContext);
    if (!context) {
        throw new Error('useConfetti must be used within a ConfettiProvider');
    }
    return context;
};

// Single confetti piece
const ConfettiPiece = ({ style }) => {
    return <div style={style} />;
};

// Confetti burst component
const ConfettiBurst = ({ id, onComplete }) => {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        // Generate confetti pieces
        const colors = [
            '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', 
            '#10B981', '#3B82F6', '#EF4444', '#8B5CF6',
        ];
        
        const shapes = ['square', 'circle', 'triangle'];
        
        const newPieces = Array.from({ length: 50 }, (_, i) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = Math.random() * 10 + 5;
            const startX = Math.random() * 100;
            const endX = startX + (Math.random() - 0.5) * 60;
            const rotation = Math.random() * 720 - 360;
            const duration = Math.random() * 1 + 1.5;
            const delay = Math.random() * 0.3;

            return {
                id: i,
                style: {
                    position: 'absolute',
                    left: `${startX}%`,
                    top: '-20px',
                    width: shape === 'circle' ? size : size,
                    height: shape === 'circle' ? size : size * 0.6,
                    backgroundColor: color,
                    borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px',
                    transform: shape === 'triangle' 
                        ? 'rotate(45deg)' 
                        : `rotate(${Math.random() * 360}deg)`,
                    animation: `confetti-fall-${i} ${duration}s ease-out ${delay}s forwards`,
                    opacity: 0,
                },
                keyframes: `
                    @keyframes confetti-fall-${i} {
                        0% {
                            opacity: 1;
                            transform: translateY(0) translateX(0) rotate(0deg);
                        }
                        100% {
                            opacity: 0;
                            transform: translateY(100vh) translateX(${endX - startX}vw) rotate(${rotation}deg);
                        }
                    }
                `,
            };
        });

        setPieces(newPieces);

        // Add keyframes to document
        const styleEl = document.createElement('style');
        styleEl.textContent = newPieces.map(p => p.keyframes).join('\n');
        document.head.appendChild(styleEl);

        // Cleanup after animation
        const timer = setTimeout(() => {
            document.head.removeChild(styleEl);
            onComplete(id);
        }, 3000);

        return () => {
            clearTimeout(timer);
            if (styleEl.parentNode) {
                document.head.removeChild(styleEl);
            }
        };
    }, [id, onComplete]);

    return (
        <div style={styles.burst}>
            {pieces.map(piece => (
                <ConfettiPiece key={piece.id} style={piece.style} />
            ))}
        </div>
    );
};

// Provider component
export const ConfettiProvider = ({ children }) => {
    const [bursts, setBursts] = useState([]);

    const triggerConfetti = useCallback(() => {
        const id = Date.now();
        setBursts(prev => [...prev, id]);
        return id;
    }, []);

    const removeBurst = useCallback((id) => {
        setBursts(prev => prev.filter(b => b !== id));
    }, []);

    return (
        <ConfettiContext.Provider value={triggerConfetti}>
            {children}
            <div style={styles.container}>
                {bursts.map(id => (
                    <ConfettiBurst key={id} id={id} onComplete={removeBurst} />
                ))}
            </div>
        </ConfettiContext.Provider>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9998,
    },
    burst: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
};

export default ConfettiProvider;
