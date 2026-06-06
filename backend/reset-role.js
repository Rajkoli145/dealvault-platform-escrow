require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const resetRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by GitHub username and reset role to 'buyer'
    const user = await User.findOne({ githubUsername: 'amankoli09' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('Current user:', user.name, 'Role:', user.role);
    
    user.role = 'buyer';
    await user.save();
    
    console.log('✅ Role reset to "buyer" successfully');
    console.log('Now you can sign in again to see the onboarding flow');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetRole();
