const db = require('../db/database');

// Distance in km between two lat/lng points
function getDistanceKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.list = function(req, res, next) {
  try {
    var trade = req.query.trade;
    var city = req.query.city;
    var min_rate = req.query.min_rate;
    var max_rate = req.query.max_rate;
    var min_rating = req.query.min_rating;
    var available = req.query.available;
    var lat = req.query.lat;
    var lng = req.query.lng;

    var page = parseInt(req.query.page) || 1;
    var perPage = 8;
    if (page < 1) page = 1;

    var sql = 'SELECT u.id, u.name, u.avatar_url, tp.trade, tp.city, tp.hourly_rate, tp.call_out_fee, tp.avg_rating, tp.review_count, tp.is_available, tp.years_experience, tp.bio, tp.latitude, tp.longitude FROM tradesman_profiles tp JOIN users u ON u.id = tp.user_id WHERE 1=1';
    var params = [];

    if (trade) {
      sql += ' AND LOWER(tp.trade) = LOWER(?)';
      params.push(trade);
    }
    if (city) {
      sql += ' AND LOWER(tp.city) LIKE LOWER(?)';
      params.push('%' + city + '%');
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

    var allRows = db.prepare(sql).all(params);

    // If user sent their location, calculate distance for each tradesman
    if (lat && lng) {
      var userLat = parseFloat(lat);
      var userLng = parseFloat(lng);
      for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];
        if (row.latitude && row.longitude) {
          row.distance_km = getDistanceKm(userLat, userLng, row.latitude, row.longitude);
        } else {
          row.distance_km = null;
        }
      }
      // Sort by distance
      allRows.sort(function(a, b) {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    var total = allRows.length;
    var totalPages = Math.ceil(total / perPage);
    var offset = (page - 1) * perPage;
    var rows = allRows.slice(offset, offset + perPage);

    res.json({ tradesmen: rows, total: total, page: page, total_pages: totalPages });
  } catch (err) {
    next(err);
  }
};

exports.getById = function(req, res, next) {
  try {
    var tradesmanId = req.params.id;

    var row = db.prepare(
      'SELECT u.id, u.name, u.avatar_url, u.created_at, tp.trade, tp.city, tp.hourly_rate, tp.call_out_fee, tp.avg_rating, tp.review_count, tp.is_available, tp.years_experience, tp.bio, tp.latitude, tp.longitude FROM tradesman_profiles tp JOIN users u ON u.id = tp.user_id WHERE u.id = ?'
    ).get(tradesmanId);

    if (!row) {
      return res.status(404).json({ error: 'Tradesman not found' });
    }

    // Get all reviews so frontend can paginate them
    var reviews = db.prepare(
      'SELECT r.rating, r.comment, r.created_at, u.name AS reviewer_name FROM reviews r JOIN users u ON u.id = r.reviewer_id WHERE r.reviewee_id = ? ORDER BY r.created_at DESC'
    ).all(tradesmanId);

    res.json({ tradesman: row, reviews: reviews });
  } catch (err) {
    next(err);
  }
};
