// Run with: node scripts/seed.js
// Make sure MONGODB_URI is set in your environment

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tripile-crm';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['super_admin', 'manager', 'agent'], default: 'agent' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedUsers = [
  { name: 'Admin User', email: 'admin@tripile.com', password: 'Admin@123', role: 'super_admin' },
  { name: 'Sara Manager', email: 'manager@tripile.com', password: 'Manager@123', role: 'manager' },
  { name: 'Ali Agent', email: 'agent1@tripile.com', password: 'Agent@123', role: 'agent' },
  { name: 'Zara Agent', email: 'agent2@tripile.com', password: 'Agent@123', role: 'agent' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  SKIP  ${u.email} (already exists)`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`  CREATED  ${u.role.padEnd(12)} ${u.email}  /  ${u.password}`);
  }

  console.log('\nSeed complete!');
  console.log('\nLogin credentials:');
  seedUsers.forEach((u) => console.log(`  ${u.role.padEnd(12)} ${u.email} / ${u.password}`));

  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
