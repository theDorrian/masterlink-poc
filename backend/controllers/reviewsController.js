const db = require('../db/database');

exports.create = (req, res, next) => {
  try {
    const { userId } = req.user;
    const { job_id, rating, comment } = req.body;

    if (!job_id || !rating) {
      return res.status(400).json({ error: 'job_id and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const job = db.prepare('SELECT * FROM job_requests WHERE id = ?').get(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.customer_id !== userId) return res.status(403).json({ error: 'Only the customer can leave a review' });
    if (job.status !== 'completed') return res.status(400).json({ error: 'Can only review completed jobs' });

    const existing = db.prepare('SELECT id FROM reviews WHERE job_id = ?').get(job_id);
    if (existing) return res.status(409).json({ error: 'Review already submitted for this job' });

    const result = db.prepare(`
      INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(job_id, userId, job.tradesman_id, parseInt(rating), comment || null);

    // Пересчитываем рейтинг мастера
    const stats = db.prepare(`
      SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE reviewee_id = ?
    `).get(job.tradesman_id);
    db.prepare(`
      UPDATE tradesman_profiles SET avg_rating = ?, review_count = ? WHERE user_id = ?
    `).run(Math.round(stats.avg * 10) / 10, stats.cnt, job.tradesman_id);

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

exports.mine = (req, res, next) => {
  try {
    const { userId } = req.user;
    const reviews = db.prepare(`
      SELECT r.*, u.name AS reviewer_name, jr.title AS job_title
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      JOIN job_requests jr ON jr.id = r.job_id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};
