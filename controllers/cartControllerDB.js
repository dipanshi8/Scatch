const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Add item to cart (database-persisted).
 * Protected by isLoggedIn — req.user is always present here.
 */
module.exports.addToCart = async function (req, res) {
  try {
    // Support both :id (cart/add/:id) and :productid (addtocart/:productid)
    const productId = req.params.id || req.params.productid;

    const product = await productModel.findById(productId);
    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/shop");
    }
    if (product.stockQuantity <= 0) {
      req.flash("error", "Product is out of stock!");
      return res.redirect("/shop");
    }

    const user = await userModel.findById(req.user._id);

    const existingItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        existingItem.quantity += 1;
      } else {
        req.flash("error", "Maximum stock available reached!");
        return res.redirect("/shop");
      }
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    req.flash("success", "Added to cart!");
    return res.redirect("/cart");

  } catch (err) {
    console.error("addToCart error:", err);
    req.flash("error", "Failed to add product to cart.");
    return res.redirect("/shop");
  }
};

/**
 * Update cart item quantity (increase / decrease).
 * Called via form POST from cart.ejs — SSR redirect flow.
 */
module.exports.updateCartQuantity = async function (req, res) {
  try {
    const { productId, action } = req.body;
    const user = await userModel.findById(req.user._id).populate('cart.product');

    const cartItem = user.cart.find(
      item => item.product._id.toString() === productId
    );

    if (!cartItem) {
      req.flash("error", "Item not found in cart.");
      return res.redirect("/cart");
    }

    if (action === 'increase') {
      if (cartItem.quantity < cartItem.product.stockQuantity) {
        cartItem.quantity += 1;
      } else {
        req.flash("error", "Maximum stock reached.");
        return res.redirect("/cart");
      }
    } else if (action === 'decrease') {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        user.cart = user.cart.filter(
          item => item.product._id.toString() !== productId
        );
      }
    }

    await user.save();
    return res.redirect("/cart");

  } catch (err) {
    console.error("updateCartQuantity error:", err);
    req.flash("error", "Failed to update cart.");
    return res.redirect("/cart");
  }
};

/**
 * Remove an item from the cart entirely.
 */
module.exports.removeFromCart = async function (req, res) {
  try {
    const productId = req.params.id || req.params.productid;
    const user = await userModel.findById(req.user._id);

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );
    await user.save();

    req.flash("success", "Item removed from cart.");
    return res.redirect("/cart");

  } catch (err) {
    console.error("removeFromCart error:", err);
    req.flash("error", "Failed to remove item from cart.");
    return res.redirect("/cart");
  }
};

/**
 * Render the cart page with full product details and totals.
 */
module.exports.getCart = async function (req, res) {
  try {
    const user = await userModel.findById(req.user._id).populate('cart.product');
    const cartItems = user.cart || [];

    let subtotal = 0;
    cartItems.forEach(item => {
      if (item.product) {
        const price = item.product.discountPrice > 0
          ? item.product.discountPrice
          : item.product.price;
        subtotal += price * item.quantity;
      }
    });

    // Free shipping over ₹500, otherwise ₹10
    const shippingFee = subtotal > 500 ? 0 : 10;
    const totalAmount = subtotal + shippingFee;

    return res.render("cart", {
      cartItems,
      subtotal,
      shippingFee,
      totalAmount,
      pageTitle: 'Shopping Bag'
    });

  } catch (err) {
    console.error("getCart error:", err);
    req.flash("error", "Something went wrong while loading the cart.");
    return res.redirect("/shop");
  }
};
