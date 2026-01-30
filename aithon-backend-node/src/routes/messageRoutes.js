const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');

/**
 * @route   POST /api/v1/messages
 * @desc    Send a new message
 * @access  Public
 */
router.post('/', sendMessage);

/**
 * @route   GET /api/v1/messages
 * @desc    Get message history
 * @access  Public
 */
router.get('/', getMessages);

module.exports = router;
