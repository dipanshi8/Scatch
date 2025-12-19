const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

/**
 * Middleware to load user from JWT token on every request (non-blocking)
 * This allows views to access user data without requiring authentication
 */
module.exports = async function (req, res, next) {
  // This middleware must run AFTER cookieParser
  const token = req.cookies.token;

  if (!token) {
    // No token, continue without user
    req.user = null;
    return next();
  }

  try {
    // Unified JWT Secret: Must match generateToken.js and isLoggedIn.js
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-key-not-secure';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await userModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (user) {
      req.user = user; // Attach user to request
      res.locals.user = user; // Make user available in views
    } else {
      req.user = null;
    }
  } catch (err) {
    // Invalid token, clear it and continue without user
    console.error("⚠️ [loadUser] JWT verification error:", err.message);
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    req.user = null;
  }

  next();
};

