const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  profilePhoto: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  homeLocation: {
    address: {
      type: String,
      default: ''
    },
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for class lookup
studentSchema.index({ classId: 1 });

module.exports = mongoose.model('Student', studentSchema);
