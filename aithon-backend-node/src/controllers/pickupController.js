const PickupConfirmation = require('../models/PickupConfirmation');
const Notification = require('../models/Notification');
const Guardian = require('../models/Guardian');
const Message = require('../models/Message');
const BackupCircle = require('../models/BackupCircle');

/**
 * Respond to pickup request
 */
const respondToPickup = async (req, res) => {
  try {
    const { notification_id, guardian_id, response } = req.body;

    // Get notification details
    const notification = await Notification.findById(notification_id).populate('messageId');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Create pickup confirmation
    const confirmation = await PickupConfirmation.create({
      notificationId: notification_id,
      guardianId: guardian_id,
      response
    });

    let escalationStopped = false;

    if (response === 'accepted') {
      // Update notification status
      await Notification.findByIdAndUpdate(notification_id, { status: 'read' });
      
      // Cancel other pending notifications for this message
      await Notification.updateMany(
        {
          messageId: notification.messageId._id,
          status: { $in: ['sent', 'delivered'] },
          _id: { $ne: notification_id }
        },
        { status: 'timeout' }
      );

      escalationStopped = true;
    } else if (response === 'declined') {
      // Trigger escalation
      await handleEscalation(notification);
    }

    res.status(201).json({
      success: true,
      data: {
        confirmation_id: confirmation._id,
        notification_id: notification_id,
        response: response,
        responded_at: confirmation.respondedAt,
        escalation_stopped: escalationStopped
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Handle escalation logic
 */
async function handleEscalation(notification) {
  const message = await Message.findById(notification.messageId);
  
  // Find current guardian's priority
  const currentGuardian = await Guardian.findOne({
    userId: notification.recipientId,
    studentId: message.studentId
  });

  if (currentGuardian.priority === 'primary') {
    // Escalate to secondary
    const secondaryGuardian = await Guardian.findOne({
      studentId: message.studentId,
      priority: 'secondary',
      isActive: true
    }).populate('userId');

    if (secondaryGuardian) {
      await Notification.create({
        messageId: message._id,
        recipientId: secondaryGuardian.userId._id,
        notificationType: 'emergency_pickup',
        timeoutAt: new Date(Date.now() + 5 * 60 * 1000)
      });
    }
  } else if (currentGuardian.priority === 'secondary') {
    // Escalate to backup circle
    const backupCircle = await BackupCircle.find({
      studentId: message.studentId,
      isActive: true
    }).populate({
      path: 'guardianId',
      populate: { path: 'userId' }
    }).sort({ priorityOrder: 1 });

    for (const backup of backupCircle) {
      await Notification.create({
        messageId: message._id,
        recipientId: backup.guardianId.userId._id,
        notificationType: 'emergency_pickup',
        timeoutAt: new Date(Date.now() + 5 * 60 * 1000)
      });
    }
  }
}

module.exports = {
  respondToPickup
};
