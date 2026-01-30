const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  academicYear: {
    type: String,
    required: true
  },
  // Schedule information
  scheduledEndTime: {
    type: String, // Format: "HH:mm"
    required: true
  },
  scheduledDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for teacher lookup
classSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Class', classSchema);
