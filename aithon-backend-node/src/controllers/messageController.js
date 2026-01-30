const Message = require('../models/Message');
const MessageClassification = require('../models/MessageClassification');
const Notification = require('../models/Notification');
const Guardian = require('../models/Guardian');
const Student = require('../models/Student');
const Class = require('../models/Class');
const emergencyPickupService = require('../services/emergencyPickupService');

/**
 * Send a new message and trigger AI classification
 * This is the main endpoint for teacher chat messages
 */
const sendMessage = async (req, res) => {
  try {
    const { sender_id, class_id, content, student_id } = req.body;

    // If class_id is provided, this is a class-wide message (emergency pickup scenario)
    // If student_id is provided, this is a student-specific message
    
    // Create message
    const message = await Message.create({
      senderId: sender_id,
      studentId: student_id || null,
      classId: class_id || null,
      content
    });

    // AI classification
    const classification = await classifyMessage(content, message._id);

    let result = {
      message_id: message._id,
      classification: {
        category: classification.category,
        confidence_score: classification.confidenceScore
      },
      workflow_triggered: getWorkflowType(classification.category)
    };

    // Trigger appropriate workflow based on classification
    if (classification.category === 'after_class_cancellation' && class_id) {
      // This is an emergency pickup scenario - use the full emergency pickup flow
      const emergencyResult = await emergencyPickupService.initiateEmergencyPickup(
        message._id,
        class_id,
        sender_id,
        content,
        new Date(Date.now() + 30 * 60 * 1000) // Default pickup in 30 mins
      );
      
      result.emergency_pickup = emergencyResult;
      result.notifications_sent = emergencyResult.notificationsSent;
    } else if (student_id) {
      // Student-specific message
      const notificationsSent = await triggerWorkflow(message, classification);
      result.notifications_sent = notificationsSent;
    } else if (class_id) {
      // Class-wide general message
      const notificationsSent = await notifyClassParents(message, classification, class_id);
      result.notifications_sent = notificationsSent;
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Send message specifically for emergency class cancellation
 * Direct endpoint for the emergency pickup flow
 */
const sendEmergencyMessage = async (req, res) => {
  try {
    const { sender_id, class_id, content, reason, pickup_time } = req.body;

    if (!sender_id || !class_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sender_id, class_id, content'
      });
    }

    // Create message
    const message = await Message.create({
      senderId: sender_id,
      classId: class_id,
      content
    });

    // Classify as emergency
    const classification = await MessageClassification.create({
      messageId: message._id,
      category: 'after_class_cancellation',
      confidenceScore: 1.0
    });

    // Initiate emergency pickup
    const emergencyResult = await emergencyPickupService.initiateEmergencyPickup(
      message._id,
      class_id,
      sender_id,
      reason || content,
      pickup_time ? new Date(pickup_time) : new Date(Date.now() + 30 * 60 * 1000)
    );

    res.status(201).json({
      success: true,
      data: {
        message_id: message._id,
        classification: {
          category: 'after_class_cancellation',
          confidence_score: 1.0
        },
        workflow_triggered: 'emergency_pickup',
        emergency_pickup: emergencyResult
      }
    });
  } catch (error) {
    console.error('Error sending emergency message:', error);
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
    const { student_id, class_id, limit = 20 } = req.query;

    const query = {};
    if (student_id) query.studentId = student_id;
    if (class_id) query.classId = class_id;
    
    const messages = await Message.find(query)
      .populate('senderId', 'name email')
      .populate('studentId', 'name')
      .populate('classId', 'name grade section')
      .sort({ sentAt: -1 })
      .limit(parseInt(limit));

    // Get classifications for messages
    const messagesWithClassification = await Promise.all(
      messages.map(async (msg) => {
        const classification = await MessageClassification.findOne({ messageId: msg._id });
        return {
          ...msg.toObject(),
          classification: classification ? {
            category: classification.category,
            confidence_score: classification.confidenceScore
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: messagesWithClassification
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
  // AI classification logic - in production, integrate with OpenAI/other AI service
  const lowerContent = content.toLowerCase();
  let category = 'general_update';
  let confidence = 0.85;

  // Emergency pickup keywords
  const emergencyKeywords = ['cancel', 'cancelled', 'canceled', 'pickup', 'pick up', 'early', 'end early', 'ending early', 'dismiss', 'dismissal', 'emergency', 'leave early', 'go home'];
  
  // Item request keywords
  const itemKeywords = ['need', 'bring', 'request', 'required', 'materials', 'supplies', 'items', 'tomorrow', 'next week'];
  
  // Meeting keywords
  const meetingKeywords = ['meeting', 'conference', 'discuss', 'parent-teacher', 'ptm', 'schedule', 'appointment'];

  // Check for emergency pickup
  if (emergencyKeywords.some(keyword => lowerContent.includes(keyword))) {
    category = 'after_class_cancellation';
    confidence = 0.95;
  }
  // Check for item request
  else if (itemKeywords.some(keyword => lowerContent.includes(keyword))) {
    category = 'item_request';
    confidence = 0.90;
  }
  // Check for meeting
  else if (meetingKeywords.some(keyword => lowerContent.includes(keyword))) {
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

    if (primaryGuardian && primaryGuardian.userId) {
      const student = await Student.findById(message.studentId);
      await Notification.create({
        messageId: message._id,
        recipientId: primaryGuardian.userId._id,
        studentId: message.studentId,
        notificationType: 'emergency_pickup',
        recipientRole: 'primary',
        title: '🚨 Emergency Pickup Required',
        body: `${student?.name || 'Your child'}'s class needs early pickup.`,
        timeoutAt: new Date(Date.now() + 5 * 60 * 1000)
      });
      count++;
    }
  } else {
    // For other types, notify all guardians
    const guardians = await Guardian.find({
      studentId: message.studentId,
      isActive: true
    }).populate('userId');

    const student = await Student.findById(message.studentId);
    const notificationType = getNotificationType(classification.category);
    const title = getNotificationTitle(classification.category);

    for (const guardian of guardians) {
      if (guardian.userId) {
        await Notification.create({
          messageId: message._id,
          recipientId: guardian.userId._id,
          studentId: message.studentId,
          notificationType,
          recipientRole: guardian.priority,
          title,
          body: message.content.substring(0, 100)
        });
        count++;
      }
    }
  }

  return count;
}

async function notifyClassParents(message, classification, classId) {
  let count = 0;

  // Get all students in the class
  const students = await Student.find({ classId, isActive: true });

  // Get unique parent IDs
  const notifiedParents = new Set();
  const notificationType = getNotificationType(classification.category);
  const title = getNotificationTitle(classification.category);

  for (const student of students) {
    const guardians = await Guardian.find({
      studentId: student._id,
      isActive: true
    }).populate('userId');

    for (const guardian of guardians) {
      if (guardian.userId && !notifiedParents.has(guardian.userId._id.toString())) {
        await Notification.create({
          messageId: message._id,
          recipientId: guardian.userId._id,
          studentId: student._id,
          notificationType,
          recipientRole: guardian.priority,
          title,
          body: message.content.substring(0, 100)
        });
        notifiedParents.add(guardian.userId._id.toString());
        count++;
      }
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

function getNotificationTitle(category) {
  const titles = {
    'after_class_cancellation': '🚨 Emergency Pickup Required',
    'item_request': '📝 Item Request from Teacher',
    'meeting_request': '📅 Meeting Request',
    'general_update': '📢 Update from Teacher'
  };
  return titles[category] || '📢 New Message';
}

module.exports = {
  sendMessage,
  sendEmergencyMessage,
  getMessages
};
