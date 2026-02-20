const bcrypt = require('bcrypt');

// Generate bcrypt hashes for demo passwords
const passwords = {
  students: '1234',
  admin: 'admin123',
  hod: 'hod123'
};

const generateHashes = async () => {
  console.log('Generating bcrypt hashes...\n');
  
  const studentHash = await bcrypt.hash(passwords.students, 10);
  console.log('Students password (1234):');
  console.log(studentHash);
  console.log();
  
  const adminHash = await bcrypt.hash(passwords.admin, 10);
  console.log('Admin password (admin123):');
  console.log(adminHash);
  console.log();
  
  const hodHash = await bcrypt.hash(passwords.hod, 10);
  console.log('HOD password (hod123):');
  console.log(hodHash);
  console.log();
  
  console.log('Update these hashes in src/data/students.json');
};

generateHashes();
