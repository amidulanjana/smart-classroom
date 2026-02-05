const express = require('express');
const router = express.Router();
const {
  initiateEmergencyPickup,
  respondToEmergencyPickup,
  markAsPickedUp,
  getEmergencyPickupStatus,
  getEmergencyPickupsByClass,
  getPendingPickups,
  getActivePickupsForTeacher,
  getStudentPickupHistory,
  processTimeouts
} = require('../controllers/emergencyPickupController');

/**
 * @route   POST /api/v1/emergency-pickups
 * @desc    Initiate emergency pickup for a class
 * @access  Teacher only
 */
router.post('/', initiateEmergencyPickup);

/**
 * @route   POST /api/v1/emergency-pickups/respond
 * @desc    Respond to emergency pickup request (accept/decline)
 * @access  Parent/Guardian
 */
router.post('/respond', respondToEmergencyPickup);

/**
 * @route   POST /api/v1/emergency-pickups/picked-up
 * @desc    Mark student as picked up
 * @access  Teacher
 */
router.post('/picked-up', markAsPickedUp);

/**
 * @route   GET /api/v1/emergency-pickups/:id
 * @desc    Get emergency pickup status
 * @access  Public
 */
router.get('/:id', getEmergencyPickupStatus);

/**
 * @route   GET /api/v1/emergency-pickups/class/:class_id
 * @desc    Get all emergency pickups for a class
 * @access  Teacher
 */
router.get('/class/:class_id', getEmergencyPickupsByClass);

/**
 * @route   GET /api/v1/emergency-pickups/pending/:user_id
 * @desc    Get pending pickup requests for a user
 * @access  Parent/Guardian
 */
router.get('/pending/:user_id', getPendingPickups);

/**
 * @route   GET /api/v1/emergency-pickups/teacher/:teacher_id/active
 * @desc    Get active emergency pickups for teacher
 * @access  Teacher
 */
router.get('/teacher/:teacher_id/active', getActivePickupsForTeacher);

/**
 * @route   GET /api/v1/emergency-pickups/student/:student_id/history
 * @desc    Get pickup history for a student
 * @access  Parent/Teacher
 */
router.get('/student/:student_id/history', getStudentPickupHistory);

/**
 * @route   POST /api/v1/emergency-pickups/process-timeouts
 * @desc    Process timeout escalations (for cron job)
 * @access  Internal/Admin
 */
router.post('/process-timeouts', processTimeouts);

module.exports = router;
