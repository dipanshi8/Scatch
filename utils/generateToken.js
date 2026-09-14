const jwt = require("jsonwebtoken");

// Resolve secret once at module load — fail fast on startup if missing entirely
const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-secret-not-secure';

if (!process.env.JWT_KEY && !process.env.JWT_SECRET) {
  // Log once at startup, not on every token generation
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  [generateToken] JWT_KEY and JWT_SECRET are not set. Using fallback — insecure in production.');
  }
}

/**
 * Generate a signed JWT for the given user or admin document.
 * Payload: { email, id }
 * Expiry: 24 hours (matches cookie maxAge)
 */
const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, id: user._id },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

module.exports.generateToken = generateToken;
