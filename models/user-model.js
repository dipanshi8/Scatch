const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order'
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    },
    phone: String
  },
  contact: {
    type: String,
    trim: true
  },
  picture: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("user", userSchema);
