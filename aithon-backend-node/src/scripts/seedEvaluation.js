const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const connectDB = require('../config/database');
const config = require('../config/config');

// Connect to DB
connectDB();

const seedEvaluationData = async () => {
    try {
        console.log('Starting seed...');

        // 1. Create Teacher
        let teacher = await User.findOne({ email: 'teacher@aithon.com' });
        if (!teacher) {
            teacher = await User.create({
                name: 'Jane Teacher',
                email: 'teacher@aithon.com',
                password: 'password123',
                role: 'teacher',
                phone: '+1234567890'
            });
            console.log('Created teacher');
        } else {
            console.log('Teacher exists');
        }

        // 2. Create Class
        let classA = await Class.findOne({ name: 'Grade 1-A' });
        if (!classA) {
            classA = await Class.create({
                name: 'Grade 1-A',
                grade: '1',
                section: 'A',
                teacherId: teacher._id,
                academicYear: '2025-2026',
                scheduledEndTime: '14:00'
            });
            console.log('Created class');
        } else {
             console.log('Class exists');
        }

        // 3. Create Students
        const studentNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah'];
        const students = [];
        
        for (const name of studentNames) {
            let s = await Student.findOne({ name, classId: classA._id });
            if (!s) {
                s = await Student.create({
                    name,
                    classId: classA._id,
                    grade: '1',
                    section: 'A'
                });
                console.log(`Created student ${name}`);
            }
            students.push(s);
        }

        console.log('Seed completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seedEvaluationData();
