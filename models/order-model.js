const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // Legacy support
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  // Legacy support - items field
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    street: String,
    address: String, // Legacy support
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  shippedDate: Date,
  deliveredDate: Date,
  platformFee: {
    type: Number,
    default: 20
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'UPI', 'Net Banking'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  }
});

// Index for faster queries
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ status: 1 });

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().substring(0, 8).toUpperCase()}`;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('order', orderSchema);

