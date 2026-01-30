const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');

/**
 * @route   GET /api/v1/notifications
 * @desc    Get notifications
 * @access  Public
 */
router.get('/', getNotifications);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Public
 */
router.patch('/:id/read', markAsRead);

module.exports = router;
