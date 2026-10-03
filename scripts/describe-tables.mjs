import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mock_test_platform'
  });
  
  for (const table of ['orders', 'commerce_plans', 'test_attempts', 'users']) {
    console.log(`\n--- Table: ${table} ---`);
    const [cols] = await connection.query(`DESCRIBE ${table}`);
    console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));
  }
  
  await connection.end();
}

main().catch(console.error);
