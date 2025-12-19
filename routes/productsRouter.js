const express = require('express');
const router = express.Router();
// Products routes are now handled in ownersRouter for admin
// This router can be used for public product APIs if needed

router.get("/", function (req, res) {
  res.json({ message: "Products API" });
});

module.exports = router;
