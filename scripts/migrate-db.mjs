import mysql from 'mysql2/promise';

async function migrate() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mock_test_platform'
  });

  console.log("Checking and migrating database columns...");

  // Ensure subscription_tier in users
  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free'
    `);
    console.log("Added subscription_tier column to users table.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("subscription_tier column already exists in users.");
    } else {
      console.error("Error adding subscription_tier:", err.message);
    }
  }

  // Ensure subscription_expires_at in users
  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN subscription_expires_at TIMESTAMP NULL
    `);
    console.log("Added subscription_expires_at column to users table.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("subscription_expires_at column already exists in users.");
    } else {
      console.error("Error adding subscription_expires_at:", err.message);
    }
  }

  // Ensure banner_image_url in tests
  try {
    await connection.query(`
      ALTER TABLE tests 
      ADD COLUMN banner_image_url VARCHAR(500) NULL
    `);
    console.log("Added banner_image_url column to tests table.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("banner_image_url column already exists in tests.");
    } else {
      console.error("Error adding banner_image_url:", err.message);
    }
  }

  // Ensure site_configurations has razorpay settings
  try {
    const [configs] = await connection.query("SELECT * FROM site_configurations WHERE config_key LIKE 'razorpay_%'");
    console.log("Existing Razorpay configs:", configs);
  } catch (err) {
    console.log("site_configurations query notice:", err.message);
  }

  await connection.end();
  console.log("Migration finished.");
}

migrate().catch(console.error);
