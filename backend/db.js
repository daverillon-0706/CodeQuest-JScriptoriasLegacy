//installed npm mmysql2

import mysql from 'mysql2/promise';

//The function to connect to the database
const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',        
  password: '', //C0deQuest-2025
  database: 'codequest'
});

export default db;
