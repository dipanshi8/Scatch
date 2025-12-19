const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated"); // Alias for isLoggedIn
const isAdmin = require("../middlewares/isAdmin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");
const cartControllerDB = require("../controllers/cartControllerDB");

// Home page - Redirect to shop or login
router.get("/", function (req, res) {
  // If user is already logged in, redirect to shop
  if (req.user) {
    return res.redirect("/shop");
  }
  // If not logged in, redirect to login page
  res.redirect("/login");
});

// Login and Register routes (direct access)
router.get("/login", function(req, res) {
  // If already logged in, redirect to shop
  if (req.user) {
    return res.redirect("/shop");
  }
  res.render("login", { pageTitle: 'Login' });
});

router.get("/register", function(req, res) {
  // If already logged in, redirect to shop
  if (req.user) {
    return res.redirect("/shop");
  }
  res.render("register", { pageTitle: 'Sign Up' });
});

// Signup route - renders register.ejs (signup page)
router.get("/signup", function(req, res) {
  // If already logged in, redirect to shop
  if (req.user) {
    return res.redirect("/shop");
  }
  res.render("register", { pageTitle: 'Sign Up' });
});

// POST routes for authentication
const { registerUser, loginUser } = require("../controllers/authController");
router.post("/login", loginUser);
router.post("/register", registerUser);
// Also accept POST /signup for compatibility
router.post("/signup", registerUser);

// Shop page - Product listing with category filtering
router.get("/shop", async function (req, res) {
  try {
    let query = {};
    const category = req.query.category;
    const search = req.query.search;
    
    // Category filter (Backpacks, Handbags, Clutches)
    if (category && ['Backpacks', 'Handbags', 'Clutches'].includes(category)) {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Only show in-stock products
    query.stockQuantity = { $gt: 0 };
    
    const products = await productModel.find(query).sort({ createdAt: -1 });
    
    // If no products found, try to seed (in case seeding failed on startup)
    if (products.length === 0) {
      const { seedWithLocalImages } = require('../utils/seedWithLocalImages');
      await seedWithLocalImages();
      // Fetch again after seeding (remove stock filter to show newly seeded products)
      const updatedProducts = await productModel.find({ category: query.category || undefined }).sort({ createdAt: -1 });
      // Get category counts
      const categoryCounts = await productModel.aggregate([
        { $match: { stockQuantity: { $gt: 0 } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      return res.render("shop-premium", { 
        products: updatedProducts, 
        category: category || 'all',
        search: search || '',
        categoryCounts,
        pageTitle: 'Shop'
      });
    }
    
    // Get category counts for filter display
    const categoryCounts = await productModel.aggregate([
      { $match: { stockQuantity: { $gt: 0 } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.render("shop-premium", { 
      products, 
      category: category || 'all',
      search: search || '',
      categoryCounts,
      pageTitle: 'Shop'
    });
  } catch (err) {
    console.error("Shop loading error:", err.message);
    req.flash("error", "Something went wrong while loading the shop.");
    res.redirect("/");
  }
});

// New Arrivals page - Latest 10 products
router.get("/new-arrivals", async function (req, res) {
  try {
    const products = await productModel.find({ stockQuantity: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.render("new-arrivals", { 
      products,
      pageTitle: 'New Arrivals'
    });
  } catch (err) {
    console.error("New Arrivals loading error:", err.message);
    req.flash("error", "Something went wrong while loading new arrivals.");
    res.redirect("/shop");
  }
});

// Product detail page
router.get("/product/:id", async function (req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/shop");
    }
    res.render("product-detail", { product, pageTitle: product.name });
  } catch (err) {
    console.error("Product detail error:", err.message);
    req.flash("error", "Product not found!");
    res.redirect("/shop");
  }
});

// Quick View endpoint (for modal)
router.get("/product/:id/quick-view", async function (req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send('<div class="alert alert-error">Product not found</div>');
    }
    res.render("partials/quick-view", { product });
  } catch (err) {
    console.error("Quick view error:", err.message);
    res.status(500).send('<div class="alert alert-error">Failed to load product</div>');
  }
});

// Cart routes - Using database-persisted cart (protected with isLoggedIn)
router.get("/cart", isLoggedIn, cartControllerDB.getCart);
router.post("/cart/add/:id", isLoggedIn, cartControllerDB.addToCart);
router.post("/addtocart/:productid", isLoggedIn, cartControllerDB.addToCart); // Keep for backward compatibility
router.post("/cart/update", isLoggedIn, cartControllerDB.updateCartQuantity);
router.post("/cart/remove/:id", isLoggedIn, cartControllerDB.removeFromCart);

// Admin dashboard route (alias for navbar)
router.get("/admin/dashboard", isAdmin, function(req, res) {
  res.redirect("/owners/admin/dashboard");
});

// Checkout page - Multi-step
router.get("/checkout", isLoggedIn, async function (req, res) {
  try {
    // Get cart from database
    const user = await userModel.findById(req.user._id).populate('cart.product').select("-password");
    
    if (!user.cart || user.cart.length === 0) {
      req.flash("error", "Your cart is empty!");
      return res.redirect("/cart");
    }

    // Calculate totals
    let totalAmount = 0;
    const platformFee = 20;

    user.cart.forEach(item => {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      totalAmount += price * item.quantity;
    });

    const finalTotal = totalAmount + platformFee;

    res.render("checkout-multistep", { 
      user, 
      totalAmount, 
      platformFee, 
      finalTotal,
      pageTitle: 'Checkout'
    });
  } catch (err) {
    console.error("Checkout error:", err.message);
    req.flash("error", "Something went wrong!");
    res.redirect("/cart");
  }
});

// Place order
router.post("/order", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findById(req.user._id).populate('cart.product');
    
    if (!user.cart || user.cart.length === 0) {
      req.flash("error", "Your cart is empty!");
      return res.redirect("/cart");
    }

    const { fullName, address, city, state, zipCode, phone, paymentMethod } = req.body;

    // Validate required fields
    if (!fullName || !address || !city || !state || !zipCode || !phone) {
      req.flash("error", "Please fill all shipping details!");
      return res.redirect("/checkout");
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderProducts = [];

    user.cart.forEach(item => {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      
      orderProducts.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        discountPrice: item.product.discountPrice || 0,
        subtotal: itemTotal
      });
    });

    const platformFee = 20;
    const finalTotal = totalAmount + platformFee;

    // Create order
    const order = await orderModel.create({
      userId: req.user._id,
      user: req.user._id, // Legacy support
      products: orderProducts,
      items: orderProducts.map(p => ({ // Legacy support
        product: p.product,
        quantity: p.quantity,
        price: p.price,
        discount: p.discountPrice
      })),
      totalAmount: finalTotal,
      shippingAddress: {
        fullName,
        street: address,
        address: address, // Legacy support
        city,
        state,
        zipCode,
        phone,
        country: 'India'
      },
      platformFee: platformFee,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending'
    });

    // Clear user's cart
    user.cart = [];
    await user.save();

    // Add order to user's order history
    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id }
    });

    req.flash("success", "Order placed successfully!");
    res.redirect(`/order/${order._id}`);
  } catch (err) {
    console.error("Order placement error:", err.message);
    req.flash("error", "Failed to place order. Please try again.");
    res.redirect("/checkout");
  }
});

// Order detail page
router.get("/order/:id", isLoggedIn, async function (req, res) {
  try {
    const order = await orderModel.findById(req.params.id)
      .populate('userId', 'fullname email')
      .populate('products.product');

    // Check if order belongs to user (support both userId and user fields for backward compatibility)
    const orderUserId = order.userId?._id || order.userId || order.user?._id || order.user;
    if (!order || !orderUserId || orderUserId.toString() !== req.user._id.toString()) {
      req.flash("error", "Order not found!");
      return res.redirect("/orders");
    }

    res.render("order-detail", { order });
  } catch (err) {
    console.error("Order detail error:", err.message);
    req.flash("error", "Order not found!");
    res.redirect("/orders");
  }
});

// Order history
router.get("/orders", isLoggedIn, async function (req, res) {
  try {
    const orders = await orderModel.find({ userId: req.user._id })
      .sort({ orderDate: -1 })
      .populate('products.product');

    res.render("orders-premium", { orders, pageTitle: 'My Orders' });
  } catch (err) {
    console.error("Orders loading error:", err.message);
    req.flash("error", "Something went wrong!");
    res.redirect("/shop");
  }
});

module.exports = router;
