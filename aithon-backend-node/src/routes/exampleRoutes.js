const express = require('express');
const router = express.Router();
const { getExample, createExample } = require('../controllers/exampleController');

/**
 * @route   GET /api/example
 * @desc    Get example data
 * @access  Public
 */
router.get('/', getExample);

/**
 * @route   POST /api/example
 * @desc    Create example resource
 * @access  Public
 */
router.post('/', createExample);

module.exports = router;
