const mongoose = require('mongoose');

const messageClassificationSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['after_class_cancellation', 'item_request', 'meeting_request', 'general_update'],
    required: true
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  classifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MessageClassification', messageClassificationSchema);
