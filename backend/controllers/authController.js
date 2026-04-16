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

exports.updateProfile = (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { name, bio, city, trade, hourly_rate, call_out_fee, is_available, years_experience } = req.body;

    if (name && name.trim()) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), userId);
    }

    if (role === 'tradesman') {
      const cols = [], vals = [];
      if (bio !== undefined)              { cols.push('bio = ?');              vals.push(bio); }
      if (city)                           { cols.push('city = ?');             vals.push(city); }
      if (trade)                          { cols.push('trade = ?');            vals.push(trade); }
      if (hourly_rate !== undefined)      { cols.push('hourly_rate = ?');      vals.push(parseFloat(hourly_rate)); }
      if (call_out_fee !== undefined)     { cols.push('call_out_fee = ?');     vals.push(parseFloat(call_out_fee)); }
      if (is_available !== undefined)     { cols.push('is_available = ?');     vals.push(is_available ? 1 : 0); }
      if (years_experience !== undefined) { cols.push('years_experience = ?'); vals.push(parseInt(years_experience)); }

      if (cols.length > 0) {
        vals.push(userId);
        db.prepare(`UPDATE tradesman_profiles SET ${cols.join(', ')} WHERE user_id = ?`).run(...vals);
      }
    }

    const user    = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const profile = role === 'tradesman'
      ? db.prepare('SELECT * FROM tradesman_profiles WHERE user_id = ?').get(userId)
      : null;

    res.json({ user: safeUser(user), profile });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = (req, res, next) => {
  try {
    const { userId } = req.user;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .run(bcrypt.hashSync(new_password, 10), userId);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.topUp = (req, res, next) => {
  try {
    const { userId } = req.user;
    const amount = parseFloat(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.setPaymentMethod = (req, res, next) => {
  try {
    const { userId } = req.user;
    const { payment_method } = req.body;

    db.prepare('UPDATE users SET payment_method = ? WHERE id = ?')
      .run(payment_method || null, userId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};
