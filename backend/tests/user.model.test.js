const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  it('should export the User model correctly', () => {
    expect(User).toBeDefined();
    expect(typeof User).toBe('function');
    expect(User.modelName).toBe('User');
  });

  it('should create a valid user instance', async () => {
    const userData = {
      name: 'Aman Koli',
      email: 'test.user@dealvault.test',
      password: 'Secure@1234',
      role: 'buyer',
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email.toLowerCase());
    expect(user.role).toBe('buyer');
    expect(user.accountStatus).toBe('pending_verification');
    expect(user.isEmailVerified).toBe(false);
    expect(user.password).not.toBe(userData.password); // password should be hashed
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should evaluate virtuals correctly', async () => {
    const user = new User({
      name: 'Aman Koli',
      email: 'aman@test.com',
    });

    expect(user.displayName).toBe('Aman Koli');
    expect(user.isKycVerified).toBe(false);
  });

  it('should properly compare passwords', async () => {
    const user = await User.create({
      name: 'Password Test',
      email: 'pw@test.com',
      password: 'Secure@1234',
    });

    // Re-fetch with password selected
    const userWithPw = await User.findByEmailWithPassword('pw@test.com');
    
    expect(await userWithPw.comparePassword('Secure@1234')).toBe(true);
    expect(await userWithPw.comparePassword('WrongPassword')).toBe(false);
  });

  it('should remove sensitive fields in toSafeObject()', async () => {
    const user = await User.create({
      name: 'Safe Test',
      email: 'safe@test.com',
      password: 'Secure@1234',
    });

    const safeObj = user.toSafeObject();
    expect(safeObj.password).toBeUndefined();
    expect(safeObj.emailVerificationToken).toBeUndefined();
  });

  it('should enforce validations (missing required fields)', async () => {
    await expect(User.create({ email: 'no.name@test.com', password: 'pass' })).rejects.toThrow();
    await expect(User.create({ name: 'No Email', password: 'pass' })).rejects.toThrow();
  });

  it('should enforce unique email index', async () => {
    await User.create({ name: 'First', email: 'duplicate@test.com', password: 'Secure@1234' });
    await expect(
      User.create({ name: 'Second', email: 'duplicate@test.com', password: 'Secure@1234' })
    ).rejects.toThrow();
  });

  it('should evaluate changedPasswordAfter correctly', () => {
    const user = new User({ passwordChangedAt: new Date(Date.now() - 5000) });
    expect(user.changedPasswordAfter(Math.floor(Date.now() / 1000) - 10)).toBe(true);
    expect(user.changedPasswordAfter(Math.floor(Date.now() / 1000) + 10)).toBe(false);
    const userNoPwChange = new User({});
    expect(userNoPwChange.changedPasswordAfter(Math.floor(Date.now() / 1000))).toBe(false);
  });

  it('should find user by githubId', async () => {
    await User.create({ name: 'Github User', email: 'gh@test.com', githubId: '12345', password: 'Secure@1234' });
    const user = await User.findByGithubId('12345');
    expect(user).toBeDefined();
    expect(user.name).toBe('Github User');
  });

  it('should return email as displayName if name is missing', () => {
    const user = new User({ email: 'noname@test.com' });
    expect(user.displayName).toBe('noname@test.com');
  });
});
