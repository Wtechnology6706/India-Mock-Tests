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

  // 1. Core schema tables
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('🗄️ Checking database/schema.sql core tables...');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    schemaSql = schemaSql
      .replace(/CREATE DATABASE[^\n;]+;/gi, '')
      .replace(/USE [^\n;]+;/gi, '');
    try {
      await connection.query(schemaSql);
      console.log('  + Core tables verified.');
    } catch (err) {
      console.warn('  ! Note on core schema execution:', err.message);
    }
  }

  // 2. Ensure coupons table & all columns
  console.log('🔄 Checking coupons table & columns...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(64) PRIMARY KEY,
      code VARCHAR(64) NOT NULL UNIQUE,
      discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
      discount_value INT NOT NULL DEFAULT 10,
      min_order_minor INT NOT NULL DEFAULT 0,
      max_discount_minor INT NOT NULL DEFAULT 0,
      description VARCHAR(255) DEFAULT '',
      active TINYINT(1) NOT NULL DEFAULT 1,
      starts_at DATETIME NULL,
      expires_at DATETIME NULL,
      usage_limit INT NOT NULL DEFAULT 0,
      usage_count INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_coupons_code (code),
      INDEX idx_coupons_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const couponAlters = [
    "ALTER TABLE coupons MODIFY COLUMN id VARCHAR(64) NOT NULL",
    "ALTER TABLE coupons MODIFY COLUMN discount_value INT NOT NULL DEFAULT 10",
    "ALTER TABLE coupons MODIFY COLUMN discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage'",
    "ALTER TABLE coupons ADD COLUMN min_order_minor INT NOT NULL DEFAULT 0 AFTER discount_value",
    "ALTER TABLE coupons ADD COLUMN max_discount_minor INT NOT NULL DEFAULT 0 AFTER min_order_minor",
    "ALTER TABLE coupons ADD COLUMN description VARCHAR(255) DEFAULT '' AFTER max_discount_minor",
    "ALTER TABLE coupons ADD COLUMN expires_at DATETIME NULL AFTER starts_at",
    "ALTER TABLE coupons ADD COLUMN usage_limit INT NOT NULL DEFAULT 0 AFTER expires_at",
    "ALTER TABLE coupons ADD COLUMN usage_count INT NOT NULL DEFAULT 0 AFTER usage_limit",
    "ALTER TABLE coupons ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE coupons ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  ];

  for (const sql of couponAlters) {
    try {
      await connection.query(sql);
    } catch {
      // Column or modification already applied
    }
  }

  // Seed default coupons
  await connection.query(`
    INSERT IGNORE INTO coupons (id, code, discount_type, discount_value, min_order_minor, max_discount_minor, description, active, usage_limit, usage_count, created_at)
    VALUES
    ('cpn-welcome20', 'WELCOME20', 'percentage', 20, 29900, 20000, 'Get 20% instant discount on all VIP Exam passes!', 1, 1000, 0, NOW()),
    ('cpn-festive50', 'FESTIVE50', 'fixed', 50, 49900, 5000, 'Flat ₹50 OFF on orders above ₹499', 1, 500, 0, NOW()),
    ('cpn-bpsc100', 'BPSC100', 'fixed', 100, 40000, 10000, 'Special ₹100 instant waiver on BPSC and State Exam test bundles', 1, 200, 0, NOW())
  `);
  console.log('  + coupons table verified and seeded.');

  // 3. Ensure commerce_plans
  console.log('🔄 Checking commerce_plans table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS commerce_plans (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      description TEXT,
      amount_minor INT NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      validity_days INT NOT NULL DEFAULT 90,
      features TEXT,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const planAlters = [
    "ALTER TABLE commerce_plans MODIFY COLUMN id VARCHAR(64) NOT NULL",
    "ALTER TABLE commerce_plans ADD COLUMN features TEXT NULL AFTER validity_days",
    "ALTER TABLE commerce_plans ADD COLUMN validity_days INT NOT NULL DEFAULT 90",
    "ALTER TABLE commerce_plans ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  ];
  for (const sql of planAlters) {
    try {
      await connection.query(sql);
    } catch {
      // ignore
    }
  }

  const sprintFeatures = JSON.stringify([
    "Full access to 1 targeted exam category (e.g. BPSC TRE 4.0)",
    "30+ Full Length Mock Tests + Chapter-wise drills",
    "Detailed AI performance analytics & rank prediction",
    "Bilingual Hindi & English test modes",
    "Unlimited test re-attempts & revision bookmarking",
  ]);
  const ultimateFeatures = JSON.stringify([
    "All-Access Pass to EVERY Exam Category & PYQs",
    "500+ Complete Mock Tests, Subject Quizzes & PYQs",
    "Full PYQ PDF Hub with high-speed download & full-screen reader",
    "Priority Doubt Solving & Video Solutions access",
    "VIP Candidate Badge & 180-day extended validity",
  ]);

  await connection.query(`
    INSERT IGNORE INTO commerce_plans (id, slug, name, description, amount_minor, currency, validity_days, features, active, created_at)
    VALUES
    ('1', 'sprint', 'Single Exam Sprint Pass', 'Targeted practice pass for 1 focused examination series.', 49900, 'INR', 90, ?, 1, NOW()),
    ('2', 'ultimate', 'All-Exam Ultimate VIP Pass', 'All-inclusive pass for every state PSC, TET, and national exam.', 99900, 'INR', 180, ?, 1, NOW())
  `, [sprintFeatures, ultimateFeatures]);
  console.log('  + commerce_plans table verified and seeded.');

  // 4. Ensure orders
  console.log('🔄 Checking orders table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      plan_id VARCHAR(64) NOT NULL,
      coupon_id VARCHAR(64) NULL,
      amount_minor INT UNSIGNED NOT NULL,
      currency CHAR(3) NOT NULL DEFAULT 'INR',
      status ENUM('created', 'pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'created',
      provider VARCHAR(40) NOT NULL DEFAULT 'gateway',
      provider_order_id VARCHAR(180) NULL,
      provider_payment_id VARCHAR(180) NULL,
      tax_details JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME NULL,
      INDEX idx_orders_user_status (user_id, status, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. Ensure wallets and transactions
  console.log('🔄 Checking wallet tables...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL UNIQUE,
      balance_minor BIGINT NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_wallets_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      type ENUM('credit', 'debit') NOT NULL,
      amount_minor INT NOT NULL,
      balance_after_minor INT NOT NULL,
      description VARCHAR(255) NOT NULL,
      reference_type ENUM('topup', 'purchase', 'refund', 'admin_adjustment') NOT NULL DEFAULT 'topup',
      reference_id VARCHAR(128) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_wt_user (user_id),
      INDEX idx_wt_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. Ensure pyq_documents
  console.log('🔄 Checking pyq_documents table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS pyq_documents (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(191) NOT NULL UNIQUE,
      exam_slug VARCHAR(100) NOT NULL,
      exam_name VARCHAR(180) NOT NULL,
      track_slug VARCHAR(100) NOT NULL DEFAULT 'all',
      subject_name VARCHAR(180) NOT NULL,
      year INT UNSIGNED NOT NULL,
      paper_name VARCHAR(200) NOT NULL,
      title VARCHAR(250) NOT NULL,
      description TEXT NULL,
      file_url VARCHAR(1000) NOT NULL,
      file_size VARCHAR(50) NULL,
      page_count INT UNSIGNED NULL,
      download_count INT UNSIGNED NOT NULL DEFAULT 0,
      access_tier ENUM('free', 'premium') NOT NULL DEFAULT 'free',
      status ENUM('published', 'draft') NOT NULL DEFAULT 'published',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_pyq_exam_year (exam_slug, year, status),
      INDEX idx_pyq_subject (subject_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. Ensure site_configurations
  console.log('🔄 Checking site_configurations table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS site_configurations (
      config_key VARCHAR(100) PRIMARY KEY,
      config_value LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. Incremental column alters for exams, tests, users
  console.log('🔄 Checking incremental column additions for exams, tests, and users...');
  const miscAlters = [
    "ALTER TABLE exams ADD COLUMN image_url VARCHAR(500) NULL AFTER visual_symbol",
    "ALTER TABLE exams ADD COLUMN badge VARCHAR(40) NULL",
    "ALTER TABLE exams ADD COLUMN visual_tone VARCHAR(30) NOT NULL DEFAULT 'saffron'",
    "ALTER TABLE exams ADD COLUMN visual_symbol VARCHAR(8) NOT NULL DEFAULT '✦'",
    "ALTER TABLE tests ADD COLUMN banner_image_url VARCHAR(500) NULL AFTER description",
    "ALTER TABLE tests MODIFY COLUMN test_type VARCHAR(50) NOT NULL DEFAULT 'full'",
    "ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free'",
    "ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP NULL",
    "ALTER TABLE users ADD COLUMN target_exam_slug VARCHAR(100) NULL",
    "ALTER TABLE users ADD COLUMN target_exam_name VARCHAR(150) NULL",
    "ALTER TABLE users ADD COLUMN wallet_balance_minor BIGINT DEFAULT 0",
  ];

  for (const sql of miscAlters) {
    try {
      await connection.query(sql);
    } catch {
      // Ignore if already present
    }
  }

  await connection.end();
  console.log('🎉 Database migration completed successfully!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
