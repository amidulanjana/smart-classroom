const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const Student = require('../models/Student');

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const { title, description, type, classId, date } = req.body;
    
    // Assuming the user is a teacher and attached to req.user by auth middleware
    const activity = new Activity({
      title,
      description,
      type,
      classId,
      date: date || Date.now(),
      createdBy: req.user._id
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity', error: error.message });
  }
};

// Get single activity
exports.getActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
};

// Get activities for a specific class
exports.getActivitiesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const activities = await Activity.find({ classId }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

// Add students to activity (Initialize logs)
exports.addStudentsToActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { studentIds } = req.body; // Array of student IDs

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Invalid studentIds format' });
    }

    // Create logs for each student if not exists
    const operations = studentIds.map(studentId => ({
      updateOne: {
        filter: { activityId, studentId },
        update: { 
          $setOnInsert: { 
            status: 'neutral', // Default status upon adding
            note: '' 
          } 
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await ActivityLog.bulkWrite(operations);
    }

    res.json({ message: 'Students added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding students', error: error.message });
  }
};

// Bulk save results for students in an activity
exports.saveActivityResults = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { results } = req.body; 
    // results expected strictly as array of { studentId, status }
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ message: 'Invalid results format' });
    }

    const operations = results.map(result => ({
      updateOne: {
        filter: { activityId, studentId: result.studentId },
        update: { 
          $set: { 
            status: result.status,
            note: result.note || '' 
          } 
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await ActivityLog.bulkWrite(operations);
    }

    res.json({ message: 'Results saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving results', error: error.message });
  }
};

// Get results/participants for an activity
exports.getActivityResults = async (req, res) => {
  try {
    const { activityId } = req.params;
    const logs = await ActivityLog.find({ activityId }).populate('studentId', 'name profilePhoto grade section');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};
