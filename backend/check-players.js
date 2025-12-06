// temp script: check-players.js
import db from './db.js';

async function checkPlayers() {
  const [rows] = await db.query('SELECT * FROM players;');
  console.log('Players table:', rows);
}

checkPlayers();
