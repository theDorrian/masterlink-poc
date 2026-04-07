const db = require('../db/database');

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.list = (req, res, next) => {
  try {
    const {
      trade,
      city,
      min_rate,
      max_rate,
      min_rating,
      available,
      lat,
      lng,
      limit = 20,
      offset = 0,
    } = req.query;

    let sql = `
      SELECT u.id, u.name, u.avatar_url,
             tp.trade, tp.city, tp.hourly_rate, tp.call_out_fee,
             tp.avg_rating, tp.review_count, tp.is_available,
             tp.years_experience, tp.bio, tp.latitude, tp.longitude
      FROM tradesman_profiles tp
      JOIN users u ON u.id = tp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (trade) {
      sql += ' AND LOWER(tp.trade) = LOWER(?)';
      params.push(trade);
    }
    if (city) {
      sql += ' AND LOWER(tp.city) LIKE LOWER(?)';
      params.push(`%${city}%`);
    }
    if (min_rate) {
      sql += ' AND tp.hourly_rate >= ?';
      params.push(parseFloat(min_rate));
    }
    if (max_rate) {
      sql += ' AND tp.hourly_rate <= ?';
      params.push(parseFloat(max_rate));
    }
    if (min_rating) {
      sql += ' AND tp.avg_rating >= ?';
      params.push(parseFloat(min_rating));
    }
    if (available === 'true' || available === '1') {
      sql += ' AND tp.is_available = 1';
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    let rows = db.prepare(sql).all(...params);

    // If user lat/lng provided, compute distance and sort
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      rows = rows
        .map((r) => ({
          ...r,
          distance_km:
            r.latitude && r.longitude
              ? haversineKm(userLat, userLng, r.latitude, r.longitude)
              : null,
        }))
        .sort((a, b) => {
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;
        });
    }

    res.json({ tradesmen: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

exports.getById = (req, res, next) => {
  try {
    const row = db
      .prepare(
        `SELECT u.id, u.name, u.avatar_url, u.created_at,
                tp.trade, tp.city, tp.hourly_rate, tp.call_out_fee,
                tp.avg_rating, tp.review_count, tp.is_available,
                tp.years_experience, tp.bio, tp.latitude, tp.longitude
         FROM tradesman_profiles tp
         JOIN users u ON u.id = tp.user_id
         WHERE u.id = ?`
      )
      .get(req.params.id);

    if (!row) return res.status(404).json({ error: 'Tradesman not found' });

    // Fetch recent reviews
    const reviews = db
      .prepare(
        `SELECT r.rating, r.comment, r.created_at, u.name AS reviewer_name
         FROM reviews r
         JOIN users u ON u.id = r.reviewer_id
         WHERE r.reviewee_id = ?
         ORDER BY r.created_at DESC
         LIMIT 5`
      )
      .all(req.params.id);

    res.json({ tradesman: row, reviews });
  } catch (err) {
    next(err);
  }
};
