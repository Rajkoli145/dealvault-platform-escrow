require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await User.updateMany({}, { role: 'buyer' });
  console.log(`Reset ${result.modifiedCount} users to 'buyer' role!`);
  process.exit(0);
}).catch(console.error);
