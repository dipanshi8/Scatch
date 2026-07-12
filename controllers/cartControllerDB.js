const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

/**
 * Add item to cart (database-persisted)
 */
module.exports.addToCart = async function (req, res) {
  try {
    console.log('🛒 [addToCart] Request received');
    console.log('🛒 [addToCart] User:', req.user ? req.user.email : 'NOT LOGGED IN');
    console.log('🛒 [addToCart] Product ID:', req.params.id || req.params.productid);
    
    if (!req.user || !req.user._id) {
      console.log('❌ [addToCart] User not authenticated, redirecting to /login');
      req.flash("error", "Please login to add items to your cart.");
      return res.redirect("/login");
    }

    // Support both :id and :productid parameters
    const productId = req.params.id || req.params.productid;
    const product = await productModel.findById(productId);

    if (!product) {
      console.log('❌ [addToCart] Product not found:', productId);
      req.flash("error", "Product not found!");
      return res.redirect("/shop");
    }

    if (product.stockQuantity <= 0) {
      console.log('❌ [addToCart] Product out of stock:', product.name);
      req.flash("error", "Product is out of stock!");
      return res.redirect("/shop");
    }

    const user = await userModel.findById(req.user._id);
    console.log('✅ [addToCart] User found, current cart items:', user.cart.length);
    
    // Check if product already in cart
    const existingCartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingCartItem) {
      // Increment quantity if item exists
      if (existingCartItem.quantity < product.stockQuantity) {
        existingCartItem.quantity += 1;
        console.log('➕ [addToCart] Incremented quantity for existing item');
      } else {
        console.log('❌ [addToCart] Maximum stock reached');
        req.flash("error", "Maximum stock available reached!");
        return res.redirect("/shop");
      }
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity: 1
      });
      console.log('➕ [addToCart] Added new item to cart');
    }

    await user.save();
    console.log('💾 [addToCart] Cart saved to database');

    req.flash("success", "Added to cart!");
    console.log('✅ [addToCart] Redirecting to /cart');
    // Redirect to cart page to show the added item
    res.redirect("/cart");
  } catch (err) {
    console.error("Add to cart error:", err.message);
    req.flash("error", "Failed to add product to cart.");
    res.redirect("/shop");
  }
};

/**
 * Update cart item quantity.
 * Called via form POST from cart.ejs — redirects back to /cart (SSR flow).
 */
module.exports.updateCartQuantity = async function (req, res) {
  try {
    if (!req.user || !req.user._id) {
      req.flash("error", "Please login!");
      return res.redirect("/login");
    }

    const { productId, action } = req.body;
    const user = await userModel.findById(req.user._id).populate('cart.product');

    const cartItem = user.cart.find(item => item.product._id.toString() === productId);

    if (!cartItem) {
      req.flash("error", "Item not found in cart");
      return res.redirect("/cart");
    }

    if (action === 'increase') {
      if (cartItem.quantity < cartItem.product.stockQuantity) {
        cartItem.quantity += 1;
      } else {
        req.flash("error", "Maximum stock reached");
        return res.redirect("/cart");
      }
    } else if (action === 'decrease') {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        user.cart = user.cart.filter(item => item.product._id.toString() !== productId);
      }
    }

    await user.save();
    res.redirect("/cart");
  } catch (err) {
    console.error("Update cart error:", err.message);
    req.flash("error", "Failed to update cart");
    res.redirect("/cart");
  }
};

/**
 * Remove item from cart
 */
module.exports.removeFromCart = async function (req, res) {
  try {
    if (!req.user || !req.user._id) {
      req.flash("error", "Please login!");
      return res.redirect("/login");
    }

    // Support both :id and :productid parameters
    const productId = req.params.id || req.params.productid;
    const user = await userModel.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    req.flash("success", "Item removed from cart");
    res.redirect("/cart");
  } catch (err) {
    console.error("Remove from cart error:", err.message);
    req.flash("error", "Failed to remove item from cart");
    res.redirect("/cart");
  }
};

/**
 * Get cart with product details
 */
module.exports.getCart = async function (req, res) {
  try {
    console.log('🛒 [getCart] Request received');
    console.log('🛒 [getCart] User:', req.user ? req.user.email : 'NOT LOGGED IN');
    
    if (!req.user || !req.user._id) {
      console.log('❌ [getCart] User not authenticated, redirecting to /login');
      req.flash("error", "Please login to view your cart!");
      return res.redirect("/login");
    }

    // Use populate to get full product data
    const user = await userModel.findById(req.user._id).populate('cart.product');
    const cartItems = user.cart || [];
    console.log('✅ [getCart] Cart items loaded:', cartItems.length);

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach(item => {
      if (item.product) {
        const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
        subtotal += price * item.quantity;
      }
    });

    const shippingFee = subtotal > 500 ? 0 : 10; // Free shipping over $500, else $10
    const totalAmount = subtotal + shippingFee;
    console.log('💰 [getCart] Subtotal:', subtotal, 'Total:', totalAmount);

    // Render cart.ejs (or cart-premium.ejs if cart.ejs doesn't exist)
    res.render("cart", {
      cartItems: cartItems,
      subtotal: subtotal,
      shippingFee: shippingFee,
      totalAmount: totalAmount,
      pageTitle: 'Shopping Bag'
    });
  } catch (err) {
    console.error("Get cart error:", err.message);
    req.flash("error", "Something went wrong while loading the cart.");
    res.redirect("/shop");
  }
};

