import mysql from 'mysql2/promise';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Parse .env if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...vals] = trimmed.split('=');
      if (key && process.env[key.trim()] === undefined) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}

loadEnv();

const email = (process.argv[2] || 'admin@indiamocktests.com').trim().toLowerCase();
const password = process.argv[3] || 'Admin@123456';
const displayName = process.argv[4] || 'System Administrator';

if (!email || password.length < 8 || !displayName) {
  console.error('Usage: node scripts/create-admin.mjs [email] [password] [displayName]');
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

function hashPassword(pwd, salt) {
  return crypto.scryptSync(pwd, salt, 64).toString('hex');
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mock_test_platform',
  });

  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const storedHash = `${salt}:${passwordHash}`;

    // Check if user already exists
    const [existing] = await pool.query('SELECT id, email, role FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await pool.query(
        'UPDATE users SET password_hash = ?, display_name = ?, role = "admin", status = "active" WHERE email = ?',
        [storedHash, displayName, email]
      );
      console.log(`✅ Existing user '${email}' updated to admin role.`);
    } else {
      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, display_name, role, status) VALUES (?, ?, ?, "admin", "active")',
        [email, storedHash, displayName]
      );
      console.log(`✅ Admin user created successfully (ID: ${result.insertId}).`);
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email:        ${email}`);
    console.log(`Password:     ${password}`);
    console.log(`Display Name: ${displayName}`);
    console.log(`Role:         admin`);
    console.log('-------------------------\n');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
