const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    enum: ['Backpacks', 'Handbags', 'Clutches'],
    required: true,
    default: 'Handbags'
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  // Legacy support - keep for backward compatibility
  image: {
    type: String
  },
  // Legacy color fields - keep for backward compatibility
  bgcolor: {
    type: String,
    default: '#ffffff'
  },
  panelcolor: {
    type: String,
    default: '#f3f4f6'
  },
  textcolor: {
    type: String,
    default: '#000000'
  },
  // Legacy discount field
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Legacy stock field
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for getting the effective price (after discount)
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Virtual for getting discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Sync legacy fields
  if (this.stockQuantity !== undefined) {
    this.stock = this.stockQuantity;
  }
  if (this.discountPrice !== undefined && this.discountPrice > 0) {
    this.discount = this.price - this.discountPrice;
  }
  next();
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("product", productSchema);

