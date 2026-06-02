import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import User from '../models/User.js';
import dbConnect from '../lib/db.js';
import { hash } from 'bcryptjs';

console.log('Testing User model import and bcryptjs functions:');
console.log('Type of hash:', typeof hash);

async function test() {
  await dbConnect();
  console.log('Connected to MongoDB');
  const testPassword = 'testPassword123';
  const hashed = await hash(testPassword, 10);
  console.log('Hashed test password:', hashed);
  
  // Clean up mongoose connections
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

test().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
