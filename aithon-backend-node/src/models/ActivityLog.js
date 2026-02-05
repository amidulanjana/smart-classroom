const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['good', 'bad', 'neutral'], 
    default: 'neutral'
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one log per student per activity is usually enough, 
// though we might want multiple if retrying? Let's assume one Result per Activity for simplicity now.
activityLogSchema.index({ activityId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
