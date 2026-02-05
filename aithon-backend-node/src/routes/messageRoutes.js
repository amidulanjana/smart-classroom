const express = require('express');
const router = express.Router();
const { sendMessage, sendEmergencyMessage, getMessages } = require('../controllers/messageController');

/**
 * @route   POST /api/v1/messages
 * @desc    Send a new message (with AI classification)
 * @access  Teacher
 */
router.post('/', sendMessage);

/**
 * @route   POST /api/v1/messages/emergency
 * @desc    Send emergency message for class cancellation/early dismissal
 * @access  Teacher
 */
router.post('/emergency', sendEmergencyMessage);

/**
 * @route   GET /api/v1/messages
 * @desc    Get message history
 * @access  Public
 */
router.get('/', getMessages);

module.exports = router;
