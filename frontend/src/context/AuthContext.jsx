/**
 * Auth Context
 * Manages authentication state using Supabase Auth
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { profileApi } from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);
                setUser(session?.user ?? null);
                
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Fetch user profile from backend
    const fetchProfile = async (userId) => {
        setProfileLoading(true);
        try {
            const data = await profileApi.get(userId);
            setProfile(data.profile);
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
            return { exists: false, profile: null };
        } finally {
            setProfileLoading(false);
        }
    };

    // Sign up with email and password
    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) throw error;
        return data;
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        return data;
    };

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setProfile(null);
    };

    // Check if user has completed onboarding
    const hasCompletedOnboarding = () => {
        return profile?.onboarding_completed === true;
    };

    // Refresh profile data
    const refreshProfile = async () => {
        if (user) {
            return await fetchProfile(user.id);
        }
    };

    const value = {
        user,
        profile,
        loading,
        profileLoading,
        signUp,
        signIn,
        signOut,
        hasCompletedOnboarding,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
