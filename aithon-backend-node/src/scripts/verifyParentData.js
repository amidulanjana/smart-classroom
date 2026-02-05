const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const EmergencyPickup = require('../models/EmergencyPickup'); // Required for population
const Student = require('../models/Student'); // Required
const Class = require('../models/Class'); // Required
const User = require('../models/User'); // Required
const config = require('../config/config');
const database = require('../config/database');

async function verifyParentData() {
  try {
    await database();
    
    // Find parent
    const parent = await User.findOne({ email: 'parent@school.com' });
    if (!parent) {
      console.log('Parent not found');
      return;
    }

    console.log(`Checking notifications for parent: ${parent._id}`);

    const notifications = await Notification.find({
      recipientId: parent._id,
      notificationType: { $in: ['emergency_pickup', 'backup_pickup_request'] },
      status: { $in: ['sent', 'delivered'] }
    })
    .populate('studentId', 'name profilePhoto grade')
    .populate({
      path: 'emergencyPickupId',
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'initiatedBy', select: 'name' }
      ]
    })
    .sort({ sentAt: -1 });

    console.log(`Found ${notifications.length} notifications.`);
    
    if (notifications.length > 0) {
      const n = notifications[0];
      console.log('--- Sample Notification Structure ---');
      console.log('ID:', n._id);
      console.log('Student:', n.studentId ? n.studentId.name : 'MISSING');
      
      const pickup = n.emergencyPickupId;
      if (pickup) {
        console.log('Pickup ID:', pickup._id);
        console.log('Class:', pickup.classId ? pickup.classId.name : 'MISSING (or not populated)');
        console.log('Teacher:', pickup.initiatedBy ? pickup.initiatedBy.name : 'MISSING (or not populated)');
        console.log('New Pickup Time:', pickup.newPickupTime);
        console.log('Reason:', pickup.reason);
      } else {
        console.log('Emergency Pickup is NULL');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

verifyParentData();
