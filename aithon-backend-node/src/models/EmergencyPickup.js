const mongoose = require('mongoose');

/**
 * EmergencyPickup Model
 * Tracks the entire emergency pickup workflow from initiation to completion
 */
const emergencyPickupSchema = new mongoose.Schema({
  // Reference to the originating message
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: false
  },
  // Class that was cancelled/ended early
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  // Teacher who initiated
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Original scheduled end time
  originalEndTime: {
    type: Date,
    required: true
  },
  // New pickup time
  newPickupTime: {
    type: Date,
    required: true
  },
  // Reason for early dismissal
  reason: {
    type: String,
    required: true
  },
  // Overall status of the emergency pickup event
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'completed', 'escalated'],
    default: 'initiated'
  },
  // Individual student pickup statuses
  studentPickups: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'notified', 'primary_notified', 'secondary_notified', 'backup_notified', 'confirmed', 'picked_up', 'escalated'],
      default: 'pending'
    },
    // Who confirmed the pickup
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Relationship to student (primary, secondary, backup)
    confirmedByRole: {
      type: String,
      enum: ['primary', 'secondary', 'backup', null],
      default: null
    },
    // When was pickup confirmed
    confirmedAt: {
      type: Date,
      default: null
    },
    // When was student actually picked up
    pickedUpAt: {
      type: Date,
      default: null
    },
    // Current escalation level
    escalationLevel: {
      type: Number,
      default: 0 // 0: primary, 1: secondary, 2: backup circle
    },
    // Notifications sent for this student
    notificationHistory: [{
      notificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
      },
      recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      recipientRole: {
        type: String,
        enum: ['primary', 'secondary', 'backup']
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      response: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'timeout'],
        default: 'pending'
      },
      respondedAt: {
        type: Date,
        default: null
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
emergencyPickupSchema.index({ classId: 1, status: 1 });
emergencyPickupSchema.index({ initiatedBy: 1 });
emergencyPickupSchema.index({ 'studentPickups.studentId': 1 });
emergencyPickupSchema.index({ 'studentPickups.confirmedBy': 1 });

module.exports = mongoose.model('EmergencyPickup', emergencyPickupSchema);
