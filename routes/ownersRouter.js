const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owners-model");
const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");
const isAdmin = require("../middlewares/isAdmin");
const adminController = require("../controllers/adminController");
const upload = require("../config/multer-config");
const bcrypt = require("bcrypt");

// Admin login page
router.get("/login", function (req, res) {
  res.render("admin-login");
});

// Admin login POST
router.post("/login", adminController.loginAdmin);

// Admin logout
router.get("/logout", adminController.logoutAdmin);

// Admin register (development only)
if (process.env.NODE_ENV === "development") {
  router.get("/register", function (req, res) {
    res.render("admin-register");
  });

  router.post("/register", async function (req, res) {
    try {
      const { fullname, email, password } = req.body;

      const existingAdmin = await ownerModel.findOne({ email });
      if (existingAdmin) {
        req.flash("error", "Admin with this email already exists!");
        return res.redirect("/owners/register");
      }

      bcrypt.hash(password, 10, async function (err, hash) {
        if (err) {
          req.flash("error", "Error creating admin account!");
          return res.redirect("/owners/register");
        }

        await ownerModel.create({
          fullname,
          email,
          password: hash,
        });

        req.flash("success", "Admin account created successfully!");
        res.redirect("/owners/login");
      });
    } catch (err) {
      console.error("Admin registration error:", err);
      req.flash("error", "Error creating admin account!");
      res.redirect("/owners/register");
    }
  });
}

// Admin dashboard function (shared)
async function renderAdminDashboard(req, res) {
  try {
    const productCount = await productModel.countDocuments();
    const orderCount = await orderModel.countDocuments();
    const pendingOrders = await orderModel.countDocuments({ status: 'Pending' });
    
    // Calculate total sales
    const salesData = await orderModel.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;
    
    // Get recent orders
    const recentOrders = await orderModel.find()
      .sort({ orderDate: -1 })
      .limit(5)
      .populate('userId', 'fullname email')
      .populate('products.product');
    
    res.render("admin-dashboard-premium", {
      productCount,
      orderCount,
      pendingOrders,
      totalSales,
      recentOrders,
      pageTitle: 'Admin Dashboard'
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    req.flash("error", "Error loading dashboard!");
    res.redirect("/owners/login");
  }
}

// Admin dashboard - Protected routes (legacy and new)
router.get("/admin", isAdmin, renderAdminDashboard);
router.get("/admin/dashboard", isAdmin, renderAdminDashboard);

// View all products
router.get("/admin/products", isAdmin, async function (req, res) {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    res.render("admin-products", { products });
  } catch (err) {
    console.error("Admin products error:", err);
    req.flash("error", "Error loading products!");
    res.redirect("/owners/admin");
  }
});

// Create product page
router.get("/admin/products/create", isAdmin, function (req, res) {
  res.render("createproducts");
});

// Create product POST
router.post("/admin/products/create", isAdmin, upload.single("image"), async function (req, res) {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor, description, stock } = req.body;

    if (!req.file) {
      req.flash("error", "Please upload a product image!");
      return res.redirect("/owners/admin/products/create");
    }

    // Convert image buffer to base64 string for storage
    const imageBase64 = req.file.buffer.toString('base64');
    const imageDataUri = `data:${req.file.mimetype};base64,${imageBase64}`;

    await productModel.create({
      image: imageDataUri,
      name,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      bgcolor: bgcolor || '#ffffff',
      panelcolor: panelcolor || '#f3f4f6',
      textcolor: textcolor || '#000000',
      description: description || '',
      stock: parseInt(stock) || 0
    });

    req.flash("success", "Product created successfully!");
    res.redirect("/owners/admin/products");
  } catch (err) {
    console.error("Product creation error:", err.message);
    req.flash("error", "Error creating product: " + err.message);
    res.redirect("/owners/admin/products/create");
  }
});

// Edit product page
router.get("/admin/products/edit/:id", isAdmin, async function (req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/owners/admin/products");
    }
    res.render("edit-product", { product });
  } catch (err) {
    console.error("Edit product error:", err);
    req.flash("error", "Error loading product!");
    res.redirect("/owners/admin/products");
  }
});

// Update product
router.post("/admin/products/edit/:id", isAdmin, upload.single("image"), async function (req, res) {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor, description, stock } = req.body;
    const updateData = {
      name,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      bgcolor: bgcolor || '#ffffff',
      panelcolor: panelcolor || '#f3f4f6',
      textcolor: textcolor || '#000000',
      description: description || '',
      stock: parseInt(stock) || 0
    };

    if (req.file) {
      const imageBase64 = req.file.buffer.toString('base64');
      updateData.image = `data:${req.file.mimetype};base64,${imageBase64}`;
    }

    await productModel.findByIdAndUpdate(req.params.id, updateData);
    req.flash("success", "Product updated successfully!");
    res.redirect("/owners/admin/products");
  } catch (err) {
    console.error("Update product error:", err);
    req.flash("error", "Error updating product!");
    res.redirect("/owners/admin/products");
  }
});

// Delete product
router.get("/admin/products/delete/:id", isAdmin, async function (req, res) {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted successfully!");
    res.redirect("/owners/admin/products");
  } catch (err) {
    console.error("Delete product error:", err);
    req.flash("error", "Error deleting product!");
    res.redirect("/owners/admin/products");
  }
});

// View all orders
router.get("/admin/orders", isAdmin, async function (req, res) {
  try {
    const orders = await orderModel.find()
      .sort({ orderDate: -1 })
      .populate('user', 'fullname email')
      .populate('items.product');
    res.render("admin-orders", { orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    req.flash("error", "Error loading orders!");
    res.redirect("/owners/admin");
  }
});

// Update order status
router.post("/admin/orders/:id/status", isAdmin, async function (req, res) {
  try {
    const { status } = req.body;
    await orderModel.findByIdAndUpdate(req.params.id, { status });
    req.flash("success", "Order status updated!");
    res.redirect("/owners/admin/orders");
  } catch (err) {
    console.error("Update order status error:", err);
    req.flash("error", "Error updating order status!");
    res.redirect("/owners/admin/orders");
  }
});

module.exports = router;
