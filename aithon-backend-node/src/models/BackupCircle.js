const mongoose = require('mongoose');

const backupCircleSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guardian',
    required: true
  },
  priorityOrder: {
    type: Number,
    min: 1,
    max: 3,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique priority order per student
backupCircleSchema.index({ studentId: 1, priorityOrder: 1 }, { unique: true });

module.exports = mongoose.model('BackupCircle', backupCircleSchema);
