// server.js
// Installed npm packages: express, bcrypt, cors, body-parser, mysql2
import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --------------------------
// DEBUG: Show existing databases & tables
// --------------------------
(async () => {
  try {
    const [rows] = await db.query('SHOW DATABASES;');
    console.log('Databases:', rows);

    const [tables] = await db.query('SHOW TABLES;');
    console.log('Tables in codequest:', tables);
  } catch (err) {
    console.error('Database debug error:', err);
  }
})();

// --------------------------
// REGISTER
// --------------------------
app.post('/register', async (req, res) => {
  const { username, player_password, email } = req.body;

  // Validate input
  if (!username || !player_password || !email) {
    return res.status(400).json({ error: 'Fill all fields' });
  }

  console.log('Register payload:', req.body);

  try {
    // Check if username or email already exists
    const [existing] = await db.query(
      'SELECT * FROM players WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const hashed = await bcrypt.hash(player_password, 10);

    await db.query(
      'INSERT INTO players (username, player_password, email) VALUES (?, ?, ?)',
      [username, hashed, email]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('MySQL error on register:', err);
    res.status(400).json({ error: err.message });
  }
});


// LOGIN
app.post('/login', async (req, res) => {
  const { username, player_password } = req.body;

  if (!username || !player_password) {
    return res.status(400).json({ error: 'Fill all fields' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM players WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(player_password, rows[0].player_password);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    await db.query(
      'UPDATE players SET last_login = NOW() WHERE player_id = ?',
      [rows[0].player_id]
    );

    // 🔹 Return full player stat data
    res.json({
      success: true,
      player: {
        id: rows[0].player_id,
        username: rows[0].username,
        hp: rows[0].hp,
        max_hp: rows[0].max_hp,
        energy: rows[0].energy,
        max_energy: rows[0].max_energy,
        cryptos: rows[0].cryptos
      }
    });

  } catch (err) {
    console.error('MySQL error on login:', err);
    res.status(400).json({ error: err.message });
  }
});

// --------------------------
// SAVE PLAYER STATS
// --------------------------
app.post('/save-stats', async (req, res) => {
  const { player_id, hp, energy, cryptos } = req.body;

  // Validate input
  if (!player_id || hp == null || energy == null || cryptos == null) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await db.query(
      'UPDATE players SET hp = ?, energy = ?, cryptos = ? WHERE player_id = ?',
      [hp, energy, cryptos, player_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('MySQL error on save-stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// START SERVER
// --------------------------
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
