/**
 * ShadowMe Backend - Express Server
 * Your AI Cognitive Twin
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import routes
const profileRoutes = require('./routes/profile');
const decisionsRoutes = require('./routes/decisions');
const planRoutes = require('./routes/plan');
const feedbackRoutes = require('./routes/feedback');
const eventsRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server
    credentials: true
}));
app.use(express.json());

// Request logging (helpful for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'shadowme-backend',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/profile', profileRoutes);
app.use('/decisions', decisionsRoutes);
app.use('/plan', planRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/events', eventsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║         ShadowMe Backend Server Started               ║
╠═══════════════════════════════════════════════════════╣
║  Port: ${PORT}                                           ║
║  Health: http://localhost:${PORT}/health                 ║
╚═══════════════════════════════════════════════════════╝
    `);
    console.log('Available endpoints:');
    console.log('  GET  /health           - Health check');
    console.log('  GET  /profile          - Get user profile');
    console.log('  POST /profile          - Create profile (onboarding)');
    console.log('  GET  /profile/csp      - Get CSP vector');
    console.log('  GET  /decisions        - List decisions');
    console.log('  POST /decisions        - Create decision');
    console.log('  PUT  /decisions/:id    - Update decision');
    console.log('  DELETE /decisions/:id  - Delete decision');
    console.log('  POST /plan/generate    - Generate daily plan');
    console.log('  GET  /plan/today       - Get today\'s plan');
    console.log('  POST /plan/accept      - Accept plan');
    console.log('  POST /feedback         - Submit feedback');
    console.log('  POST /events           - Record interaction event');
    console.log('');
    console.log('Note: All endpoints except /health require x-user-id header');
});
