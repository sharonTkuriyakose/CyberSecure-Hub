const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  /**
   * 1. CORS PRE-FLIGHT BYPASS:
   * Browsers send an OPTIONS request before the actual GET/POST.
   * Skipping auth for OPTIONS prevents accidental 401 redirects.
   */
  if (req.method === 'OPTIONS') {
    return next();
  }

  // 2. Check both headers for maximum compatibility
  let token = req.header('x-auth-token') || req.header('Authorization');

  // SERVER-SIDE LOG: Shows you exactly which endpoint is failing
  console.log(`[AUTH] Incoming Request: ${req.method} ${req.url}`);

  // 3. If no token is found, deny access
  if (!token) {
    console.warn("[AUTH] Rejected: No token provided in headers.");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 4. Handle standard "Bearer <token>" format
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    /**
     * 5. TOKEN VERIFICATION:
     * Uses the secret from .env. Ensure the server was restarted after 
     * modifying JWT_SECRET in your .env file.
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    /**
     * 6. PAYLOAD INTEGRITY CHECK: 
     * Matches the nested structure: { user: { id: ... } }
     */
    if (!decoded || !decoded.user || !decoded.user.id) {
       console.error("[AUTH] FAIL: Token format valid, but 'user.id' is missing.");
       return res.status(401).json({ msg: 'Token format invalid: missing user payload' });
    }

    /**
     * 7. ATTACH USER IDENTITY:
     * This allows subsequent routes to use req.user.id
     */
    req.user = decoded.user;
    
    console.log(`[AUTH] Success: Operative ${req.user.id} authorized.`);
    next();
  } catch (err) {
    /**
     * 8. ERROR DIAGNOSTICS:
     * - 'invalid signature': JWT_SECRET mismatch.
     * - 'jwt expired': The 24h window has passed.
     */
    console.error(`[AUTH] VERIFICATION ERROR: ${err.message}`);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};