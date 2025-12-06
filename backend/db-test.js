// db-test.js
import db from "./db.js";

async function testDB() {
  try {
    const [databases] = await db.query('SHOW DATABASES;');
    console.log('Databases:', databases);

    const [tables] = await db.query('SHOW TABLES;');
    console.log('Tables in codequest:', tables);

    process.exit(0); // stop Node after test
  } catch (err) {
    console.error('DB error:', err);
    process.exit(1);
  }
}

testDB();
