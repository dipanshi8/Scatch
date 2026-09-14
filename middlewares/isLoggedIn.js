const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

/**
 * Route guard: requires a valid user session.
 * If loadUser has already populated req.user, skips the DB lookup.
 * On failure, flashes an error and redirects to /login.
 */
module.exports = async function (req, res, next) {
  // Fast path: loadUser already validated and attached the user
  if (req.user && req.user._id) {
    return next();
  }

  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }

  try {
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-key-not-secure';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await userModel.findByNormalizedEmail(decoded.email, {
      select: "-password",
    });

    if (!user) {
      req.flash("error", "User not found. Please login again.");
      res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      return res.redirect("/login");
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (err) {
    // Token invalid or expired
    if (process.env.NODE_ENV !== 'production') {
      console.error("[isLoggedIn] JWT error:", err.message);
    }
    req.flash("error", "Your session has expired. Please login again.");
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return res.redirect("/login");
  }
};
