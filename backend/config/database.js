const mongoose = require('mongoose');

// ─── Connection Options ───────────────────────────────────────────────────────

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 8000,   // fail fast if Atlas unreachable
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
};

// ─── Event Listeners ──────────────────────────────────────────────────────────

mongoose.connection.on('connected', () =>
  console.log('✅ MongoDB Atlas connected')
);

mongoose.connection.on('error', (err) =>
  console.error('❌ MongoDB connection error:', err.message)
);

mongoose.connection.on('disconnected', () =>
  console.warn('⚠️  MongoDB disconnected – retrying…')
);

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed (SIGINT)');
  process.exit(0);
});

// ─── Connect ──────────────────────────────────────────────────────────────────

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);

    const { host, port, name } = conn.connection;
    console.log(`   Host : ${host}`);
    console.log(`   Port : ${port}`);
    console.log(`   DB   : ${name || '(default)'}`);
    console.log(`   State: ${mongoose.STATES[conn.connection.readyState]}`);

    return conn;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:');
    console.error('  ', error.message);

    if (error.message.includes('IP')) {
      console.error('\n  💡 Fix: Whitelist your IP in Atlas → Network Access → Add IP Address');
    }
    if (error.message.includes('Authentication')) {
      console.error('\n  💡 Fix: Check your Atlas username/password in MONGODB_URI');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
