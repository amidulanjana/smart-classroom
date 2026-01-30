const Message = require('../models/Message');
const MessageClassification = require('../models/MessageClassification');
const Notification = require('../models/Notification');
const Guardian = require('../models/Guardian');

/**
 * Send a new message and trigger AI classification
 */
const sendMessage = async (req, res) => {
  try {
    const { sender_id, student_id, content } = req.body;

    // Create message
    const message = await Message.create({
      senderId: sender_id,
      studentId: student_id,
      content
    });

    // Simulate AI classification (in production, call AI service here)
    const classification = await classifyMessage(content, message._id);

    // Trigger appropriate workflow based on classification
    const notificationsSent = await triggerWorkflow(message, classification);

    res.status(201).json({
      success: true,
      data: {
        message_id: message._id,
        classification: {
          category: classification.category,
          confidence_score: classification.confidenceScore
        },
        workflow_triggered: getWorkflowType(classification.category),
        notifications_sent: notificationsSent
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
 * Get message history
 */
const getMessages = async (req, res) => {
  try {
    const { student_id, limit = 20 } = req.query;

    const query = student_id ? { studentId: student_id } : {};
    
    const messages = await Message.find(query)
      .populate('senderId', 'name email')
      .populate('studentId', 'name')
      .sort({ sentAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions
async function classifyMessage(content, messageId) {
  // Simulate AI classification logic
  const lowerContent = content.toLowerCase();
  let category = 'general_update';
  let confidence = 0.85;

  if (lowerContent.includes('cancel') || lowerContent.includes('pickup')) {
    category = 'after_class_cancellation';
    confidence = 0.95;
  } else if (lowerContent.includes('need') || lowerContent.includes('request')) {
    category = 'item_request';
    confidence = 0.90;
  } else if (lowerContent.includes('meeting') || lowerContent.includes('conference')) {
    category = 'meeting_request';
    confidence = 0.92;
  }

  return await MessageClassification.create({
    messageId,
    category,
    confidenceScore: confidence
  });
}

async function triggerWorkflow(message, classification) {
  let count = 0;

  if (classification.category === 'after_class_cancellation') {
    // Find primary guardian
    const primaryGuardian = await Guardian.findOne({
      studentId: message.studentId,
      priority: 'primary',
      isActive: true
    }).populate('userId');

    if (primaryGuardian) {
      await Notification.create({
        messageId: message._id,
        recipientId: primaryGuardian.userId._id,
        notificationType: 'emergency_pickup',
        timeoutAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min timeout
      });
      count++;
    }
  } else {
    // For other types, notify all guardians
    const guardians = await Guardian.find({
      studentId: message.studentId,
      isActive: true
    }).populate('userId');

    for (const guardian of guardians) {
      await Notification.create({
        messageId: message._id,
        recipientId: guardian.userId._id,
        notificationType: getNotificationType(classification.category)
      });
      count++;
    }
  }

  return count;
}

function getWorkflowType(category) {
  const workflows = {
    'after_class_cancellation': 'emergency_pickup',
    'item_request': 'item_request',
    'meeting_request': 'meeting_invitation',
    'general_update': 'information_notice'
  };
  return workflows[category] || 'general';
}

function getNotificationType(category) {
  const types = {
    'after_class_cancellation': 'emergency_pickup',
    'item_request': 'item_request',
    'meeting_request': 'meeting',
    'general_update': 'general'
  };
  return types[category] || 'general';
}

module.exports = {
  sendMessage,
  getMessages
};
