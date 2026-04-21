const db = require('../db/database');

// Get all notifications for the logged-in user
exports.getAll = function(req, res) {
  var userId = req.user.userId;

  var notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);

  var unreadCount = 0;
  for (var i = 0; i < notifications.length; i++) {
    if (notifications[i].is_read === 0) {
      unreadCount++;
    }
  }

  res.json({ notifications: notifications, unread_count: unreadCount });
};

// Mark one notification as read
exports.markRead = function(req, res) {
  var userId = req.user.userId;
  var notifId = req.params.id;

  var notif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notifId);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  if (notif.user_id !== userId) {
    return res.status(403).json({ error: 'Not your notification' });
  }

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(notifId);
  res.json({ ok: true });
};

// Mark all notifications as read
exports.markAllRead = function(req, res) {
  var userId = req.user.userId;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  res.json({ ok: true });
};
