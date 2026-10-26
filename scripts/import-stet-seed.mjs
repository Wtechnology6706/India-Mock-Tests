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

async function run() {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mocktest_db',
    multipleStatements: true,
  };

  console.log(`\n======================================================`);
  console.log(`  IMPORTING BIHAR STET 2026 SEED`);
  console.log(`======================================================`);
  console.log(`📡 Connecting to '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port} as '${dbConfig.user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }

  const seedFilePath = path.resolve(process.cwd(), 'database', 'bihar_stet_2026_syllabus_seed.sql');
  if (!fs.existsSync(seedFilePath)) {
    console.error(`❌ Seed file not found at: ${seedFilePath}`);
    await connection.end();
    process.exit(1);
  }

  console.log(`📄 Reading ${seedFilePath}...`);
  let sql = fs.readFileSync(seedFilePath, 'utf8');

  // Dynamically target the configured database name
  sql = sql.replace(/USE\s+[`"']?[a-zA-Z0-9_]+[`"']?\s*;/gi, `USE \`${dbConfig.database}\`;`);

  console.log('⚡ Executing SQL script...');
  const startTime = Date.now();
  try {
    await connection.query(sql);
    console.log(`✅ Import finished in ${(Date.now() - startTime) / 1000}s.`);
  } catch (err) {
    console.error('❌ Error executing SQL script:', err.message);
    await connection.end();
    process.exit(1);
  }

  // Check if user passed --publish
  const shouldPublish = process.argv.includes('--publish');
  if (shouldPublish) {
    console.log('\n📢 Publishing Bihar STET exam, test series, and tests as requested (--publish)...');
    await connection.query(`UPDATE exams SET status = 'published' WHERE slug = 'bihar-stet'`);
    await connection.query(`UPDATE test_series ts JOIN exams e ON ts.exam_id = e.id SET ts.status = 'published' WHERE e.slug = 'bihar-stet'`);
    await connection.query(`UPDATE tests t JOIN test_series ts ON t.test_series_id = ts.id JOIN exams e ON ts.exam_id = e.id SET t.status = 'published' WHERE e.slug = 'bihar-stet'`);
    console.log('✅ Bihar STET 2026 is now LIVE & PUBLISHED on the learner frontend!');
  }

  // Verification checks
  console.log('\n🔍 Verifying Database Status:');
  try {
    // 1. Check Bihar STET Exam
    const [stetExam] = await connection.query(
      `SELECT id, name, slug, status FROM exams WHERE slug = 'bihar-stet'`
    );
    console.log('\n[Exam Entry]');
    console.table(stetExam);

    // 2. Check STET Mock Tests count, exam_id and statuses
    const [stetSummary] = await connection.query(
      `SELECT t.status, COUNT(*) AS count, COUNT(t.exam_id) AS with_exam_id, COUNT(t.track_slug) AS with_track_slug
       FROM tests t
       JOIN test_series ts ON t.test_series_id = ts.id
       JOIN exams e ON ts.exam_id = e.id
       WHERE e.slug = 'bihar-stet'
       GROUP BY t.status`
    );
    console.log('\n[Bihar STET Mock Tests]');
    console.table(stetSummary);

    // 3. Confirm BPSC TRE 4.0 is untouched and published
    const [bpscSummary] = await connection.query(
      `SELECT e.slug, t.status, COUNT(*) AS count
       FROM tests t
       JOIN test_series ts ON t.test_series_id = ts.id
       JOIN exams e ON ts.exam_id = e.id
       WHERE e.slug = 'bpsc-tre-4'
       GROUP BY e.slug, t.status`
    );
    console.log('\n[BPSC TRE 4.0 Status Check (Unchanged)]');
    console.table(bpscSummary);

    console.log(
      shouldPublish
        ? '\n🎉 SUCCESS: Bihar STET 2026 is LIVE & PUBLISHED!'
        : '\n🎉 SUCCESS: Bihar STET 2026 seed is imported as DRAFT (Unpublished). To publish, pass --publish or publish via Admin Panel.'
    );
  } catch (err) {
    console.warn('⚠️ Verification warning:', err.message);
  } finally {
    await connection.end();
  }
}

run();
