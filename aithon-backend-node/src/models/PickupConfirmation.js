const mongoose = require('mongoose');

const pickupConfirmationSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guardian',
    required: true
  },
  response: {
    type: String,
    enum: ['accepted', 'declined'],
    required: true
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PickupConfirmation', pickupConfirmationSchema);
