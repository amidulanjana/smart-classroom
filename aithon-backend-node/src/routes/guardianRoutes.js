const express = require('express');
const router = express.Router();
const { getStudentGuardians, updateGuardian } = require('../controllers/guardianController');

/**
 * @route   GET /api/v1/students/:student_id/guardians
 * @desc    Get all guardians for a student
 * @access  Public
 */
router.get('/students/:student_id/guardians', getStudentGuardians);

/**
 * @route   PATCH /api/v1/guardians/:id
 * @desc    Update guardian priority
 * @access  Public
 */
router.patch('/:id', updateGuardian);

module.exports = router;
