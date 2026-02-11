/**
 * useEventTracker Hook
 * 
 * PURPOSE:
 * Passively tracks user behavior without them having to click anything.
 * This data helps calculate cognitive load and teaches the CSP.
 * 
 * WHAT IT TRACKS:
 * - Page load: When user opens the app
 * - Page unload: When user closes the app
 * - Visibility change: When user switches tabs (focus/blur)
 * - Idle time: When user stops moving mouse/typing for 60 seconds
 * - Manual actions: Accept, override, ignore (called explicitly)
 * 
 * HOW TO USE:
 * 1. Import this hook in your component
 * 2. Call useEventTracker() - it starts tracking automatically
 * 3. Use trackAction() to manually log user actions
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventsApi } from '../lib/api';

// Generate a unique session ID for grouping events
const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const useEventTracker = () => {
    const { user } = useAuth();
    const sessionIdRef = useRef(generateSessionId());
    const idleTimerRef = useRef(null);
    const sessionStartRef = useRef(Date.now());
    const isTrackingRef = useRef(false);

    // Helper function to send an event to the backend
    const sendEvent = useCallback(async (eventType, metadata = {}) => {
        if (!user?.id) return; // Don't track if not logged in

        try {
            await eventsApi.record(user.id, {
                event_type: eventType,
                metadata: {
                    ...metadata,
                    session_duration_ms: Date.now() - sessionStartRef.current,
                },
                session_id: sessionIdRef.current,
                timestamp: new Date().toISOString(),
            });
            console.log(`[EventTracker] Logged: ${eventType}`, metadata);
        } catch (error) {
            // Silently fail - we don't want tracking errors to break the app
            console.warn('[EventTracker] Failed to log event:', error.message);
        }
    }, [user?.id]);

    // Function to manually track user actions (accept, override, ignore, etc.)
    const trackAction = useCallback((action, details = {}) => {
        sendEvent('action', {
            action,
            ...details,
            timestamp: new Date().toISOString(),
        });
    }, [sendEvent]);

    // Reset the idle timer (called when user moves mouse or types)
    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        // Set new timer - if no activity for 60 seconds, log idle event
        idleTimerRef.current = setTimeout(() => {
            sendEvent('idle', { idle_seconds: 60 });
        }, 60000); // 60 seconds
    }, [sendEvent]);

    // Main effect that sets up all tracking
    useEffect(() => {
        if (!user?.id || isTrackingRef.current) return;
        isTrackingRef.current = true;

        // --- PAGE LOAD ---
        // Log when the app is opened
        sendEvent('page_load', {
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
        });

        // --- SESSION START ---
        sendEvent('session_start', {
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
        });

        // --- VISIBILITY CHANGE ---
        // Detect when user switches to another tab or comes back
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendEvent('visibility_change', { visible: false });
            } else {
                sendEvent('visibility_change', { visible: true });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // --- IDLE DETECTION ---
        // Reset timer on any user activity
        const handleActivity = () => resetIdleTimer();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);

        // Start the idle timer
        resetIdleTimer();

        // --- PAGE UNLOAD ---
        // Log when user closes the app or navigates away
        const handleBeforeUnload = () => {
            sendEvent('page_unload', {
                session_duration_ms: Date.now() - sessionStartRef.current,
            });
            sendEvent('session_end', {
                total_duration_ms: Date.now() - sessionStartRef.current,
            });
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // --- CLEANUP ---
        // Remove all listeners when component unmounts
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }

            isTrackingRef.current = false;
        };
    }, [user?.id, sendEvent, resetIdleTimer]);

    // Return the trackAction function so components can manually log actions
    return { trackAction, sessionId: sessionIdRef.current };
};

export default useEventTracker;
