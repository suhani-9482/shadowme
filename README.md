# ShadowMe — Your AI Cognitive Twin

> Reduce decision fatigue by offloading routine micro-decisions, NOT by adding more choices.

ShadowMe is a web application that learns your behavioral patterns and makes routine decisions for you, reducing cognitive load throughout your day.

## Key Concepts

- **Cognitive Shadow Profile (CSP)**: A behavioral vector model that stores weighted preferences learned from your actions
- **Compressed Decision Cards**: Bundled micro-decisions (task + break + meal) to reduce decision points
- **Cognitive Load Meter**: Measures your current cognitive load (0-100) and adjusts autonomy level
- **Autonomy Levels**: "manual" (you decide), "assist" (suggestions), "auto" (ShadowMe decides)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) + React Router |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL + Auth) |
| Authentication | Supabase Auth (email/password) |

---

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **A Supabase account** (free tier works)
   - Sign up: https://supabase.com/

---

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Enter a name (e.g., "shadowme")
4. Set a database password (save this!)
5. Choose a region close to you
6. Click **"Create new project"**
7. Wait for the project to be ready (~2 minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** (gear icon) → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (under "Project API keys")
   - **service_role key**: `eyJhbGci...` (click "Reveal" to see it)

> ⚠️ **Important**: The `service_role` key has admin access. Never expose it in frontend code!

### Step 3: Run the Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase.sql` from this project
4. Copy ALL the contents and paste into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" — this is correct!

### Step 4: Configure Environment Variables

#### Backend (.env)

1. Navigate to the `backend` folder
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and fill in your values:
   ```
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

#### Frontend (.env)

1. Navigate to the `frontend` folder
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   VITE_API_URL=http://localhost:5000
   ```

### Step 5: Install Dependencies

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### Step 6: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```
You should see:
```
╔═══════════════════════════════════════════════════════╗
║         ShadowMe Backend Server Started               ║
╠═══════════════════════════════════════════════════════╣
║  Port: 5000                                           ║
║  Health: http://localhost:5000/health                 ║
╚═══════════════════════════════════════════════════════╝
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 7: Open the App

Go to http://localhost:5173 in your browser!

---

## How to Use the App

### 1. Create an Account

1. On the login page, click **"Sign Up"**
2. Enter your email and password (min 6 characters)
3. Click **"Sign Up"**
4. Check your email for a confirmation link (click it!)
5. Return to the app and log in

> **Note**: For hackathon/local testing, you can disable email confirmation in Supabase:
> Settings → Authentication → Email → Turn OFF "Enable email confirmations"

### 2. Complete Onboarding

After logging in for the first time, you'll go through onboarding:

1. **Schedule**: Set your wake time, sleep time, and peak focus hours
2. **Work Style**: Choose flexible, structured, or deep work mode
3. **Diet**: Select your diet preference for meal suggestions
4. Click **"Create My Shadow"**

This creates your initial Cognitive Shadow Profile (CSP)!

### 3. Add Your Decisions

On the dashboard, add recurring decisions that ShadowMe will help manage:

**Tasks** (things you need to do):
- "Review emails" - Effort: 2, Time: 15min
- "Deep coding work" - Effort: 5, Time: 90min
- "Team standup" - Effort: 1, Time: 15min

**Meals** (eating habits):
- "Healthy lunch" - Type: lunch
- "Quick breakfast" - Type: breakfast

**Breaks** (rest periods):
- "Stretch break" - Duration: 5min
- "Coffee break" - Duration: 10min

### 4. Generate Daily Plan (Coming Soon - Person 2)

Your teammate will implement:
- Click **"Generate Plan"** to create today's compressed decision cards
- View your Cognitive Load Meter
- Accept, override, or ignore suggestions
- Watch your CSP learn from your choices!

---

## Project Structure

```
shadowme1/
├── frontend/                   # React (Vite) frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── DecisionForm.jsx
│   │   │   ├── DecisionList.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── lib/
│   │   │   ├── supabase.js     # Supabase client
│   │   │   └── api.js          # Backend API client
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Login/Signup page
│   │   │   ├── Onboarding.jsx  # Profile setup
│   │   │   └── Dashboard.jsx   # Main app interface
│   │   ├── App.jsx             # Router setup
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── .env.example
│   └── package.json
│
├── backend/                    # Express backend
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.js     # Supabase admin client
│   │   ├── middleware/
│   │   │   └── auth.js         # Auth middleware (x-user-id)
│   │   ├── routes/
│   │   │   ├── profile.js      # Profile CRUD + CSP
│   │   │   ├── decisions.js    # Decisions CRUD
│   │   │   ├── plan.js         # Daily plan generation
│   │   │   ├── feedback.js     # Accept/override/ignore
│   │   │   └── events.js       # Interaction tracking
│   │   └── index.js            # Express server
│   ├── .env.example
│   └── package.json
│
├── supabase.sql                # Database schema + RLS policies
└── README.md                   # This file
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/profile` | Get user profile + CSP |
| POST | `/profile` | Create profile (onboarding) |
| GET | `/profile/csp` | Get CSP vector only |
| GET | `/decisions` | List user's decisions |
| POST | `/decisions` | Create a decision |
| PUT | `/decisions/:id` | Update a decision |
| DELETE | `/decisions/:id` | Delete a decision |
| POST | `/plan/generate` | Generate daily plan |
| GET | `/plan/today` | Get today's plan |
| POST | `/plan/accept` | Accept the plan |
| POST | `/feedback` | Submit feedback (accept/override/ignore) |
| POST | `/events` | Record interaction event |

> **Note**: All endpoints except `/health` require the `x-user-id` header.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User preferences + CSP vector (jsonb) |
| `decisions` | Recurring decisions (tasks, meals, breaks) |
| `daily_plans` | Generated plans with compressed cards |
| `feedback` | User feedback (accept/override/ignore) |
| `interaction_events` | Passive behavior tracking |

All tables have Row Level Security (RLS) enabled — users can only access their own data.

---

## CSP (Cognitive Shadow Profile) Explained

The CSP is stored as a JSONB object in the `profiles` table:

```json
{
  "morning_task_weight": 0.5,
  "afternoon_task_weight": 0.5,
  "evening_task_weight": 0.3,
  "high_effort_preference": 0.5,
  "low_effort_preference": 0.5,
  "break_frequency_weight": 0.5,
  "focus_duration_preference": 50,
  "accept_rate": 0.5,
  "override_rate": 0.0,
  "total_decisions": 0,
  "total_accepts": 0,
  "total_overrides": 0,
  "total_ignores": 0
}
```

**How weights are updated:**
- **Accept**: Increases weight for that time/context/item
- **Override**: Decreases weight, logs what user chose instead
- **Ignore**: Slight decrease or unchanged

---

## Sample Data for Demo

After onboarding, create these decisions to see the system in action:

### Tasks
1. **"Morning email review"**
   - Type: Task
   - Effort: 2
   - Time: 20min
   - Frequency: Daily
   - Preferred time: 09:00
   - Tags: work, email

2. **"Deep coding session"**
   - Type: Task
   - Effort: 5
   - Time: 90min
   - Frequency: Daily
   - Preferred time: 10:00
   - Tags: work, coding, focus

3. **"Team standup"**
   - Type: Task
   - Effort: 1
   - Time: 15min
   - Frequency: Weekdays
   - Preferred time: 09:30
   - Tags: work, meeting

### Meals
4. **"Healthy lunch"**
   - Type: Meal
   - Meal type: Lunch
   - Frequency: Daily

5. **"Light breakfast"**
   - Type: Meal
   - Meal type: Breakfast
   - Frequency: Daily

### Breaks
6. **"Stretch break"**
   - Type: Break
   - Duration: 5min
   - Frequency: Daily

7. **"Coffee break"**
   - Type: Break
   - Duration: 10min
   - Frequency: Daily

---

## What Person 2 (Teammate) Needs to Implement

1. **Interaction Tracking Hook** (`frontend/src/hooks/useEventTracker.js`)
   - Track page load/unload
   - Track visibility changes (focus/blur)
   - Track idle time
   - Send events to `POST /events`

2. **Decision Engine** (`backend/src/services/decisionEngine.js`)
   - Full plan generation logic using CSP weights
   - Compressed decision card creation
   - "Why" explanations based on user patterns

3. **Cognitive Load Meter** (`backend/src/services/cognitiveLoad.js`)
   - Calculate load from: decisions today, overrides, time on site, time-of-day
   - Return 0-100 value
   - Determine autonomy level (manual/assist/auto)

4. **CSP Weight Updates** (`backend/src/services/cspUpdater.js`)
   - Full weight update logic based on feedback
   - Time-based and context-based weight adjustments

5. **Dashboard Enhancements** (`frontend/src/pages/Dashboard.jsx`)
   - Display compressed decision cards
   - Working Cognitive Load Meter UI
   - Accept/Override/Ignore buttons
   - CSP stats display

---

## Troubleshooting

### "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
- Make sure you created the `.env` file (not just `.env.example`)
- Check that the values don't have quotes around them

### "Failed to fetch profile" or CORS errors
- Make sure the backend is running on port 5000
- Check that `VITE_API_URL=http://localhost:5000` in frontend `.env`

### Email confirmation not working
- For local testing, disable email confirmation in Supabase:
  - Settings → Authentication → Email → Toggle OFF "Enable email confirmations"

### RLS errors (permission denied)
- Make sure you ran the entire `supabase.sql` file
- Check that RLS policies were created successfully

### "Profile already exists" error
- This is expected if you try to create a profile twice
- The app should redirect you to the dashboard

---

## Next Steps

After Person 2 completes their part:

1. Generate a daily plan
2. Accept or override some suggestions
3. Check the CSP stats to see learning in action
4. Regenerate the plan and see how recommendations change!

---

## License

MIT — Built for hackathon purposes.
