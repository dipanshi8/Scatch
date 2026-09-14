const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

/**
 * Register a new user.
 * Converted from nested bcrypt callbacks to async/await so that:
 *  - all errors are caught by a single try/catch
 *  - the real error message is always logged
 *  - unhandled rejections inside callbacks are eliminated
 */
module.exports.registerUser = async function (req, res) {
  try {
    const { email, password, fullname, gender, age } = req.body;

    // Check for duplicate email
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "You already have an account, please login!");
      return res.redirect("/login");
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      req.flash("error", "Age must be between 13 and 120.");
      return res.redirect("/register");
    }

    // Validate required fields explicitly so we get a clear error if something is missing
    if (!fullname || !fullname.trim()) {
      req.flash("error", "Full name is required.");
      return res.redirect("/register");
    }
    if (!password || password.length < 6) {
      req.flash("error", "Password must be at least 6 characters.");
      return res.redirect("/register");
    }

    // Hash password using async/await — errors surface to the outer try/catch
    const hash = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await userModel.create({
      email,
      password: hash,
      fullname: fullname.trim(),
      gender: gender || 'Prefer not to say',
      age: ageNum
    });

    console.log('✅ [registerUser] User created:', user.email);

    // Generate JWT and set cookie
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });

    console.log('✅ [registerUser] Registration successful, redirecting to /shop');
    req.flash("success", "Account created successfully! Welcome!");
    return res.redirect("/shop");

  } catch (err) {
    // Log the full error (not just message) so the real cause is visible in logs
    console.error("❌ [registerUser] Registration error:", err);

    // Give a specific message for the most common failure modes
    if (err.code === 11000) {
      // MongoDB duplicate key (race condition — email was unique-checked above but another request snuck in)
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/login");
    }
    if (err.name === 'ValidationError') {
      // Mongoose schema validation failed — surface the first message
      const firstMessage = Object.values(err.errors)[0]?.message || "Validation failed.";
      req.flash("error", firstMessage);
      return res.redirect("/register");
    }

    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/register");
  }
};

/**
 * Login an existing user.
 */
module.exports.loginUser = async function (req, res) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/login");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      req.flash("error", "Email or Password is incorrect!");
      return res.redirect("/login");
    }

    // bcrypt.compare() throws "data and hash arguments required" if either
    // argument is null/undefined. Guard before comparing.
    const storedHash = user.password;
    const isBcryptHash =
      typeof storedHash === "string" && /^\$2[aby]\$\d{2}\$.{53}$/.test(storedHash);

    if (!isBcryptHash) {
      console.error("❌ [loginUser] Missing or invalid password hash for:", user.email);
      req.flash("error", "This account cannot be signed in. Please sign up again or contact support.");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      req.flash("error", "Email or Password is incorrect!");
      return res.redirect("/login");
    }

    const token = generateToken(user);
    console.log('✅ [loginUser] Login successful for:', user.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });

    req.flash("success", "Login successful!");
    return res.redirect("/shop");

  } catch (err) {
    console.error("❌ [loginUser] Login error:", err);
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
