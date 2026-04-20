const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'masterlink.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Auto-run schema on first start
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// add new columns if they don't exist yet (safe to run multiple times)
const addCol = (table, col, def) => {
  const exists = db.pragma(`table_info(${table})`).some(c => c.name === col);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
};

addCol('users', 'balance',        'REAL NOT NULL DEFAULT 0');
addCol('users', 'frozen_balance', 'REAL NOT NULL DEFAULT 0');
addCol('users', 'payment_method', 'TEXT');

// migrate job_requests: add 'done' status and payment columns
// SQLite can't alter CHECK constraints so we have to recreate the table
// SQLite can't ALTER CHECK constraints — must recreate the table when missing
const jrSql = db.prepare(
  "SELECT sql FROM sqlite_master WHERE type='table' AND name='job_requests'"
).get();

if (jrSql && !jrSql.sql.includes("'done'")) {
  db.pragma('foreign_keys = OFF');
  db.exec(`
    CREATE TABLE job_requests_v2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      tradesman_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      address TEXT,
      city TEXT,
      urgency TEXT DEFAULT 'flexible' CHECK(urgency IN ('emergency', 'flexible')),
      offered_fee REAL,
      hours_worked REAL,
      final_fee REAL,
      scheduled_at DATETIME,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined','done','completed')),
      photos_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tradesman_id) REFERENCES users(id)
    );
    INSERT INTO job_requests_v2
      SELECT id, customer_id, tradesman_id, title, description, address, city, urgency,
             offered_fee, NULL, NULL, scheduled_at, status, photos_json, created_at
      FROM job_requests;
    DROP TABLE job_requests;
    ALTER TABLE job_requests_v2 RENAME TO job_requests;
  `);
  db.pragma('foreign_keys = ON');
}

// Ensure new columns exist on already-migrated tables
addCol('job_requests', 'hours_worked', 'REAL');
addCol('job_requests', 'final_fee',    'REAL');

module.exports = db;
