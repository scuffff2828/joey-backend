const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payments.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create payments table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      access_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      email TEXT,
      payment_method TEXT DEFAULT 'paypal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add payment_method column if it doesn't exist (for existing databases)
  db.run(`
    ALTER TABLE payments ADD COLUMN payment_method TEXT DEFAULT 'paypal'
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding payment_method column:', err.message);
    }
  });
});

module.exports = db;