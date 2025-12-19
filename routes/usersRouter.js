const express = require('express');
const router = express.Router();
const { logout } = require("../controllers/authController");

// User logout route (no authentication required - you don't need to be logged in to log out)
// Note: Login and Register routes are handled in routes/index.js at root level
router.get("/logout", logout);

module.exports = router;