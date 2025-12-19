const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");

module.exports = async function (req, res, next) {
  const token = req.cookies.adminToken;

  if (!token) {
    req.flash("error", "Admin access required. Please login!");
    return res.redirect("/owners/login");
  }

  try {
    const jwtSecret = process.env.JWT_KEY || process.env.SESSION_SECRET || 'fallback-jwt-key-not-secure';
    const decoded = jwt.verify(token, jwtSecret);

    const admin = await ownerModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!admin) {
      req.flash("error", "Admin not found!");
      return res.redirect("/owners/login");
    }

    req.admin = admin; // Attach admin to request
    res.locals.admin = admin; // Make admin available in views
    next();
  } catch (err) {
    console.error("Admin JWT Error:", err.message);
    req.flash("error", "Invalid admin session. Please login again!");
    return res.redirect("/owners/login");
  }
};

