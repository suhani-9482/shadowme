-- =====================================================
-- ShadowMe - Supabase Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates all tables needed for the ShadowMe cognitive twin app
-- =====================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- Stores user profile + Cognitive Shadow Profile (CSP) as behavioral vector
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic onboarding preferences
    wake_time TIME DEFAULT '07:00',
    sleep_time TIME DEFAULT '23:00',
    peak_focus_start TIME DEFAULT '09:00',
    peak_focus_end TIME DEFAULT '12:00',
    diet_preference TEXT DEFAULT 'balanced', -- balanced, vegetarian, vegan, keto, etc.
    work_style TEXT DEFAULT 'flexible', -- flexible, structured, deep_work
    break_preference TEXT DEFAULT 'short', -- short (5-10min), long (15-20min)
    
    -- Cognitive Shadow Profile (CSP) - Behavioral Vector Model
    -- This stores weighted preferences learned from user behavior
    -- Keys represent decision contexts, values are weights (0.0 to 1.0)
    csp_vector JSONB DEFAULT '{
        "morning_task_weight": 0.5,
        "afternoon_task_weight": 0.5,
        "evening_task_weight": 0.3,
        "high_effort_preference": 0.5,
        "low_effort_preference": 0.5,
        "break_frequency_weight": 0.5,
        "meal_regularity_weight": 0.5,
        "focus_duration_preference": 50,
        "context_busy_weight": 0.5,
        "context_free_weight": 0.5,
        "accept_rate": 0.5,
        "override_rate": 0.0,
        "total_decisions": 0,
        "total_accepts": 0,
        "total_overrides": 0,
        "total_ignores": 0
    }'::jsonb,
    
    csp_last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. DECISIONS TABLE
-- Recurring decisions that ShadowMe acts upon (tasks, meals, breaks)
-- =====================================================
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Decision type: task, meal, or break
    type TEXT NOT NULL CHECK (type IN ('task', 'meal', 'break')),
    
    -- Core fields
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Task-specific fields
    effort INT CHECK (effort >= 1 AND effort <= 5), -- 1=easy, 5=hard
    estimated_minutes INT DEFAULT 30,
    
    -- Meal-specific fields
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    
    -- Break-specific fields
    break_duration INT DEFAULT 10, -- minutes
    
    -- Scheduling
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'weekdays', 'weekends')),
    preferred_time TIME, -- optional preferred time of day
    
    -- State
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. DAILY_PLANS TABLE
-- Stores generated plans with compressed decision cards
-- =====================================================
CREATE TABLE daily_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Plan date (one plan per day per user)
    plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Compressed Decision Cards - bundles to reduce micro-decisions
    -- Each card contains: title, recommended_action, why, items[], autonomy_level
    compressed_decision_cards JSONB DEFAULT '[]'::jsonb,
    
    -- Cognitive Load Meter (0-100)
    -- Computed from: decisions today, overrides, time on site, time-of-day
    cognitive_load INT DEFAULT 50 CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
    
    -- Autonomy Level derived from cognitive load
    -- low load (0-33) -> 'manual' (more user control)
    -- medium load (34-66) -> 'assist' (balanced)
    -- high load (67-100) -> 'auto' (strong defaults, 1-tap accept)
    autonomy_level TEXT DEFAULT 'assist' CHECK (autonomy_level IN ('manual', 'assist', 'auto')),
    
    -- Plan state
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMPTZ,
    
    -- Raw data used to generate (for debugging/analysis)
    generation_context JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one plan per day per user
    UNIQUE(user_id, plan_date)
);

-- =====================================================
-- 4. FEEDBACK TABLE
-- Records user actions on decision cards (accept/override/ignore)
-- Used to update CSP weights
-- =====================================================
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Reference to the plan
    plan_id UUID REFERENCES daily_plans(id) ON DELETE CASCADE NOT NULL,
    
    -- What item received feedback
    item_type TEXT NOT NULL CHECK (item_type IN ('card', 'task', 'meal', 'break')),
    item_id TEXT, -- references the item within the card
    item_value TEXT, -- what was suggested
    
    -- User action
    action TEXT NOT NULL CHECK (action IN ('accept', 'override', 'ignore')),
    
    -- If overridden, what did user choose instead
    override_value TEXT,
    
    -- Optional rating for sentiment (-1, 0, +1)
    rating INT DEFAULT 0 CHECK (rating >= -1 AND rating <= 1),
    
    -- Context at time of feedback (for CSP learning)
    context JSONB DEFAULT '{}'::jsonb, -- time_of_day, cognitive_load, etc.
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INTERACTION_EVENTS TABLE
-- Passive tracking of user behavior for CSP learning
-- =====================================================
CREATE TABLE interaction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Event type
    event_type TEXT NOT NULL, -- page_load, page_unload, visibility_change, idle, action, session_start, session_end
    
    -- Event metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    -- For visibility_change: { "visible": true/false }
    -- For idle: { "idle_seconds": 60 }
    -- For action: { "action": "accept", "target": "card_1" }
    -- For page_load: { "page": "/dashboard" }
    
    -- Timestamp of event
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Session ID to group events
    session_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_events ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- DECISIONS policies
CREATE POLICY "Users can view own decisions"
    ON decisions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
    ON decisions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
    ON decisions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions"
    ON decisions FOR DELETE
    USING (auth.uid() = user_id);

-- DAILY_PLANS policies
CREATE POLICY "Users can view own plans"
    ON daily_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
    ON daily_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
    ON daily_plans FOR UPDATE
    USING (auth.uid() = user_id);

-- FEEDBACK policies
CREATE POLICY "Users can view own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- INTERACTION_EVENTS policies
CREATE POLICY "Users can view own events"
    ON interaction_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
    ON interaction_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SERVICE ROLE POLICIES (for backend with service key)
-- These allow the backend to access data with service role
-- =====================================================

-- Allow service role to bypass RLS (Supabase service key has this by default)
-- No additional policies needed - service role bypasses RLS

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_decisions_user_id ON decisions(user_id);
CREATE INDEX idx_decisions_type ON decisions(type);
CREATE INDEX idx_daily_plans_user_date ON daily_plans(user_id, plan_date);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_plan_id ON feedback(plan_id);
CREATE INDEX idx_interaction_events_user_id ON interaction_events(user_id);
CREATE INDEX idx_interaction_events_timestamp ON interaction_events(timestamp);
CREATE INDEX idx_interaction_events_session ON interaction_events(session_id);

-- =====================================================
-- HELPER FUNCTIONS (optional, for future use)
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decisions_updated_at
    BEFORE UPDATE ON decisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_plans_updated_at
    BEFORE UPDATE ON daily_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! Your database is ready for ShadowMe
-- =====================================================
