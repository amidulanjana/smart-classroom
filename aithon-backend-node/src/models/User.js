const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'parent', 'admin'],
    required: true
  },
  // Push notification token for mobile app
  pushToken: {
    type: String,
    default: null
  },
  // Profile photo URL
  profilePhoto: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for push notifications
userSchema.index({ pushToken: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
