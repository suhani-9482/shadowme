/**
 * Protected Route Component
 * Handles route protection and onboarding redirect logic
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, profile, loading, profileLoading } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading || profileLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    // Not logged in -> redirect to login
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Logged in but no profile or onboarding not completed -> redirect to onboarding
    // (except if already on onboarding page)
    if (location.pathname !== '/onboarding') {
        if (!profile || !profile.onboarding_completed) {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return children;
};

export const PublicRoute = ({ children }) => {
    const { user, profile, loading, profileLoading } = useAuth();

    // Show loading while checking auth state
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    // If logged in, redirect based on profile status
    if (user) {
        if (profileLoading) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh' 
                }}>
                    <p>Loading profile...</p>
                </div>
            );
        }
        
        if (!profile || !profile.onboarding_completed) {
            return <Navigate to="/onboarding" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
