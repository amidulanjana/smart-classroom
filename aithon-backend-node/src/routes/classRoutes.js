const express = require('express');
const router = express.Router();
const {
  getTeacherClasses,
  getClassDetails,
  createClass,
  getClassStudentsWithGuardians,
  updateClass,
  getAllClasses
} = require('../controllers/classController');

/**
 * @route   GET /api/v1/classes
 * @desc    Get all classes
 * @access  Admin
 */
router.get('/', getAllClasses);

/**
 * @route   POST /api/v1/classes
 * @desc    Create a new class
 * @access  Admin/Teacher
 */
router.post('/', createClass);

/**
 * @route   GET /api/v1/classes/teacher/:teacher_id
 * @desc    Get all classes for a teacher
 * @access  Teacher
 */
router.get('/teacher/:teacher_id', getTeacherClasses);

/**
 * @route   GET /api/v1/classes/:id
 * @desc    Get class details with students
 * @access  Teacher
 */
router.get('/:id', getClassDetails);

/**
 * @route   PUT /api/v1/classes/:id
 * @desc    Update class
 * @access  Admin/Teacher
 */
router.put('/:id', updateClass);

/**
 * @route   GET /api/v1/classes/:id/students-with-guardians
 * @desc    Get students in a class with their guardians
 * @access  Teacher
 */
router.get('/:id/students-with-guardians', getClassStudentsWithGuardians);

module.exports = router;
