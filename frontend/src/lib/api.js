/**
 * API Client for Backend Communication
 * Handles all HTTP requests to the Express backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Debug: Log API URL on load
console.log('[API] Backend URL:', API_URL);

/**
 * Make an API request with user authentication
 * @param {string} endpoint - API endpoint (e.g., '/decisions')
 * @param {object} options - Fetch options
 * @param {string} userId - User ID for x-user-id header
 */
export async function apiRequest(endpoint, options = {}, userId) {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    // Add user ID header for authentication (hackathon simplification)
    if (userId) {
        headers['x-user-id'] = userId;
    }
    
    const response = await fetch(url, {
        ...options,
        headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }
    
    return data;
}

// Profile API
export const profileApi = {
    get: (userId) => apiRequest('/profile', { method: 'GET' }, userId),
    create: (userId, data) => apiRequest('/profile', {
        method: 'POST',
        body: JSON.stringify(data),
    }, userId),
    update: (userId, data) => apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    }, userId),
    getCsp: (userId) => apiRequest('/profile/csp', { method: 'GET' }, userId),
};

// Decisions API
export const decisionsApi = {
    list: (userId, filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/decisions?${params}` : '/decisions';
        return apiRequest(endpoint, { method: 'GET' }, userId);
    },
    get: (userId, id) => apiRequest(`/decisions/${id}`, { method: 'GET' }, userId),
    create: (userId, data) => apiRequest('/decisions', {
        method: 'POST',
        body: JSON.stringify(data),
    }, userId),
    update: (userId, id, data) => apiRequest(`/decisions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }, userId),
    delete: (userId, id) => apiRequest(`/decisions/${id}`, { method: 'DELETE' }, userId),
};

// Plan API
export const planApi = {
    generate: (userId) => apiRequest('/plan/generate', { method: 'POST' }, userId),
    getToday: (userId) => apiRequest('/plan/today', { method: 'GET' }, userId),
    accept: (userId, planId) => apiRequest('/plan/accept', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId }),
    }, userId),
    getHistory: (userId, limit = 7) => apiRequest(`/plan/history?limit=${limit}`, { method: 'GET' }, userId),
};

// Feedback API
export const feedbackApi = {
    submit: (userId, data) => apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
    }, userId),
    list: (userId, planId = null) => {
        const endpoint = planId ? `/feedback?plan_id=${planId}` : '/feedback';
        return apiRequest(endpoint, { method: 'GET' }, userId);
    },
    getStats: (userId) => apiRequest('/feedback/stats', { method: 'GET' }, userId),
};

// Events API (for interaction tracking)
export const eventsApi = {
    record: (userId, event) => apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(event),
    }, userId),
    recordBatch: (userId, events) => apiRequest('/events/batch', {
        method: 'POST',
        body: JSON.stringify({ events }),
    }, userId),
};
