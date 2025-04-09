const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const mongoose = require("mongoose");

router.get("/", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("index", { error, success, loggedin: false });
});

router.get("/shop", async function (req, res) {
  try {
    const products = await productModel.find();
    let success = req.flash("success");
    res.render("shop", { products, success });
  } catch (err) {
    req.flash("error", "Something went wrong while loading the shop.");
    res.redirect("/");
  }
});

router.get("/cart", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");

    let bill = 0;
    user.cart.forEach((item) => {
      bill += item.price - item.discount + 20; // Add platform fee
    });

    res.render("cart", { user, bill });
  } catch (err) {
    console.error("Cart loading error:", err.message);
    req.flash("error", "Something went wrong while loading the cart.");
    res.redirect("/");
  }
});

router.get("/addtocart/:productid", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    const productId = new mongoose.Types.ObjectId(req.params.productid);
    user.cart.push(productId);
    await user.save();

    req.flash("success", "Added to cart");
    res.redirect("/shop");
  } catch (err) {
    console.error("Add to cart error:", err.message);
    req.flash("error", "Failed to add product to cart.");
    res.redirect("/shop");
  }
});

router.get("/logout", isLoggedIn, function (req, res) {
  res.clearCookie("token"); // ✅ Clears JWT cookie
  req.flash("success", "Logged out successfully.");
  res.redirect("/");
});

module.exports = router;
