import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';

// Parse .env / .env.production / .env.local files
function loadEnv() {
  const envFiles = ['.env', '.env.local', '.env.production'];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...vals] = trimmed.split('=');
        if (key && vals.length > 0) {
          const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
          if (process.env[key.trim()] === undefined) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
}

loadEnv();

async function migrate() {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mocktest_db',
    multipleStatements: true,
  };

  console.log(`📡 Connecting to MySQL database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port} as user '${dbConfig.user}'...`);
  
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connected successfully.');

  // 1. Check if core tables exist; if not, execute schema.sql
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('🗄️ Executing database/schema.sql initialization...');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // Strip any hardcoded CREATE DATABASE or USE statements to execute on the active connected database
    schemaSql = schemaSql
      .replace(/CREATE DATABASE[^\n;]+;/gi, '')
      .replace(/USE [^\n;]+;/gi, '');
    await connection.query(schemaSql);
    console.log('✅ Schema tables verified/created successfully.');
  }

  // 2. Incremental column and table migrations
  console.log('🔄 Checking incremental schema updates...');

  // Ensure subscription_tier in users
  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free'
    `);
    console.log('  + Added subscription_tier column to users table.');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_COLUMN_NAME') {
      // Ignore if table/column already handled
    }
  }

  // Ensure subscription_expires_at in users
  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN subscription_expires_at TIMESTAMP NULL
    `);
    console.log('  + Added subscription_expires_at column to users table.');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_COLUMN_NAME') {
      // Ignore
    }
  }

  // Ensure target_exam_slug in users
  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN target_exam_slug VARCHAR(100) NULL
    `);
    console.log('  + Added target_exam_slug column to users table.');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_COLUMN_NAME') {
      // Ignore
    }
  }

  // Ensure target_exam_name in users
  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN target_exam_name VARCHAR(150) NULL
    `);
    console.log('  + Added target_exam_name column to users table.');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_COLUMN_NAME') {
      // Ignore
    }
  }

  // Ensure banner_image_url in tests
  try {
    await connection.query(`
      ALTER TABLE tests 
      ADD COLUMN banner_image_url VARCHAR(500) NULL
    `);
    console.log('  + Added banner_image_url column to tests table.');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_COLUMN_NAME') {
      // Ignore
    }
  }

  // Ensure test_type is VARCHAR(50) to prevent ENUM truncation
  try {
    await connection.query(`
      ALTER TABLE tests 
      MODIFY COLUMN test_type VARCHAR(50) NOT NULL DEFAULT 'full'
    `);
    console.log('  + Modified test_type column to VARCHAR(50) in tests table.');
  } catch (err) {
    // Ignore
  }

  // Ensure site_configurations table exists
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_configurations (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  + site_configurations table verified.');
  } catch (err) {
    console.error('Error with site_configurations table:', err.message);
  }

  await connection.end();
  console.log('🎉 Database migration completed successfully!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
