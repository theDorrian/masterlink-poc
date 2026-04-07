const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

exports.register = (req, res, next) => {
  try {
    const { name, email, password, role, trade, hourly_rate, city } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required' });
    }
    if (!['customer', 'tradesman'].includes(role)) {
      return res.status(400).json({ error: 'role must be customer or tradesman' });
    }
    if (role === 'tradesman' && (!trade || !hourly_rate || !city)) {
      return res.status(400).json({ error: 'tradesmen must provide trade, hourly_rate, and city' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, password_hash, role);

    const userId = result.lastInsertRowid;

    if (role === 'tradesman') {
      db.prepare(
        'INSERT INTO tradesman_profiles (user_id, trade, hourly_rate, city) VALUES (?, ?, ?, ?)'
      ).run(userId, trade, parseFloat(hourly_rate), city);
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const token = signToken(user);

    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res, next) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let profile = null;
    if (user.role === 'tradesman') {
      profile = db.prepare('SELECT * FROM tradesman_profiles WHERE user_id = ?').get(user.id);
    }

    res.json({ user: safeUser(user), profile });
  } catch (err) {
    next(err);
  }
};
