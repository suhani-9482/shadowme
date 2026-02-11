/**
 * Sound Effects Utility
 * Provides subtle audio feedback for UI interactions
 * Uses Web Audio API for low-latency, lightweight sounds
 */

class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // Keep sounds subtle
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    // Toggle sounds on/off
    toggle(enabled) {
        this.enabled = enabled;
    }

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // Play a simple tone
    playTone(frequency, duration = 0.1, type = 'sine') {
        if (!this.enabled) return;
        
        try {
            const ctx = this.init();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    // === Pre-defined Sound Effects ===

    // Success sound - ascending two-tone
    success() {
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.15), 100); // E5
    }

    // Click/tap sound - short pop
    click() {
        this.playTone(800, 0.05, 'square');
    }

    // Soft click for hover
    hover() {
        if (!this.enabled) return;
        try {
            const ctx = this.init();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.03);
        } catch (e) {
            // Silently fail
        }
    }

    // Error sound - descending tone
    error() {
        this.playTone(400, 0.1);
        setTimeout(() => this.playTone(300, 0.2), 100);
    }

    // Accept/confirm sound - cheerful ascending
    accept() {
        this.playTone(440, 0.08); // A4
        setTimeout(() => this.playTone(554.37, 0.08), 80); // C#5
        setTimeout(() => this.playTone(659.25, 0.12), 160); // E5
    }

    // Override sound - neutral two-tone
    override() {
        this.playTone(440, 0.1);
        setTimeout(() => this.playTone(523.25, 0.1), 100);
    }

    // Ignore/skip sound - soft descending
    ignore() {
        this.playTone(440, 0.08);
        setTimeout(() => this.playTone(392, 0.1), 80);
    }

    // Celebration sound - fanfare
    celebrate() {
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 0.1), 200); // G5
        setTimeout(() => this.playTone(1046.50, 0.2), 300); // C6
    }

    // Notification sound - gentle ping
    notify() {
        this.playTone(880, 0.1);
    }

    // Generate sound - whoosh-like
    generate() {
        if (!this.enabled) return;
        try {
            const ctx = this.init();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(200, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
            // Silently fail
        }
    }

    // Add decision sound
    add() {
        this.playTone(600, 0.08);
        setTimeout(() => this.playTone(800, 0.1), 80);
    }

    // Delete sound
    delete() {
        this.playTone(400, 0.1);
        setTimeout(() => this.playTone(300, 0.15), 80);
    }
}

// Export singleton instance
export const sounds = new SoundEffects();

// Also export class for testing
export default SoundEffects;
