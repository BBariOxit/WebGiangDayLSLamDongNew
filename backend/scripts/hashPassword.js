import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'demo123';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
