const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { isEmail, isPositiveNum, isInRange, round2 } = require('../middleware/validate');

// These must match the options in ProfilePage.jsx PaymentSection
const ALLOWED_PAYMENT_TYPES = ['Visa', 'Mastercard', 'PayMe', 'Click', 'Bank Transfer', 'Cash'];
const MAX_TRANSFER_AMOUNT = 1_000_000;
const DATA_URL_RE = /^data:image\/(jpeg|png|webp|gif);base64,/;
const HTTP_URL_RE = /^https?:\/\/.{4}/;

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const data = { ...user };
  delete data.password_hash;
  return data;
}

exports.register = (req, res, next) => {
  try {
    const { name, email, password, role, trade, hourly_rate, city } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required' });
    }
    const trimmedName = String(name).trim();
    if (trimmedName.length < 1 || trimmedName.length > 100) {
      return res.status(400).json({ error: 'name must be 1–100 characters' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!['customer', 'tradesman'].includes(role)) {
      return res.status(400).json({ error: 'role must be customer or tradesman' });
    }
    if (role === 'tradesman') {
      if (!trade || !hourly_rate || !city) {
        return res.status(400).json({ error: 'tradesmen must provide trade, hourly_rate, and city' });
      }
      if (!isPositiveNum(hourly_rate) || parseFloat(hourly_rate) > 99_999) {
        return res.status(400).json({ error: 'hourly_rate must be a positive number up to 99 999' });
      }
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(trimmedName, normalizedEmail, password_hash, role);

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
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
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
    const { name, bio, city, trade, hourly_rate, call_out_fee, is_available, years_experience, avatar_url } = req.body;

    if (avatar_url !== undefined && avatar_url !== null && avatar_url !== '') {
      const isDataUrl = DATA_URL_RE.test(avatar_url);
      const isHttpUrl = HTTP_URL_RE.test(avatar_url);
      if (!isDataUrl && !isHttpUrl) {
        return res.status(400).json({ error: 'avatar_url must be an http(s) URL or a base64 image data URL' });
      }
      if (isDataUrl && avatar_url.length > 3_000_000) {
        return res.status(400).json({ error: 'Avatar image must be under 2 MB' });
      }
      db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatar_url, userId);
    } else if (avatar_url === '') {
      db.prepare('UPDATE users SET avatar_url = NULL WHERE id = ?').run(userId);
    }

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (trimmedName.length < 1 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'name must be 1–100 characters' });
      }
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(trimmedName, userId);
    }

    if (role === 'tradesman') {
      if (hourly_rate !== undefined && (!isPositiveNum(hourly_rate) || parseFloat(hourly_rate) > 99_999)) {
        return res.status(400).json({ error: 'hourly_rate must be a positive number up to 99 999' });
      }
      if (call_out_fee !== undefined && parseFloat(call_out_fee) < 0) {
        return res.status(400).json({ error: 'call_out_fee cannot be negative' });
      }
      if (years_experience !== undefined) {
        const ye = parseInt(years_experience, 10);
        if (!Number.isInteger(ye) || ye < 0 || ye > 60) {
          return res.status(400).json({ error: 'years_experience must be 0–60' });
        }
      }
      if (bio !== undefined && String(bio).length > 1000) {
        return res.status(400).json({ error: 'bio must be 1 000 characters or fewer' });
      }
      db.prepare(`
        UPDATE tradesman_profiles
        SET bio = ?, city = ?, trade = ?, hourly_rate = ?, call_out_fee = ?, is_available = ?, years_experience = ?
        WHERE user_id = ?
      `).run(
        bio || null, city, trade,
        parseFloat(hourly_rate) || 0,
        parseFloat(call_out_fee) || 0,
        is_available ? 1 : 0,
        parseInt(years_experience) || 1,
        userId
      );
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
    if (String(new_password).length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
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
    const amount = round2(parseFloat(req.body.amount));

    if (!isPositiveNum(amount)) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (amount > MAX_TRANSFER_AMOUNT) {
      return res.status(400).json({ error: `Amount cannot exceed ${MAX_TRANSFER_AMOUNT.toLocaleString()} TJS per transaction` });
    }

    db.prepare('UPDATE users SET balance = round(balance + ?, 2) WHERE id = ?').run(amount, userId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.withdraw = (req, res, next) => {
  try {
    const { userId } = req.user;
    const amount = round2(parseFloat(req.body.amount));

    if (!isPositiveNum(amount)) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (amount > MAX_TRANSFER_AMOUNT) {
      return res.status(400).json({ error: `Amount cannot exceed ${MAX_TRANSFER_AMOUNT.toLocaleString()} TJS per transaction` });
    }

    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
    if (round2(user.balance) < amount) {
      return res.status(400).json({ error: `Insufficient balance — available: ${round2(user.balance).toFixed(2)} TJS` });
    }

    db.prepare('UPDATE users SET balance = round(balance - ?, 2) WHERE id = ?').run(amount, userId);
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.json({ user: safeUser(updated) });
  } catch (err) {
    next(err);
  }
};

exports.setPaymentMethod = (req, res, next) => {
  try {
    const { userId } = req.user;
    const { payment_method } = req.body;

    if (payment_method !== null && payment_method !== undefined && payment_method !== '') {
      let parsed;
      try { parsed = JSON.parse(payment_method); } catch {
        return res.status(400).json({ error: 'payment_method must be a JSON string' });
      }
      if (!parsed.type || !ALLOWED_PAYMENT_TYPES.includes(parsed.type)) {
        return res.status(400).json({ error: `payment type must be one of: ${ALLOWED_PAYMENT_TYPES.join(', ')}` });
      }
      if (parsed.identifier && String(parsed.identifier).length > 100) {
        return res.status(400).json({ error: 'Payment identifier must be 100 characters or fewer' });
      }
    }

    db.prepare('UPDATE users SET payment_method = ? WHERE id = ?')
      .run(payment_method || null, userId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};
