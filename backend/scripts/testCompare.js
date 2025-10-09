import bcrypt from 'bcryptjs';

const hash = '$2a$10$7KOGyK31vjLSofRKpczYFeutqA7gJjwoNwlSLZcg4wNpuTElzJJcq';
const passwords = ['demo123','Demo123','demo1234','demo123'];
for (const p of passwords) {
  // eslint-disable-next-line no-await-in-loop
  const ok = await bcrypt.compare(p, hash);
  console.log(p,'=>',ok);
}
