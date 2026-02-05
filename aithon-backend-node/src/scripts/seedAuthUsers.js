const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');

const testUsers = [
  {
    name: 'John Teacher',
    email: 'teacher@school.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'teacher',
  },
  {
    name: 'Sarah Parent',
    email: 'parent@school.com',
    password: 'password123',
    phone: '+0987654321',
    role: 'parent',
  },
  {
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'password123',
    phone: '+1122334455',
    role: 'admin',
  },
];

async function seedAuthUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    console.log('Cleared existing test users');

    // Create new test users
    for (const userData of testUsers) {
      const user = await User.create(userData);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log('\n✅ Auth users seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Teacher: teacher@school.com / password123');
    console.log('Parent:  parent@school.com / password123');
    console.log('Admin:   admin@school.com / password123');
    
  } catch (error) {
    console.error('Error seeding auth users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedAuthUsers();
