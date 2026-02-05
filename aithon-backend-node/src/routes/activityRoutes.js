const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.post('/', protect, activityController.createActivity);
router.get('/:activityId', protect, activityController.getActivity);
router.get('/class/:classId', protect, activityController.getActivitiesByClass);
router.post('/:activityId/students', protect, activityController.addStudentsToActivity);
router.post('/:activityId/results', protect, activityController.saveActivityResults);
router.get('/:activityId/results', protect, activityController.getActivityResults);

module.exports = router;
