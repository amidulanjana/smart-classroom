const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const BackupCircle = require('../models/BackupCircle');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-classroom');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Guardian.deleteMany({});
    await BackupCircle.deleteMany({});
    console.log('Existing data cleared');

    // Create Teachers
    console.log('Creating teachers...');
    const teacher1 = await User.create({
      name: 'Ms. Sarah Johnson',
      email: 'sarah.johnson@school.com',
      phone: '+1234567890',
      role: 'teacher'
    });
    console.log(`Created teacher: ${teacher1.name} (${teacher1._id})`);

    // Create Classes
    console.log('Creating classes...');
    const class5B = await Class.create({
      name: 'Class 5B',
      teacherId: teacher1._id,
      grade: '5',
      section: 'B',
      academicYear: '2025-2026',
      scheduledEndTime: '15:00',
      scheduledDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    const class6A = await Class.create({
      name: 'Class 6A',
      teacherId: teacher1._id,
      grade: '6',
      section: 'A',
      academicYear: '2025-2026',
      scheduledEndTime: '15:30',
      scheduledDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    const class4C = await Class.create({
      name: 'Class 4C',
      teacherId: teacher1._id,
      grade: '4',
      section: 'C',
      academicYear: '2025-2026',
      scheduledEndTime: '14:30',
      scheduledDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    console.log(`Created class: ${class5B.name} (${class5B._id})`);
    console.log(`Created class: ${class6A.name} (${class6A._id})`);
    console.log(`Created class: ${class4C.name} (${class4C._id})`);

    // Create Parents
    console.log('Creating parents...');
    const parents = [];
    for (let i = 1; i <= 30; i++) {
      const parent = await User.create({
        name: `Parent ${i}`,
        email: `parent${i}@example.com`,
        phone: `+1234567${String(i).padStart(3, '0')}`,
        role: 'parent'
      });
      parents.push(parent);
    }
    console.log(`Created ${parents.length} parents`);

    // Create Students and assign guardians
    console.log('Creating students and guardians...');
    const classes = [
      { classObj: class5B, count: 28 },
      { classObj: class6A, count: 25 },
      { classObj: class4C, count: 30 }
    ];

    let parentIndex = 0;
    let studentCount = 0;

    for (const { classObj, count } of classes) {
      for (let i = 1; i <= count; i++) {
        const student = await Student.create({
          name: `Student ${studentCount + 1}`,
          classId: classObj._id,
          grade: classObj.grade,
          section: classObj.section
        });

        // Assign primary guardian
        const primaryParent = parents[parentIndex % parents.length];
        await Guardian.create({
          userId: primaryParent._id,
          studentId: student._id,
          priority: 'primary'
        });

        // Assign secondary guardian (use next parent)
        const secondaryParent = parents[(parentIndex + 1) % parents.length];
        await Guardian.create({
          userId: secondaryParent._id,
          studentId: student._id,
          priority: 'secondary'
        });

        // Assign backup guardians (3 backup contacts)
        const backupGuardians = [];
        for (let b = 0; b < 3; b++) {
          const backupParent = parents[(parentIndex + 2 + b) % parents.length];
          const backupGuardian = await Guardian.create({
            userId: backupParent._id,
            studentId: student._id,
            priority: 'backup',
            backupOrder: b + 1
          });
          backupGuardians.push(backupGuardian);
        }

        // Create backup circle entries
        for (let b = 0; b < backupGuardians.length; b++) {
          await BackupCircle.create({
            studentId: student._id,
            guardianId: backupGuardians[b]._id,
            priorityOrder: b + 1
          });
        }

        parentIndex++;
        studentCount++;
      }
    }

    console.log(`Created ${studentCount} students with guardians and backup circles`);

    console.log('\n=== Seed Data Summary ===');
    console.log(`Teachers: ${await User.countDocuments({ role: 'teacher' })}`);
    console.log(`Parents: ${await User.countDocuments({ role: 'parent' })}`);
    console.log(`Classes: ${await Class.countDocuments({})}`);
    console.log(`Students: ${await Student.countDocuments({})}`);
    console.log(`Guardians: ${await Guardian.countDocuments({})}`);
    console.log(`Backup Circles: ${await BackupCircle.countDocuments({})}`);
    console.log('\n=== Important IDs ===');
    console.log(`Teacher ID: ${teacher1._id}`);
    console.log(`Class 5B ID: ${class5B._id}`);
    console.log(`Class 6A ID: ${class6A._id}`);
    console.log(`Class 4C ID: ${class4C._id}`);
    console.log('\nSeed data created successfully!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
