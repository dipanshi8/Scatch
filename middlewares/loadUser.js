const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

/**
 * Non-blocking middleware that attempts to load the current user from the JWT cookie.
 * Sets req.user and res.locals.user if successful.
 * Never blocks a request — on any failure, req.user is set to null and execution continues.
 */
module.exports = async function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-key-not-secure';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await userModel.findByNormalizedEmail(decoded.email, {
      select: "-password",
    });

    if (user) {
      req.user = user;
      res.locals.user = user;
    } else {
      req.user = null;
    }
  } catch (err) {
    // Invalid or expired token — clear it silently
    if (process.env.NODE_ENV !== 'production') {
      console.error("[loadUser] JWT error:", err.message);
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    req.user = null;
  }

  next();
};
