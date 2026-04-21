const db = require('../db/database');

function createNotification(userId, jobId, type, message) {
  db.prepare(
    'INSERT INTO notifications (user_id, job_id, type, message) VALUES (?, ?, ?, ?)'
  ).run(userId, jobId, type, message);
}

exports.create = function(req, res, next) {
  try {
    var userId = req.user.userId;
    var role = req.user.role;

    if (role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create job requests' });
    }

    var tradesman_id = req.body.tradesman_id;
    var title = req.body.title;
    var description = req.body.description;
    var address = req.body.address;
    var city = req.body.city;
    var urgency = req.body.urgency;
    var scheduled_at = req.body.scheduled_at;

    if (!tradesman_id || !title) {
      return res.status(400).json({ error: 'tradesman_id and title are required' });
    }

    var trimmedTitle = String(title).trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      return res.status(400).json({ error: 'title must be 1-200 characters' });
    }

    var allowedUrgency = ['emergency', 'flexible'];
    if (urgency && !allowedUrgency.includes(urgency)) {
      return res.status(400).json({ error: 'urgency must be emergency or flexible' });
    }

    var tradesman = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'tradesman'").get(tradesman_id);
    if (!tradesman) {
      return res.status(404).json({ error: 'Tradesman not found' });
    }

    var customer = db.prepare('SELECT name FROM users WHERE id = ?').get(userId);

    var result = db.prepare(
      'INSERT INTO job_requests (customer_id, tradesman_id, title, description, address, city, urgency, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      userId,
      tradesman_id,
      trimmedTitle,
      description || null,
      address || null,
      city || null,
      urgency || 'flexible',
      scheduled_at || null
    );

    var job = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(result.lastInsertRowid);

    // Notify the tradesman about the new request
    var msg = 'You have a new job request "' + trimmedTitle + '" from ' + customer.name;
    createNotification(tradesman_id, job.id, 'new_request', msg);

    res.status(201).json({ job: job });
  } catch (err) {
    next(err);
  }
};

exports.mine = function(req, res, next) {
  try {
    var userId = req.user.userId;
    var role = req.user.role;
    var jobs;

    if (role === 'customer') {
      jobs = db.prepare(
        'SELECT jr.*, u.name AS tradesman_name, tp.trade, tp.hourly_rate ' +
        'FROM job_requests jr ' +
        'JOIN users u ON u.id = jr.tradesman_id ' +
        'JOIN tradesman_profiles tp ON tp.user_id = jr.tradesman_id ' +
        'WHERE jr.customer_id = ? ' +
        'ORDER BY jr.created_at DESC'
      ).all(userId);
    } else {
      jobs = db.prepare(
        'SELECT jr.*, u.name AS customer_name, u.avatar_url AS customer_avatar, tp.hourly_rate ' +
        'FROM job_requests jr ' +
        'JOIN users u ON u.id = jr.customer_id ' +
        'JOIN tradesman_profiles tp ON tp.user_id = jr.tradesman_id ' +
        'WHERE jr.tradesman_id = ? ' +
        'ORDER BY jr.created_at DESC'
      ).all(userId);
    }

    res.json({ jobs: jobs });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = function(req, res, next) {
  try {
    var userId = req.user.userId;
    var role = req.user.role;
    var jobId = req.params.id;
    var status = req.body.status;
    var hours_worked = req.body.hours_worked;

    var allowed = ['accepted', 'declined', 'done', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    var job = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (role === 'tradesman' && job.tradesman_id !== userId) {
      return res.status(403).json({ error: 'Not your job request' });
    }
    if (role === 'customer' && job.customer_id !== userId) {
      return res.status(403).json({ error: 'Not your job request' });
    }

    var tradesman = db.prepare('SELECT name FROM users WHERE id = ?').get(job.tradesman_id);
    var customer = db.prepare('SELECT name FROM users WHERE id = ?').get(job.customer_id);

    if (status === 'done') {
      if (role !== 'tradesman') {
        return res.status(403).json({ error: 'Only the tradesman can mark a job as done' });
      }
      if (job.status !== 'accepted') {
        return res.status(400).json({ error: 'Job must be accepted before marking as done' });
      }

      var hrs = parseFloat(hours_worked);
      if (isNaN(hrs) || hrs <= 0 || hrs > 168) {
        return res.status(400).json({ error: 'hours_worked must be a positive number (max 168)' });
      }

      var tp = db.prepare('SELECT hourly_rate FROM tradesman_profiles WHERE user_id = ?').get(job.tradesman_id);
      var finalFee = Math.round(hrs * tp.hourly_rate * 100) / 100;

      var customerData = db.prepare('SELECT balance FROM users WHERE id = ?').get(job.customer_id);
      if (customerData.balance < finalFee) {
        return res.status(400).json({
          error: 'Customer has insufficient balance — needs ' + finalFee + ' TJS, has ' + customerData.balance + ' TJS'
        });
      }

      db.prepare('UPDATE job_requests SET hours_worked = ?, final_fee = ? WHERE id = ?').run(hrs, finalFee, jobId);
      db.prepare('UPDATE users SET balance = round(balance - ?, 2), frozen_balance = round(frozen_balance + ?, 2) WHERE id = ?').run(finalFee, finalFee, job.customer_id);

      // Notify the customer
      var doneMsg = tradesman.name + ' has marked your job "' + job.title + '" as done. Please review and confirm payment of ' + finalFee + ' TJS.';
      createNotification(job.customer_id, job.id, 'job_done', doneMsg);

    } else if (status === 'completed') {
      if (role !== 'customer') {
        return res.status(403).json({ error: 'Only the customer can confirm completion' });
      }
      if (job.status !== 'done') {
        return res.status(400).json({ error: 'Job must be marked done by the tradesman first' });
      }

      var fee = job.final_fee || 0;
      if (fee > 0) {
        db.prepare('UPDATE users SET frozen_balance = round(frozen_balance - ?, 2) WHERE id = ?').run(fee, job.customer_id);
        db.prepare('UPDATE users SET balance = round(balance + ?, 2) WHERE id = ?').run(fee, job.tradesman_id);
      }

      // Notify the tradesman
      var paidMsg = customer.name + ' confirmed your job "' + job.title + '" and paid ' + fee + ' TJS to your balance.';
      createNotification(job.tradesman_id, job.id, 'job_paid', paidMsg);

    } else if (status === 'accepted') {
      if (role !== 'tradesman') {
        return res.status(403).json({ error: 'Only the tradesman can accept a job' });
      }

      // Notify the customer
      var acceptMsg = tradesman.name + ' accepted your job request "' + job.title + '".';
      createNotification(job.customer_id, job.id, 'job_accepted', acceptMsg);

    } else if (status === 'declined') {
      // If money was frozen (job was in 'done'), return it to customer
      if (job.status === 'done' && job.final_fee) {
        db.prepare('UPDATE users SET frozen_balance = round(frozen_balance - ?, 2), balance = round(balance + ?, 2) WHERE id = ?').run(job.final_fee, job.final_fee, job.customer_id);
      }

      // Notify the customer
      var declineMsg = tradesman.name + ' declined your job request "' + job.title + '".';
      createNotification(job.customer_id, job.id, 'job_declined', declineMsg);
    }

    db.prepare('UPDATE job_requests SET status = ? WHERE id = ?').run(status, jobId);
    var updated = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(jobId);
    res.json({ job: updated });
  } catch (err) {
    next(err);
  }
};
