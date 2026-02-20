const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./src/models/User');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords
    const hashedUserPassword = await bcrypt.hash('1234', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedHodPassword = await bcrypt.hash('hod123', 10);

    // Create demo users
    const users = [
      {
        user_id: 'USER_001',
        username: 'rahul',
        password: hashedUserPassword,
        name: 'Rahul Sharma',
        age: 21,
        id_type: 'Student ID',
        id_number: 'CS2021_001',
        additional_attributes: {
          department: 'Computer Science',
          stream: 'Engineering',
          year: 'Third Year',
          semester: '6'
        },
        role: 'user'
      },
      {
        user_id: 'USER_002',
        username: 'priya',
        password: hashedUserPassword,
        name: 'Priya Patel',
        age: 22,
        id_type: 'Employee ID',
        id_number: 'EMP_2024_456',
        additional_attributes: {
          company: 'Tech Corp',
          designation: 'Software Engineer',
          department: 'Engineering'
        },
        role: 'user'
      },
      {
        user_id: 'USER_003',
        username: 'amit',
        password: hashedUserPassword,
        name: 'Amit Kumar',
        age: 28,
        id_type: 'Driver License',
        id_number: 'DL_MH12_2020_789',
        additional_attributes: {
          vehicle_type: 'Car',
          issue_date: '2020-05-15',
          expiry_date: '2030-05-15'
        },
        role: 'user'
      }
    ];

    // Create demo verifiers
    const verifiers = [
      {
        user_id: 'VERIFIER_001',
        username: 'admin',
        password: hashedAdminPassword,
        name: 'Admin Verifier',
        age: 35,
        id_type: 'Admin ID',
        id_number: 'ADMIN_001',
        additional_attributes: {
          organization: 'Central Authority',
          access_level: 'Full'
        },
        role: 'verifier'
      },
      {
        user_id: 'VERIFIER_002',
        username: 'hod',
        password: hashedHodPassword,
        name: 'HOD Verifier',
        age: 45,
        id_type: 'HOD ID',
        id_number: 'HOD_CS_001',
        additional_attributes: {
          department: 'Computer Science',
          organization: 'University',
          access_level: 'Department'
        },
        role: 'verifier'
      }
    ];

    // Insert users
    await User.insertMany([...users, ...verifiers]);
    console.log('✓ Seeded 3 demo users');
    console.log('✓ Seeded 2 demo verifiers');
    console.log('\nDemo Credentials:');
    console.log('Users (password: 1234):');
    console.log('  - rahul (Student)');
    console.log('  - priya (Employee)');
    console.log('  - amit (Driver)');
    console.log('\nVerifiers:');
    console.log('  - admin / admin123');
    console.log('  - hod / hod123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
