// Seed script - run with: node scripts/seed.cjs
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tripile-crm';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['super_admin', 'manager', 'agent'], default: 'agent' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seedUsers = [
  { name: 'Admin User', email: 'admin@tripile.com', password: 'Admin@123', role: 'super_admin' },
  { name: 'Sara Manager', email: 'manager@tripile.com', password: 'Manager@123', role: 'manager' },
  { name: 'Ali Agent', email: 'agent1@tripile.com', password: 'Agent@123', role: 'agent' },
  { name: 'Zara Agent', email: 'agent2@tripile.com', password: 'Agent@123', role: 'agent' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  SKIP     ${u.email} (already exists)`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`  CREATED  [${u.role}]  ${u.email}  /  ${u.password}`);
  }

  console.log('\n--- Login Credentials ---');
  seedUsers.forEach((u) => {
    console.log(`  ${u.role.padEnd(12)} | ${u.email.padEnd(25)} | ${u.password}`);
  });

  await mongoose.disconnect();
  console.log('\nDone!');
}

seed().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
