const ownerModel = require("../models/owners-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

/**
 * Admin login.
 * Always uses bcrypt comparison — plaintext password fallback removed.
 */
module.exports.loginAdmin = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/owners/login");
    }

    const admin = await ownerModel.findOne({ email });
    if (!admin) {
      req.flash("error", "Email or Password is incorrect!");
      return res.redirect("/owners/login");
    }

    // Passwords must always be hashed — reject plaintext passwords
    if (!admin.password || !admin.password.startsWith('$2b$')) {
      console.error(`❌ [loginAdmin] Admin ${email} has unhashed password — login blocked. Re-register this admin.`);
      req.flash("error", "Admin account is misconfigured. Please contact support.");
      return res.redirect("/owners/login");
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      req.flash("error", "Email or Password is incorrect!");
      return res.redirect("/owners/login");
    }

    const token = generateToken(admin);
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });

    console.log('✅ [loginAdmin] Admin logged in:', admin.email);
    req.flash("success", "Admin login successful!");
    return res.redirect("/admin/dashboard");

  } catch (err) {
    console.error("❌ [loginAdmin] Error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/owners/login");
  }
};

/**
 * Admin logout.
 * Clears cookie and redirects. Session destroy is best-effort.
 */
module.exports.logoutAdmin = function (req, res) {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  // Destroy session without blocking the redirect
  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error on admin logout:", err);
    });
  }

  // Redirect immediately — do not use flash after session.destroy()
  return res.redirect("/owners/login");
};
