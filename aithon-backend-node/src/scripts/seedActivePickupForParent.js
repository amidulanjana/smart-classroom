const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const EmergencyPickup = require('../models/EmergencyPickup');
const Notification = require('../models/Notification');

async function seedActivePickupForParent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // 1. Find the parent
    const parent = await User.findOne({ email: 'parent@school.com' });
    if (!parent) {
      console.error('❌ Parent not found. Run "npm run seed:auth" first.');
      process.exit(1);
    }
    console.log(`Found parent: ${parent.name}`);

    // 2. Find the teacher
    const teacher = await User.findOne({ email: 'teacher@school.com' });
    if (!teacher) {
      console.error('❌ Teacher not found. Run "npm run seed:auth" first.');
      process.exit(1);
    }

    // 3. Find the Mathematics class
    const mathematicsClass = await Class.findOne({ name: 'Mathematics' });
    if (!mathematicsClass) {
      console.error('❌ Mathematics class not found. Run "npm run seed:classes" first.');
      process.exit(1);
    }

    // 4. Find students for this class
    const students = await Student.find({ classId: mathematicsClass._id }).limit(3);
    if (!students || students.length === 0) {
      console.error('❌ Students not found.');
      process.exit(1);
    }

    // UPDATE STUDENTS WITH LOCATION
    console.log('Updating students with demo home locations...');
    const baseLat = 37.78825;
    const baseLng = -122.4324;
    for (let i = 0; i < students.length; i++) {
      students[i].homeLocation = {
        latitude: baseLat + (Math.random() * 0.01 - 0.005),
        longitude: baseLng + (Math.random() * 0.01 - 0.005),
        address: `${100 + i} Demo St, San Francisco, CA`
      };
      await students[i].save();
    }

    // 5. Cleanup Old Data
    console.log('Cleaning up old test data...');
    // Delete notifications for this parent relating to emergency pickups
    await Notification.deleteMany({ 
      recipientId: parent._id, 
      notificationType: 'emergency_pickup' 
    });
    
    // Delete active pickups for this class/teacher to avoid duplicates
    await EmergencyPickup.deleteMany({ 
      initiatedBy: teacher._id, 
      classId: mathematicsClass._id,
      status: 'in_progress'
    });

    // 6. Prepare Data
    console.log('Creating active emergency pickup...');
    const pickupTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const emergencyPickupId = new mongoose.Types.ObjectId();
    
    const studentPickups = [];

    // 7. Create Notifications and link them
    for (const student of students) {
      // Create Notification
      const notification = await Notification.create({
        recipientId: parent._id,
        studentId: student._id,
        emergencyPickupId: emergencyPickupId,
        notificationType: 'emergency_pickup',
        status: 'sent',
        recipientRole: 'primary',
        title: '🚨 Emergency Pickup Required',
        body: `${student.name}'s class (Mathematics) has ended early due to heavy rain. Please confirm pickup.`,
        sentAt: new Date(),
        timeoutAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins timeout
      });

      // Add to pickup structure with history
      studentPickups.push({
        studentId: student._id,
        status: 'primary_notified',
        escalationLevel: 0,
        notificationHistory: [{
          notificationId: notification._id,
          recipientId: parent._id,
          recipientRole: 'primary',
          sentAt: new Date(),
          response: 'pending' // Critical for handlePickupResponse
        }]
      });
      console.log(`✓ Notification created for student: ${student.name}`);
    }

    // 8. Create Emergency Pickup
    const emergencyPickup = await EmergencyPickup.create({
      _id: emergencyPickupId,
      classId: mathematicsClass._id,
      initiatedBy: teacher._id,
      originalEndTime: new Date(),
      newPickupTime: pickupTime,
      reason: 'School closing early due to heavy rain forecast',
      status: 'in_progress',
      studentPickups: studentPickups
    });

    console.log(`Created Emergency Pickup: ${emergencyPickup._id}`);
    console.log('\n✅ ACTIVE PICKUP SEEDED SUCCESSFULLY!');
    console.log('You can now refresh the Parent Dashboard to see 3 pickup requests.');

  } catch (error) {
    console.error('Error seeding active pickup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedActivePickupForParent();
