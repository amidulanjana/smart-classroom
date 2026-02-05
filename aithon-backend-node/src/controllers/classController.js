const Class = require('../models/Class');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const User = require('../models/User');

/**
 * Get all classes for a teacher
 */
const getTeacherClasses = async (req, res) => {
  try {
    const { teacher_id } = req.params;

    const classes = await Class.find({ teacherId: teacher_id, isActive: true })
      .sort({ name: 1 });

    // Get student count for each class
    const classesWithStudentCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classId: cls._id, isActive: true });
        return {
          ...cls.toObject(),
          studentCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: classesWithStudentCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get class details with students
 */
const getClassDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const classInfo = await Class.findById(id)
      .populate('teacherId', 'name email phone');

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const students = await Student.find({ classId: id, isActive: true })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...classInfo.toObject(),
        students
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create a new class
 */
const createClass = async (req, res) => {
  try {
    const { name, teacher_id, grade, section, academic_year, scheduled_end_time, scheduled_days } = req.body;

    const newClass = await Class.create({
      name,
      teacherId: teacher_id,
      grade,
      section: section || 'A',
      academicYear: academic_year,
      scheduledEndTime: scheduled_end_time,
      scheduledDays: scheduled_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get students in a class with their guardians
 */
const getClassStudentsWithGuardians = async (req, res) => {
  try {
    const { id } = req.params;

    const students = await Student.find({ classId: id, isActive: true });

    const studentsWithGuardians = await Promise.all(
      students.map(async (student) => {
        const guardians = await Guardian.find({ studentId: student._id, isActive: true })
          .populate('userId', 'name email phone')
          .sort({ priority: 1 });

        return {
          ...student.toObject(),
          guardians: guardians.map(g => ({
            id: g._id,
            priority: g.priority,
            backupOrder: g.backupOrder,
            user: g.userId
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      data: studentsWithGuardians
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update class
 */
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all classes (admin)
 */
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('teacherId', 'name email')
      .sort({ grade: 1, section: 1 });

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTeacherClasses,
  getClassDetails,
  createClass,
  getClassStudentsWithGuardians,
  updateClass,
  getAllClasses
};
