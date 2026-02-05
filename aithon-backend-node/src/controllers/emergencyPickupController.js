const emergencyPickupService = require('../services/emergencyPickupService');
const EmergencyPickup = require('../models/EmergencyPickup');
const Notification = require('../models/Notification');
const Student = require('../models/Student');

/**
 * Initiate emergency pickup for a class
 * Called when teacher sends a message through chat that is classified as class cancellation
 */
const initiateEmergencyPickup = async (req, res) => {
  try {
    const { message_id, class_id, teacher_id, reason, pickup_time } = req.body;

    if (!class_id || !teacher_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: class_id, teacher_id, reason'
      });
    }

    const result = await emergencyPickupService.initiateEmergencyPickup(
      message_id || null,
      class_id,
      teacher_id,
      reason,
      pickup_time || new Date(Date.now() + 30 * 60 * 1000) // Default: 30 mins from now
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Respond to emergency pickup request (accept/decline)
 */
const respondToEmergencyPickup = async (req, res) => {
  try {
    const { emergency_pickup_id, student_id, user_id, response } = req.body;

    if (!emergency_pickup_id || !student_id || !user_id || !response) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: emergency_pickup_id, student_id, user_id, response'
      });
    }

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be "accepted" or "declined"'
      });
    }

    const result = await emergencyPickupService.handlePickupResponse(
      emergency_pickup_id,
      student_id,
      user_id,
      response
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mark student as picked up
 */
const markAsPickedUp = async (req, res) => {
  try {
    const { emergency_pickup_id, student_id } = req.body;

    if (!emergency_pickup_id || !student_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: emergency_pickup_id, student_id'
      });
    }

    const result = await emergencyPickupService.markAsPickedUp(
      emergency_pickup_id,
      student_id
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get emergency pickup status
 */
const getEmergencyPickupStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const emergencyPickup = await emergencyPickupService.getEmergencyPickupStatus(id);

    res.status(200).json({
      success: true,
      data: emergencyPickup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all emergency pickups for a class
 */
const getEmergencyPickupsByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const emergencyPickups = await EmergencyPickup.find({ classId: class_id })
      .populate('initiatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: emergencyPickups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get pending pickup requests for a user
 */
const getPendingPickups = async (req, res) => {
  try {
    const { user_id } = req.params;

    const pendingPickups = await emergencyPickupService.getPendingPickupsForUser(user_id);

    res.status(200).json({
      success: true,
      data: pendingPickups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get active emergency pickups for teacher
 */
const getActivePickupsForTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;

    const activePickups = await EmergencyPickup.find({
      initiatedBy: teacher_id,
      status: { $in: ['initiated', 'in_progress'] }
    })
    .populate('classId', 'name grade section')
    .populate('studentPickups.studentId', 'name profilePhoto')
    .populate('studentPickups.confirmedBy', 'name phone')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activePickups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get pickup history for a student
 */
const getStudentPickupHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { limit = 10 } = req.query;

    const history = await EmergencyPickup.find({
      'studentPickups.studentId': student_id
    })
    .populate('classId', 'name')
    .populate('initiatedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Extract just the relevant student's pickup info
    const studentHistory = history.map(ep => {
      const studentPickup = ep.studentPickups.find(
        sp => sp.studentId.toString() === student_id
      );
      return {
        emergencyPickupId: ep._id,
        classId: ep.classId,
        reason: ep.reason,
        pickupTime: ep.newPickupTime,
        status: studentPickup?.status,
        confirmedBy: studentPickup?.confirmedBy,
        confirmedByRole: studentPickup?.confirmedByRole,
        confirmedAt: studentPickup?.confirmedAt,
        pickedUpAt: studentPickup?.pickedUpAt,
        createdAt: ep.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: studentHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Process timeout escalations (called by cron or scheduled task)
 */
const processTimeouts = async (req, res) => {
  try {
    await emergencyPickupService.processTimeoutEscalations();

    res.status(200).json({
      success: true,
      message: 'Timeout escalations processed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  initiateEmergencyPickup,
  respondToEmergencyPickup,
  markAsPickedUp,
  getEmergencyPickupStatus,
  getEmergencyPickupsByClass,
  getPendingPickups,
  getActivePickupsForTeacher,
  getStudentPickupHistory,
  processTimeouts
};
