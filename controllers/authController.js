const mongoose = require("mongoose");
const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

/**
 * Register a new user.
 * Converted from nested bcrypt callbacks to async/await so that:
 *  - all errors are caught by a single try/catch
 *  - the real error message is always logged
 *  - unhandled rejections inside callbacks are eliminated
 */
function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
}

module.exports.registerUser = async function (req, res) {
  try {
    const email = userModel.normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const fullname = typeof req.body.fullname === "string" ? req.body.fullname.trim() : "";
    const gender = req.body.gender;
    const age = req.body.age;

    if (!email) {
      req.flash("error", "Email is required.");
      return res.redirect("/signup");
    }
    if (!fullname) {
      req.flash("error", "Full name is required.");
      return res.redirect("/signup");
    }
    if (!password || password.length < 6) {
      req.flash("error", "Password must be at least 6 characters.");
      return res.redirect("/signup");
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      req.flash("error", "Age must be between 13 and 120.");
      return res.redirect("/signup");
    }

    const existingUser = await userModel.findByNormalizedEmail(email);
    if (existingUser) {
      console.log("[registerUser] Duplicate signup blocked.", {
        userId: existingUser._id.toString(),
        db: mongoose.connection.name,
        hasValidHash: isBcryptHash(existingUser.password),
      });
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/signup");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      email,
      password: hash,
      fullname,
      gender: gender || "Prefer not to say",
      age: ageNum,
    });

    console.log("[registerUser] User created.", {
      userId: user._id.toString(),
      email: user.email,
      db: mongoose.connection.name,
    });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    console.log("[registerUser] Registration successful, redirecting to /shop");
    req.flash("success", "Account created successfully! Welcome!");
    return res.redirect("/shop");

  } catch (err) {
    const duplicateFields = err.keyPattern ? Object.keys(err.keyPattern) : [];
    console.error("[registerUser] Registration error:", {
      name: err.name,
      code: err.code,
      duplicateFields,
      message: err.message,
    });

    if (err.code === 11000) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/signup");
    }
    if (err.name === "ValidationError") {
      const firstMessage = Object.values(err.errors)[0]?.message || "Validation failed.";
      req.flash("error", firstMessage);
      return res.redirect("/signup");
    }

    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/signup");
  }
};

/**
 * Login an existing user.
 */
module.exports.loginUser = async function (req, res) {
  try {
    const email = userModel.normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/login");
    }

    const user = await userModel.findByNormalizedEmail(email);
    if (!user) {
      console.log("[loginUser] No account found for normalized email lookup.");
      req.flash("error", "No account found with that email.");
      return res.redirect("/login");
    }

    if (!isBcryptHash(user.password)) {
      console.error("[loginUser] Missing or invalid password hash.", {
        userId: user._id.toString(),
        email: user.email,
      });
      req.flash("error", "This account cannot be signed in because its password is invalid. Please contact support.");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[loginUser] Wrong password.", { userId: user._id.toString() });
      req.flash("error", "Incorrect password.");
      return res.redirect("/login");
    }

    const token = generateToken(user);
    console.log("[loginUser] Login successful.", {
      userId: user._id.toString(),
      email: user.email,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    req.flash("success", "Login successful!");
    return res.redirect("/shop");

  } catch (err) {
    console.error("[loginUser] Login error:", err.name, err.message);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/login");
  }
};

/**
 * Logout — clear cookies and redirect to login.
 */
module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("connect.sid");
  return res.redirect("/login");
};
