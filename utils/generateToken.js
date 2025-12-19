const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  // Unified JWT Secret: Check JWT_KEY first, then JWT_SECRET, then SESSION_SECRET, then fallback
  const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-secret-not-secure';
  if (!process.env.JWT_KEY && !process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_KEY or JWT_SECRET not set in .env. Using fallback (not secure for production).');
  }
  console.log('🔑 [generateToken] Using JWT secret from:', process.env.JWT_KEY ? 'JWT_KEY' : process.env.JWT_SECRET ? 'JWT_SECRET' : process.env.SESSION_SECRET ? 'SESSION_SECRET' : 'FALLBACK');
  return jwt.sign({ email: user.email, id: user._id }, jwtSecret);
};

module.exports.generateToken = generateToken;
