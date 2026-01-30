const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  priority: {
    type: String,
    enum: ['primary', 'secondary', 'backup'],
    required: true
  },
  backupOrder: {
    type: Number,
    min: 1,
    max: 3,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one guardian per priority per student
guardianSchema.index({ studentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Guardian', guardianSchema);
