const express = require('express');
const router = express.Router();
const { respondToPickup } = require('../controllers/pickupController');

/**
 * @route   POST /api/v1/pickup-confirmations
 * @desc    Respond to pickup request
 * @access  Public
 */
router.post('/', respondToPickup);

module.exports = router;
