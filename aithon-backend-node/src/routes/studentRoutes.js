const express = require('express');
const router = express.Router();
const { getStudent, createBackupCircle, getAllStudents } = require('../controllers/studentController');

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 * @access  Public
 */
router.get('/', getAllStudents);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student details
 * @access  Public
 */
router.get('/:id', getStudent);

/**
 * @route   POST /api/v1/students/:student_id/backup-circle
 * @desc    Create backup circle member
 * @access  Public
 */
router.post('/:student_id/backup-circle', createBackupCircle);

module.exports = router;
