import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mock_test_platform'
  });
  
  const [plans] = await connection.query('SELECT * FROM commerce_plans');
  console.log('Commerce Plans:', plans);
  
  const [orders] = await connection.query('SELECT * FROM orders');
  console.log('Orders:', orders);

  await connection.end();
}

main().catch(console.error);
