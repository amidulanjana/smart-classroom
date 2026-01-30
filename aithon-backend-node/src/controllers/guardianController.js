const Guardian = require('../models/Guardian');
const User = require('../models/User');

/**
 * Get all guardians for a student
 */
const getStudentGuardians = async (req, res) => {
  try {
    const { student_id } = req.params;

    const guardians = await Guardian.find({
      studentId: student_id,
      isActive: true
    }).populate('userId', 'name email phone');

    const primary = guardians.find(g => g.priority === 'primary');
    const secondary = guardians.find(g => g.priority === 'secondary');
    const backup = guardians.filter(g => g.priority === 'backup').sort((a, b) => a.backupOrder - b.backupOrder);

    res.status(200).json({
      success: true,
      data: {
        primary: primary ? {
          id: primary.userId._id,
          name: primary.userId.name,
          phone: primary.userId.phone,
          email: primary.userId.email
        } : null,
        secondary: secondary ? {
          id: secondary.userId._id,
          name: secondary.userId.name,
          phone: secondary.userId.phone,
          email: secondary.userId.email
        } : null,
        backup_circle: backup.map(b => ({
          id: b.userId._id,
          name: b.userId.name,
          priority_order: b.backupOrder
        }))
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
 * Update guardian priority
 */
const updateGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, is_active } = req.body;

    const updates = {};
    if (priority) updates.priority = priority;
    if (typeof is_active !== 'undefined') updates.isActive = is_active;

    const guardian = await Guardian.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('userId', 'name email phone');

    if (!guardian) {
      return res.status(404).json({
        success: false,
        message: 'Guardian not found'
      });
    }

    res.status(200).json({
      success: true,
      data: guardian
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStudentGuardians,
  updateGuardian
};
