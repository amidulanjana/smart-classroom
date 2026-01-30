const Notification = require('../models/Notification');

/**
 * Get notifications for a user
 */
const getNotifications = async (req, res) => {
  try {
    const { recipient_id, status } = req.query;

    const query = {};
    if (recipient_id) query.recipientId = recipient_id;
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .populate('messageId')
      .populate('recipientId', 'name email phone')
      .sort({ sentAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications.map(n => ({
        id: n._id,
        message_id: n.messageId._id,
        type: n.notificationType,
        status: n.status,
        sent_at: n.sentAt,
        timeout_at: n.timeoutAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
