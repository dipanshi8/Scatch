const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

/**
 * Bulletproof isLoggedIn Middleware
 * Validates JWT token from cookie and sets user in req and res.locals
 */
module.exports = async function (req, res, next) {
  console.log('🔒 [isLoggedIn] Middleware triggered for:', req.path);
  
  // Check if user is already loaded by loadUser middleware
  if (req.user && req.user._id) {
    console.log('✅ [isLoggedIn] User already loaded from loadUser middleware');
    return next();
  }

  // Read token from cookie (cookie name must be "token")
  const token = req.cookies.token;
  console.log('🍪 [isLoggedIn] Cookie token exists:', !!token);
  console.log('🍪 [isLoggedIn] All cookies:', Object.keys(req.cookies));

  if (!token) {
    console.log('❌ [isLoggedIn] No Token Found - redirecting to /login');
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }

  try {
    // Unified JWT Secret: Must match generateToken.js
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-key-not-secure';
    console.log('🔑 [isLoggedIn] Using JWT secret from:', process.env.JWT_KEY ? 'JWT_KEY' : process.env.JWT_SECRET ? 'JWT_SECRET' : process.env.SESSION_SECRET ? 'SESSION_SECRET' : 'FALLBACK');
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ [isLoggedIn] Token verified successfully for email:', decoded.email);

    // Find user in database
    const user = await userModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!user) {
      console.log('❌ [isLoggedIn] User not found in database for email:', decoded.email);
      req.flash("error", "User not found!");
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });
      return res.redirect("/login");
    }

    // IMPORTANT: Set user in both req and res.locals
    req.user = user; // Attach user to request
    res.locals.user = user; // Make user available in views (Navbar needs this!)
    console.log('✅ [isLoggedIn] User authenticated:', user.email, 'ID:', user._id);
    next();
  } catch (err) {
    console.error("❌ [isLoggedIn] JWT Error:", err.message);
    console.error("❌ [isLoggedIn] Error details:", err);
    req.flash("error", "Invalid session. Please login again!");
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    return res.redirect("/login");
  }
};


