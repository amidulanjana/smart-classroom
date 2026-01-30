const Student = require('../models/Student');
const BackupCircle = require('../models/BackupCircle');

/**
 * Get student details
 */
const getStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create backup circle member
 */
const createBackupCircle = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { guardian_id, priority_order } = req.body;

    // Check if priority order is already taken
    const existing = await BackupCircle.findOne({
      studentId: student_id,
      priorityOrder: priority_order,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Priority order already assigned'
      });
    }

    const backupMember = await BackupCircle.create({
      studentId: student_id,
      guardianId: guardian_id,
      priorityOrder: priority_order
    });

    res.status(201).json({
      success: true,
      data: backupMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all students
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStudent,
  createBackupCircle,
  getAllStudents
};
