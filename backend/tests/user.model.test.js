/**
 * User Model – Integration Tests
 *
 * Run:  node tests/user.model.test.js
 *
 * Requires a live MongoDB connection (reads MONGODB_URI from .env).
 * The script creates a temporary test user and deletes it afterwards.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

async function assertThrows(fn, label) {
  try {
    await fn();
    console.error(`  ❌ ${label} — expected error but none was thrown`);
    failed++;
  } catch {
    console.log(`  ✅ ${label}`);
    passed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n🧪  User Model Tests\n');

  // ── 1. Model exports correctly ──────────────────────────────────────────────
  console.log('1. Model export');
  assert(User !== undefined, 'User model is exported');
  assert(typeof User === 'function', 'User is a Mongoose model constructor');
  assert(User.modelName === 'User', 'modelName is "User"');

  // ── 2. Create a valid user instance ────────────────────────────────────────
  console.log('\n2. Valid user creation');

  const userData = {
    name: 'Aman Koli',
    email: `test.${Date.now()}@dealvault.test`,
    password: 'Secure@1234',
    role: 'buyer',
  };

  const user = await User.create(userData);

  assert(user._id !== undefined, 'User has an _id');
  assert(user.name === userData.name, 'name is saved correctly');
  assert(user.email === userData.email.toLowerCase(), 'email is lowercased');
  assert(user.role === 'buyer', 'default role is buyer');
  assert(user.accountStatus === 'pending_verification', 'default accountStatus is pending_verification');
  assert(user.isEmailVerified === false, 'isEmailVerified defaults to false');
  assert(user.password !== userData.password, 'password is hashed (not stored in plain text)');
  assert(user.createdAt instanceof Date, 'timestamps: createdAt exists');
  assert(user.updatedAt instanceof Date, 'timestamps: updatedAt exists');

  // ── 3. Virtuals ─────────────────────────────────────────────────────────────
  console.log('\n3. Virtuals');
  assert(user.displayName === userData.name, 'displayName virtual returns name');
  assert(user.isKycVerified === false, 'isKycVerified is false by default');

  // ── 4. comparePassword method ───────────────────────────────────────────────
  console.log('\n4. Instance methods');

  // Must re-fetch with +password since select:false
  const userWithPw = await User.findByEmailWithPassword(userData.email);
  const correctMatch = await userWithPw.comparePassword('Secure@1234');
  const wrongMatch = await userWithPw.comparePassword('WrongPassword');

  assert(correctMatch === true, 'comparePassword returns true for correct password');
  assert(wrongMatch === false, 'comparePassword returns false for wrong password');

  const safeObj = user.toSafeObject();
  assert(safeObj.password === undefined, 'toSafeObject removes password field');
  assert(safeObj.emailVerificationToken === undefined, 'toSafeObject removes emailVerificationToken');

  // ── 5. Static methods ───────────────────────────────────────────────────────
  console.log('\n5. Static methods');
  const found = await User.findByEmailWithPassword(userData.email);
  assert(found !== null, 'findByEmailWithPassword returns the user');
  assert(found.password !== undefined, 'findByEmailWithPassword includes password field');

  // ── 6. Validation ────────────────────────────────────────────────────────────
  console.log('\n6. Validation');

  await assertThrows(
    () => User.create({ email: `v.${Date.now()}@dealvault.test`, password: 'pass1234' }),
    'Fails without required name'
  );

  await assertThrows(
    () => User.create({ name: 'No Email', password: 'pass1234' }),
    'Fails without required email'
  );

  await assertThrows(
    () => User.create({ name: 'Bad Email', email: 'not-an-email', password: 'pass1234' }),
    'Fails with invalid email format'
  );

  await assertThrows(
    () => User.create({ name: 'Short Pass', email: `sp.${Date.now()}@dealvault.test`, password: '123' }),
    'Fails with password shorter than 8 characters'
  );

  await assertThrows(
    () => User.create({ name: 'Bad Role', email: `br.${Date.now()}@dealvault.test`, password: 'pass1234', role: 'ghost' }),
    'Fails with invalid role value'
  );

  await assertThrows(
    () => User.create({ ...userData }),   // duplicate email
    'Fails with duplicate email (unique index)'
  );

  // ── 7. Indexes ───────────────────────────────────────────────────────────────
  console.log('\n7. Indexes');
  const indexes = await User.collection.getIndexes();
  const indexKeys = Object.values(indexes).map((idx) => Object.keys(idx.key).join(','));

  assert(indexKeys.includes('email'), 'Index exists on email');
  assert(indexKeys.includes('role'), 'Index exists on role');
  assert(indexKeys.includes('accountStatus'), 'Index exists on accountStatus');

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  await User.deleteOne({ _id: user._id });
  console.log('\n🧹  Cleaned up test user');
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗  Connected to MongoDB');

    await runTests();

    console.log(`\n📊  Results: ${passed} passed, ${failed} failed\n`);
  } catch (err) {
    console.error('\n💥  Unexpected error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
})();
