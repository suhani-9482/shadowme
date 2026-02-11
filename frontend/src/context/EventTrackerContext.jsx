/**
 * EventTrackerContext
 * 
 * PURPOSE:
 * Provides event tracking functionality to the entire app.
 * Any component can use useEventTrackerContext() to log user actions.
 * 
 * HOW IT WORKS:
 * 1. Wraps the app and starts passive tracking (page load, visibility, idle)
 * 2. Provides trackAction() function to any child component
 * 3. Components call trackAction('accept', { cardId: 'card_1' }) to log actions
 */

import { createContext, useContext } from 'react';
import { useEventTracker } from '../hooks/useEventTracker';

const EventTrackerContext = createContext({
    trackAction: () => {},
    sessionId: null,
});

export const useEventTrackerContext = () => {
    return useContext(EventTrackerContext);
};

export const EventTrackerProvider = ({ children }) => {
    const { trackAction, sessionId } = useEventTracker();

    return (
        <EventTrackerContext.Provider value={{ trackAction, sessionId }}>
            {children}
        </EventTrackerContext.Provider>
    );
};
