const productModel = require("../models/product-model");

// Initialize cart in session if it doesn't exist
function initCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
}

// Add item to cart
module.exports.addToCart = async function (req, res) {
  try {
    initCart(req);
    const productId = req.params.productid;
    const product = await productModel.findById(productId);

    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/shop");
    }

    // Check if product is already in cart
    const cartItem = req.session.cart.find(item => item.productId.toString() === productId);

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      req.session.cart.push({
        productId: productId,
        quantity: 1,
        price: product.price,
        discount: product.discount || 0
      });
    }

    // Save session to ensure cart is persisted and cart count updates
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      }
      req.flash("success", "Added to cart!");
      return res.redirect("/shop");
    });
  } catch (err) {
    console.error("Add to cart error:", err.message);
    req.flash("error", "Failed to add product to cart.");
    res.redirect("/shop");
  }
};

// Update cart item quantity
module.exports.updateCartQuantity = async function (req, res) {
  try {
    initCart(req);
    const { productId, action } = req.body;

    const cartItem = req.session.cart.find(item => item.productId.toString() === productId);

    if (!cartItem) {
      return res.json({ success: false, message: "Item not found in cart" });
    }

    if (action === 'increase') {
      cartItem.quantity += 1;
    } else if (action === 'decrease') {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        req.session.cart = req.session.cart.filter(item => item.productId.toString() !== productId);
      }
    }

    req.session.save();
    res.json({ success: true, cart: req.session.cart });
  } catch (err) {
    console.error("Update cart error:", err.message);
    res.json({ success: false, message: "Failed to update cart" });
  }
};

// Remove item from cart
module.exports.removeFromCart = async function (req, res) {
  try {
    initCart(req);
    const productId = req.params.productid;

    req.session.cart = req.session.cart.filter(item => item.productId.toString() !== productId);
    
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      }
      req.flash("success", "Item removed from cart");
      res.redirect("/cart");
    });
  } catch (err) {
    console.error("Remove from cart error:", err.message);
    req.flash("error", "Failed to remove item from cart");
    res.redirect("/cart");
  }
};

// Get cart with product details
module.exports.getCart = async function (req, res) {
  try {
    initCart(req);
    const cartItems = [];
    let totalAmount = 0;
    const platformFee = 20;

    for (const item of req.session.cart) {
      const product = await productModel.findById(item.productId);
      if (product) {
        const itemTotal = (product.price - (product.discount || 0)) * item.quantity;
        totalAmount += itemTotal;
        cartItems.push({
          product: product,
          quantity: item.quantity,
          itemTotal: itemTotal
        });
      }
    }

    const finalTotal = totalAmount + platformFee;

    res.render("cart", {
      cartItems: cartItems,
      totalAmount: totalAmount,
      platformFee: platformFee,
      finalTotal: finalTotal
    });
  } catch (err) {
    console.error("Get cart error:", err.message);
    req.flash("error", "Something went wrong while loading the cart.");
    res.redirect("/shop");
  }
};

