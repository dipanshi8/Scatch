const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");


module.exports = async function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "You need to login first!");
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY); // ✅ Make sure JWT_KEY exists in .env

    const user = await userModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/");
    }

    req.user = user; // ✅ Attach user to request
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    req.flash("error", "Something went wrong!");
    return res.redirect("/");
  }
};


