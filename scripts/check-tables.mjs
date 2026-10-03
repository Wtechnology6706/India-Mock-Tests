import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mock_test_platform'
  });
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tables:', tables);
  await connection.end();
}

main().catch(console.error);
