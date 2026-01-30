const express = require('express');
const router = express.Router();
const { getClassification } = require('../controllers/classificationController');

/**
 * @route   GET /api/v1/classifications/:message_id
 * @desc    Get classification for a message
 * @access  Public
 */
router.get('/:message_id', getClassification);

module.exports = router;
