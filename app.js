// Load environment variables FIRST - before any other requires
require("dotenv").config();

const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
// CRITICAL: Session must be required before flash
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require('mongoose');

// Import routers
const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");
const indexRouter = require('./routes/index');

// ============================================
// MIDDLEWARE SETUP - CRITICAL ORDER (DO NOT CHANGE)
// ============================================
// These MUST be in this EXACT order after express() initialization

// 1. Cookie Parser
app.use(cookieParser());

// 2. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session Configuration (MUST be before flash)
const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key';
app.use(session({ 
  secret: sessionSecret, 
  resave: false, 
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  } 
}));

// 4. Flash messages (MUST come AFTER session)
app.use(flash());

// 5. Static files (after session/flash setup)
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));

// 6. View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 7. Load user from JWT token on every request (non-blocking)
const loadUser = require("./middlewares/loadUser");
app.use(loadUser);

// 8. Make user/admin and session data available to all views
app.use(async (req, res, next) => {
  // Pass user to EJS (set by loadUser middleware)
  res.locals.user = req.user || null;
  res.locals.admin = req.admin || null;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.session = req.session || {};
  
  // Calculate cart count for navbar (from database if user is logged in)
  if (req.user && req.user._id) {
    try {
      const userModel = require('./models/user-model');
      const user = await userModel.findById(req.user._id);
      if (user && user.cart && Array.isArray(user.cart)) {
        res.locals.cartCount = user.cart.reduce((total, item) => {
          return total + (item.quantity || 1);
        }, 0);
        res.locals.cartLength = user.cart.length;
      } else {
        res.locals.cartCount = 0;
        res.locals.cartLength = 0;
      }
    } catch (err) {
      res.locals.cartCount = 0;
      res.locals.cartLength = 0;
    }
  } else if (req.session && req.session.cart && Array.isArray(req.session.cart)) {
    // Fallback to session cart for guests
    res.locals.cartCount = req.session.cart.reduce((total, item) => {
      return total + (item.quantity || 1);
    }, 0);
    res.locals.cartLength = req.session.cart.length;
  } else {
    res.locals.cartCount = 0;
    res.locals.cartLength = 0;
  }
  
  // Make isUserLoggedIn available for navbar
  res.locals.isUserLoggedIn = !!req.user;
  
  next();
});

// MongoDB Atlas connection with graceful error handling
// Uses MONGO_URI environment variable (MongoDB Atlas connection string)
const mongoURI = process.env.MONGO_URI;
const dbName = 'Scatchh'; // Database name to use
const { seedWithLocalImages } = require('./utils/seedWithLocalImages');

if (!mongoURI) {
  console.error('❌ MONGO_URI not found in environment variables!');
  console.log('⚠️  App will start in degraded mode without database connection.');
  console.log('💡 Please set MONGO_URI in your .env file.');
} else {
  // MongoDB Atlas connection string format: mongodb+srv://user:pass@cluster.mongodb.net/?options
  // Extract the base URI and append database name before query parameters
  let connectionString = mongoURI;
  
  // Check if database name is already in the URI (between / and ?)
  const uriMatch = mongoURI.match(/^([^?]+)(\?.*)?$/);
  if (uriMatch) {
    const baseUri = uriMatch[1]; // Everything before ?
    const queryParams = uriMatch[2] || ''; // Everything after ? (including the ?)
    
    // Check if baseUri already ends with a database name (has a path after the host)
    if (!baseUri.match(/\/[^\/]+$/)) {
      // No database name in path, append it
      connectionString = `${baseUri}/${dbName}${queryParams}`;
    } else {
      // Database name already present, use as-is
      connectionString = mongoURI;
    }
  }

  // Connect to MongoDB Atlas (non-blocking, won't crash app on failure)
  mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
    .then(async () => {
      console.log('✅ MongoDB Atlas Connected Successfully!');
      console.log(`📦 Database: ${dbName}`);
      console.log('🌐 Using MongoDB Atlas (cloud)');
      
      // Seed products with local images if database is empty
      await seedWithLocalImages();
    })
    .catch(err => {
      console.error('❌ MongoDB Atlas Connection Error:', err.message);
      console.log('⚠️  App will continue to run in degraded mode without database.');
      console.log('💡 Database features will not work until connection is established.');
      console.log('💡 Check your MONGO_URI in .env file and network connectivity.');
    });
}

// ============================================
// MOUNT ROUTES LAST (after all middleware)
// ============================================
app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  // Redirect to login instead of showing error page
  req.flash('error', err.message || 'Something went wrong. Please try again.');
  res.redirect('/login');
});

// 404 handler (must be last) - redirect to login instead of showing error
app.use((req, res) => {
  // Redirect to login page instead of showing 404 error
  res.redirect('/login');
});

// Start server (non-blocking, starts even if DB connection fails)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Using MongoDB Atlas (cloud database)`);
  if (!mongoURI) {
    console.log(`⚠️  WARNING: Running without database connection. Set MONGO_URI in .env`);
  }
});
