const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For student-specific messages
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  // For class-wide messages (like emergency pickup)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  content: {
    type: String,
    required: true
  },
  // Message type for quick filtering
  messageType: {
    type: String,
    enum: ['general', 'emergency', 'item_request', 'meeting', 'announcement'],
    default: 'general'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ senderId: 1 });
messageSchema.index({ classId: 1 });
messageSchema.index({ studentId: 1 });
messageSchema.index({ sentAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
