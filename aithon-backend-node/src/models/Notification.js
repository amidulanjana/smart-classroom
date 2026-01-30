const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'timeout'],
    default: 'sent'
  },
  notificationType: {
    type: String,
    enum: ['emergency_pickup', 'item_request', 'meeting', 'general'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  timeoutAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
