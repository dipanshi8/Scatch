const ownerModel = require("../models/owners-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

// Admin login
module.exports.loginAdmin = async function (req, res) {
  try {
    const { email, password } = req.body;
    const admin = await ownerModel.findOne({ email });

    if (!admin) {
      req.flash("error", "Email or Password is incorrect!");
      return res.redirect("/owners/login");
    }

    // For development: if password is not hashed, hash it
    if (!admin.password.startsWith('$2b$')) {
      // Password is not hashed, compare directly for development
      if (admin.password === password) {
        // Hash the password for future use
        bcrypt.hash(password, 10, async function (err, hash) {
          if (!err) {
            admin.password = hash;
            await admin.save();
          }
        });
      } else {
        req.flash("error", "Email or Password is incorrect!");
        return res.redirect("/owners/login");
      }
    } else {
      // Password is hashed, use bcrypt
      const match = await bcrypt.compare(password, admin.password);
      if (!match) {
        req.flash("error", "Email or Password is incorrect!");
        return res.redirect("/owners/login");
      }
    }

    const token = generateToken(admin);
    res.cookie("adminToken", token);
    req.flash("success", "Admin login successful!");
    return res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Admin login error:", err);
    req.flash("error", "Something went wrong!");
    return res.redirect("/owners/login");
  }
};

// Admin logout
module.exports.logoutAdmin = function (req, res) {
  // Clear admin token cookie
  res.clearCookie("adminToken");
  
  // Clear session data
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        console.error("Session destroy error:", err);
      }
    });
  }
  
  req.flash("success", "Admin logged out successfully.");
  res.redirect("/owners/login");
};

