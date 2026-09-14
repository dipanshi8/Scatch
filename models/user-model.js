const mongoose = require('mongoose');

function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

userSchema.statics.normalizeEmail = normalizeEmail;

// Exact lowercase match first (uses the unique index), then a case-insensitive
// fallback so mixed-case emails stored before lowercase:true still resolve.
userSchema.statics.findByNormalizedEmail = async function (email, options = {}) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const exactQuery = this.findOne({ email: normalized });
  if (options.select) exactQuery.select(options.select);
  const exact = await exactQuery;
  if (exact) return exact;

  const fuzzyQuery = this.findOne({
    email: { $regex: `^${escapeRegex(normalized)}$`, $options: 'i' }
  });
  if (options.select) fuzzyQuery.select(options.select);
  return fuzzyQuery;
};

module.exports = mongoose.model("user", userSchema);
