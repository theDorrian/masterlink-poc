const db = require('../db/database');

exports.create = (req, res, next) => {
  try {
    const { userId, role } = req.user;
    if (role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create job requests' });
    }

    const { tradesman_id, title, description, address, city, urgency, offered_fee, scheduled_at, photos } = req.body;
    if (!tradesman_id || !title) {
      return res.status(400).json({ error: 'tradesman_id and title are required' });
    }

    const tradesman = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'tradesman'").get(tradesman_id);
    if (!tradesman) {
      return res.status(404).json({ error: 'Tradesman not found' });
    }

    const result = db.prepare(`
      INSERT INTO job_requests (customer_id, tradesman_id, title, description, address, city, urgency, offered_fee, scheduled_at, photos_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      tradesman_id,
      title,
      description || null,
      address || null,
      city || null,
      urgency || 'flexible',
      offered_fee ? parseFloat(offered_fee) : null,
      scheduled_at || null,
      JSON.stringify(photos || [])
    );

    const job = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
};

exports.mine = (req, res, next) => {
  try {
    const { userId, role } = req.user;

    let jobs;
    if (role === 'customer') {
      jobs = db.prepare(`
        SELECT jr.*, u.name AS tradesman_name, tp.trade, tp.hourly_rate
        FROM job_requests jr
        JOIN users u ON u.id = jr.tradesman_id
        JOIN tradesman_profiles tp ON tp.user_id = jr.tradesman_id
        WHERE jr.customer_id = ?
        ORDER BY jr.created_at DESC
      `).all(userId);
    } else {
      jobs = db.prepare(`
        SELECT jr.*, u.name AS customer_name, u.avatar_url AS customer_avatar
        FROM job_requests jr
        JOIN users u ON u.id = jr.customer_id
        WHERE jr.tradesman_id = ?
        ORDER BY jr.created_at DESC
      `).all(userId);
    }

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'accepted', 'declined', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const job = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (role === 'tradesman' && job.tradesman_id !== userId) {
      return res.status(403).json({ error: 'Not your job request' });
    }
    if (role === 'customer' && job.customer_id !== userId) {
      return res.status(403).json({ error: 'Not your job request' });
    }

    // ── Balance logic ────────────────────────────────────────────────────────

    // pending → accepted: freeze offered_fee from customer's balance
    if (status === 'accepted' && job.offered_fee) {
      const customer = db.prepare('SELECT balance, frozen_balance FROM users WHERE id = ?').get(job.customer_id);
      if (customer.balance < job.offered_fee) {
        return res.status(400).json({
          error: `Customer has insufficient balance (${customer.balance.toFixed(0)} TJS available, ${job.offered_fee} TJS required)`
        });
      }
      db.prepare('UPDATE users SET balance = balance - ?, frozen_balance = frozen_balance + ? WHERE id = ?')
        .run(job.offered_fee, job.offered_fee, job.customer_id);
    }

    // accepted → completed: unfreeze from customer, pay tradesman
    if (status === 'completed' && job.status === 'accepted' && job.offered_fee) {
      db.prepare('UPDATE users SET frozen_balance = frozen_balance - ? WHERE id = ?')
        .run(job.offered_fee, job.customer_id);
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
        .run(job.offered_fee, job.tradesman_id);
    }

    // accepted → declined: unfreeze back to customer
    if (status === 'declined' && job.status === 'accepted' && job.offered_fee) {
      db.prepare('UPDATE users SET frozen_balance = frozen_balance - ?, balance = balance + ? WHERE id = ?')
        .run(job.offered_fee, job.offered_fee, job.customer_id);
    }

    // ────────────────────────────────────────────────────────────────────────

    db.prepare('UPDATE job_requests SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(id);
    res.json({ job: updated });
  } catch (err) {
    next(err);
  }
};
