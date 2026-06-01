/**
 * MongoDB Atlas – Connection Diagnostic
 *
 * Run:  node scripts/db-check.js
 *
 * Checks:
 *  1. MONGODB_URI present in .env
 *  2. URI format is valid
 *  3. Can connect to Atlas cluster
 *  4. db.admin().ping() succeeds
 *  5. Lists available databases (sanity check)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OK  = (msg) => console.log(`  ✅  ${msg}`);
const ERR = (msg) => console.error(`  ❌  ${msg}`);
const INF = (msg) => console.log(`  ℹ️   ${msg}`);

// ─── Checks ───────────────────────────────────────────────────────────────────

function checkEnv() {
  console.log('\n📋  1. Environment');
  if (!URI) {
    ERR('MONGODB_URI is not set in .env');
    process.exit(1);
  }
  OK('MONGODB_URI is present');

  const masked = URI.replace(/:([^@]+)@/, ':****@');
  INF(`URI: ${masked}`);
}

function checkUriFormat() {
  console.log('\n🔍  2. URI Format');
  if (!URI.startsWith('mongodb+srv://') && !URI.startsWith('mongodb://')) {
    ERR('URI must start with mongodb+srv:// or mongodb://');
    process.exit(1);
  }
  OK('URI format looks valid (mongodb+srv://)');

  try {
    const url = new URL(URI);
    OK(`Host : ${url.hostname}`);
    OK(`User : ${url.username}`);
  } catch {
    ERR('Could not parse URI as a URL');
    process.exit(1);
  }
}

async function checkConnection() {
  console.log('\n🔗  3. Atlas Connection');
  try {
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    });
    const { host, name, readyState } = mongoose.connection;
    OK(`Connected to host: ${host}`);
    OK(`Default database : ${name || '(none specified — will use db in URI or "test")'}`);
    OK(`Ready state      : ${mongoose.STATES[readyState]}`);
  } catch (err) {
    ERR(`Connection failed: ${err.message}`);
    if (err.message.toLowerCase().includes('ip')) {
      console.error('\n  💡 Your IP is not whitelisted in Atlas.');
      console.error('     → Go to: Atlas → Security → Network Access → Add IP Address');
      console.error('     → Add your current IP or 0.0.0.0/0 for dev (not for prod)\n');
    }
    if (err.message.toLowerCase().includes('authentication')) {
      console.error('\n  💡 Authentication failed.');
      console.error('     → Check your Atlas username/password in .env → MONGODB_URI\n');
    }
    process.exit(1);
  }
}

async function checkPing() {
  console.log('\n📡  4. Admin Ping');
  try {
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    if (result?.ok === 1) {
      OK('db.admin().ping() → { ok: 1 }');
    } else {
      ERR(`Ping returned unexpected result: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    ERR(`Ping failed: ${err.message}`);
    process.exit(1);
  }
}

async function checkDatabases() {
  console.log('\n🗄️   5. Databases on Cluster');
  try {
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    databases.forEach(({ name, sizeOnDisk }) => {
      INF(`${name.padEnd(20)} ${(sizeOnDisk / 1024).toFixed(1)} KB`);
    });
    OK(`${databases.length} database(s) listed`);
  } catch (err) {
    // Non-fatal — Atlas free tier may restrict listDatabases
    INF(`Could not list databases (may be restricted on free tier): ${err.message}`);
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

(async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DealVault – MongoDB Atlas Diagnostic');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  checkEnv();
  checkUriFormat();
  await checkConnection();
  await checkPing();
  await checkDatabases();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅  All checks passed — MongoDB is ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
})();
