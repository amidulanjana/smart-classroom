const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');

async function seedGuardiansForTestParent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Find the test parent
    const parent = await User.findOne({ email: 'parent@school.com', role: 'parent' });
    
    if (!parent) {
      console.error('❌ Test parent not found! Please run: npm run seed:auth first');
      process.exit(1);
    }

    console.log(`Found parent: ${parent.name} (${parent._id})`);

    // Find some students (first 3 from Mathematics class)
    const students = await Student.find({ isActive: true }).limit(3);
    
    if (students.length === 0) {
      console.error('❌ No students found! Please run: npm run seed:classes first');
      process.exit(1);
    }

    // Clear existing guardians for this parent
    await Guardian.deleteMany({ userId: parent._id });
    console.log('Cleared existing guardian relationships for test parent');

    // Create guardian relationships
    console.log('\nCreating guardian relationships...');
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      await Guardian.create({
        userId: parent._id,
        studentId: student._id,
        relationship: i === 0 ? 'parent' : 'guardian',
        priority: 'primary',
        canPickup: true,
        isEmergencyContact: true,
        isActive: true
      });
      console.log(`✓ ${parent.name} → ${student.name} (${i === 0 ? 'Primary Parent' : 'Primary Guardian'})`);
    }

    console.log(`\n✅ Guardian relationships created successfully!`);
    console.log(`\nSummary:`);
    console.log(`- Parent: ${parent.name} (${parent.email})`);
    console.log(`- Students: ${students.length}`);
    students.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} (${s.studentId})`));
    console.log(`\nYou can now login as parent@school.com / password123`);
    
  } catch (error) {
    console.error('Error seeding guardians:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedGuardiansForTestParent();
