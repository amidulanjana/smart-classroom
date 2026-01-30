const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');

async function seedClassesForTestTeacher() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Find the test teacher
    const teacher = await User.findOne({ email: 'teacher@school.com', role: 'teacher' });
    
    if (!teacher) {
      console.error('❌ Test teacher not found! Please run: npm run seed:auth first');
      process.exit(1);
    }

    console.log(`Found teacher: ${teacher.name} (${teacher._id})`);

    // Clear existing classes and students for this teacher
    await Class.deleteMany({ teacherId: teacher._id });
    console.log('Cleared existing classes for test teacher');

    // Create Classes
    console.log('Creating classes...');
    const mathematics = await Class.create({
      name: 'Mathematics',
      teacherId: teacher._id,
      grade: '5',
      section: 'A',
      academicYear: '2025-2026',
      scheduledEndTime: '15:00',
      scheduledDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    const science = await Class.create({
      name: 'Science',
      teacherId: teacher._id,
      grade: '5',
      section: 'B',
      academicYear: '2025-2026',
      scheduledEndTime: '15:30',
      scheduledDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    const english = await Class.create({
      name: 'English',
      teacherId: teacher._id,
      grade: '6',
      section: 'A',
      academicYear: '2025-2026',
      scheduledEndTime: '14:30',
      scheduledDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });

    console.log(`✓ Created class: ${mathematics.name} - Grade ${mathematics.grade}${mathematics.section}`);
    console.log(`✓ Created class: ${science.name} - Grade ${science.grade}${science.section}`);
    console.log(`✓ Created class: ${english.name} - Grade ${english.grade}${english.section}`);

    // Create some students for each class
    console.log('\nCreating students...');
    const classes = [
      { classObj: mathematics, count: 25 },
      { classObj: science, count: 28 },
      { classObj: english, count: 22 }
    ];

    let totalStudents = 0;
    for (const { classObj, count } of classes) {
      for (let i = 1; i <= count; i++) {
        await Student.create({
          name: `Student ${totalStudents + i}`,
          classId: classObj._id,
          grade: classObj.grade,
          section: classObj.section,
          studentId: `STU${String(totalStudents + i).padStart(4, '0')}`,
          isActive: true
        });
      }
      console.log(`✓ Created ${count} students for ${classObj.name}`);
      totalStudents += count;
    }

    console.log(`\n✅ Classes and students seeded successfully!`);
    console.log(`\nSummary:`);
    console.log(`- Teacher: ${teacher.name} (${teacher.email})`);
    console.log(`- Classes: 3 (Mathematics, Science, English)`);
    console.log(`- Students: ${totalStudents} total`);
    console.log(`\nYou can now login as teacher@school.com / password123`);
    
  } catch (error) {
    console.error('Error seeding classes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedClassesForTestTeacher();
