const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: false
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For emergency pickups, track which student this is for
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  // Reference to the emergency pickup event
  emergencyPickupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyPickup',
    default: null
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'timeout', 'cancelled'],
    default: 'sent'
  },
  notificationType: {
    type: String,
    enum: ['emergency_pickup', 'backup_pickup_request', 'pickup_confirmed', 'pickup_assigned', 'item_request', 'meeting', 'general'],
    required: true
  },
  // Role of the recipient in relation to the student
  recipientRole: {
    type: String,
    enum: ['primary', 'secondary', 'backup', 'teacher', null],
    default: null
  },
  // Title and body for push notification
  title: {
    type: String,
    default: null
  },
  body: {
    type: String,
    default: null
  },
  // Additional data payload
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  timeoutAt: {
    type: Date,
    required: false
  },
  // Push notification token used
  pushToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ recipientId: 1, status: 1 });
notificationSchema.index({ emergencyPickupId: 1 });
notificationSchema.index({ studentId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
