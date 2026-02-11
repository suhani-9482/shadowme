/**
 * Authentication Middleware
 * 
 * HACKATHON SIMPLIFICATION:
 * For now, we pass user_id via x-user-id header.
 * 
 * TODO for production:
 * - Verify JWT token from Authorization header
 * - Extract user_id from verified token
 * - Example:
 *   const token = req.headers.authorization?.replace('Bearer ', '');
 *   const { data: { user }, error } = await supabase.auth.getUser(token);
 *   if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
 *   req.userId = user.id;
 */

const authMiddleware = (req, res, next) => {
    // Hackathon: Get user ID from header
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return res.status(401).json({ 
            error: 'Missing x-user-id header',
            hint: 'For hackathon, pass user_id in x-user-id header. In production, use JWT verification.'
        });
    }
    
    // Attach userId to request for use in route handlers
    req.userId = userId;
    
    next();
};

module.exports = authMiddleware;
