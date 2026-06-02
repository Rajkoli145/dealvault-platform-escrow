const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./server');

(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app).post('/api/auth/register').send({
    name: 'Buyer User',
    email: 'buyer@test.com',
    password: 'Secure@1234',
    role: 'buyer',
  });

  console.log('STATUS:', res.statusCode);
  console.log('BODY:', res.body);

  await mongoose.disconnect();
  await mongoServer.stop();
})();
