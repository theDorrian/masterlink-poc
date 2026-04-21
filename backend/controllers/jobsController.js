const db = require('../db/database');
const { isPositiveNum, isNonNegInt, round2 } = require('../middleware/validate');

const ALLOWED_URGENCY = ['emergency', 'flexible'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

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
    if (!isNonNegInt(tradesman_id) || parseInt(tradesman_id, 10) < 1) {
      return res.status(400).json({ error: 'tradesman_id must be a positive integer' });
    }
    const trimmedTitle = String(title).trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      return res.status(400).json({ error: 'title must be 1–200 characters' });
    }
    if (description !== undefined && String(description).length > 2000) {
      return res.status(400).json({ error: 'description must be 2 000 characters or fewer' });
    }
    if (urgency !== undefined && !ALLOWED_URGENCY.includes(urgency)) {
      return res.status(400).json({ error: `urgency must be one of: ${ALLOWED_URGENCY.join(', ')}` });
    }
    if (offered_fee !== undefined && offered_fee !== null && offered_fee !== '') {
      if (!isPositiveNum(offered_fee) || parseFloat(offered_fee) > 9_999_999) {
        return res.status(400).json({ error: 'offered_fee must be a positive number' });
      }
    }
    if (scheduled_at !== undefined && scheduled_at !== null && scheduled_at !== '') {
      if (!ISO_DATE_RE.test(scheduled_at) || isNaN(Date.parse(scheduled_at))) {
        return res.status(400).json({ error: 'scheduled_at must be a valid ISO 8601 date' });
      }
    }

    const tradesman = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'tradesman'").get(tradesman_id);
    if (!tradesman) return res.status(404).json({ error: 'Tradesman not found' });

    const result = db.prepare(`
      INSERT INTO job_requests (customer_id, tradesman_id, title, description, address, city, urgency, offered_fee, scheduled_at, photos_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, tradesman_id, title,
      description || null, address || null, city || null,
      urgency || 'flexible',
      offered_fee ? parseFloat(offered_fee) : null,
      scheduled_at || null,
      JSON.stringify(photos || [])
    );

    const job = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(result.lastInsertRowid);
    console.log('job created:', job.id);
    res.status(201).json({ job });
  } catch (err) { next(err); }
};

exports.mine = (req, res, next) => {
  try {
    const { userId, role } = req.user;
    let jobs;

    if (role === 'customer') {
      jobs = db.prepare(`
        SELECT jr.*, u.name AS tradesman_name, tp.trade, tp.hourly_rate
        FROM job_requests jr
        JOIN users u  ON u.id  = jr.tradesman_id
        JOIN tradesman_profiles tp ON tp.user_id = jr.tradesman_id
        WHERE jr.customer_id = ?
        ORDER BY jr.created_at DESC
      `).all(userId);
    } else {
      jobs = db.prepare(`
        SELECT jr.*, u.name AS customer_name, u.avatar_url AS customer_avatar,
               tp.hourly_rate
        FROM job_requests jr
        JOIN users u ON u.id = jr.customer_id
        JOIN tradesman_profiles tp ON tp.user_id = jr.tradesman_id
        WHERE jr.tradesman_id = ?
        ORDER BY jr.created_at DESC
      `).all(userId);
    }

    res.json({ jobs });
  } catch (err) { next(err); }
};

exports.updateStatus = (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const { status, hours_worked } = req.body;

    const allowed = ['accepted', 'declined', 'done', 'completed'];
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

    // escrow / balance logic

    if (status === 'done') {
      // Tradesman marks done + submits hours → calculate fee → freeze from customer
      if (role !== 'tradesman') {
        return res.status(403).json({ error: 'Only the tradesman can mark a job as done' });
      }
      if (job.status !== 'accepted') {
        return res.status(400).json({ error: 'Job must be accepted before marking as done' });
      }

      const hrs = parseFloat(hours_worked);
      if (!isPositiveNum(hrs) || hrs > 168) {
        return res.status(400).json({ error: 'hours_worked must be a positive number (max 168)' });
      }

      const tp = db.prepare('SELECT hourly_rate FROM tradesman_profiles WHERE user_id = ?').get(job.tradesman_id);
      const finalFee = round2(hrs * tp.hourly_rate);

      const customer = db.prepare('SELECT balance FROM users WHERE id = ?').get(job.customer_id);
      if (round2(customer.balance) < finalFee) {
        return res.status(400).json({
          error: `Customer has insufficient balance — needs ${finalFee.toFixed(2)} TJS (${hrs} hrs × ${tp.hourly_rate} TJS/hr), has ${round2(customer.balance).toFixed(2)} TJS`
        });
      }

      // Freeze the money and store calculation
      db.prepare('UPDATE job_requests SET hours_worked = ?, final_fee = ? WHERE id = ?')
        .run(hrs, finalFee, id);
      db.prepare('UPDATE users SET balance = round(balance - ?, 2), frozen_balance = round(frozen_balance + ?, 2) WHERE id = ?')
        .run(finalFee, finalFee, job.customer_id);

    } else if (status === 'completed') {
      // Customer confirms → transfer frozen fee to tradesman
      if (role !== 'customer') {
        return res.status(403).json({ error: 'Only the customer can confirm completion' });
      }
      if (job.status !== 'done') {
        return res.status(400).json({ error: 'Job must be marked done by the tradesman first' });
      }

      const fee = job.final_fee || 0;
      if (fee > 0) {
        db.prepare('UPDATE users SET frozen_balance = round(frozen_balance - ?, 2) WHERE id = ?').run(fee, job.customer_id);
        db.prepare('UPDATE users SET balance = round(balance + ?, 2) WHERE id = ?').run(fee, job.tradesman_id);
      }

    } else if (status === 'declined') {
      // If money was frozen (job was in 'done'), return it to customer
      if (job.status === 'done' && job.final_fee) {
        db.prepare('UPDATE users SET frozen_balance = round(frozen_balance - ?, 2), balance = round(balance + ?, 2) WHERE id = ?')
          .run(job.final_fee, job.final_fee, job.customer_id);
      }
    }

    db.prepare('UPDATE job_requests SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(id);
    res.json({ job: updated });
  } catch (err) { next(err); }
};
