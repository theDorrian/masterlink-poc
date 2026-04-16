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

// Safe column migrations — add new columns without dropping existing data
const addCol = (table, col, def) => {
  const exists = db.pragma(`table_info(${table})`).some(c => c.name === col);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
};

addCol('users', 'balance',         'REAL NOT NULL DEFAULT 0');
addCol('users', 'frozen_balance',  'REAL NOT NULL DEFAULT 0');
addCol('users', 'payment_method',  'TEXT');

module.exports = db;
