import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './InboxPage.css';

export default function InboxPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadNotifications() {
    notificationsApi.getAll()
      .then(function(res) {
        setNotifications(res.data.notifications);
      })
      .catch(function(err) {
        console.error('Failed to load notifications', err);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  useEffect(function() {
    loadNotifications();
  }, []);

  function handleMarkAllRead() {
    notificationsApi.markAllRead().then(function() {
      var updated = notifications.map(function(n) {
        return { ...n, is_read: 1 };
      });
      setNotifications(updated);
    });
  }

  function handleClickNotification(notif) {
    if (notif.is_read === 0) {
      notificationsApi.markRead(notif.id);
      var updated = notifications.map(function(n) {
        if (n.id === notif.id) {
          return { ...n, is_read: 1 };
        }
        return n;
      });
      setNotifications(updated);
    }

    // Navigate to the relevant page
    if (notif.job_id) {
      if (role === 'tradesman') {
        navigate('/dashboard');
      } else {
        navigate('/my-jobs');
      }
    }
  }

  function getIcon(type) {
    if (type === 'new_request') return '📋';
    if (type === 'job_accepted') return '✅';
    if (type === 'job_declined') return '❌';
    if (type === 'job_done') return '🔔';
    if (type === 'job_paid') return '💰';
    return '📩';
  }

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMins / 60);
    var diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min ago';
    if (diffHours < 24) return diffHours + ' hr ago';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  var unreadCount = 0;
  for (var i = 0; i < notifications.length; i++) {
    if (notifications[i].is_read === 0) unreadCount++;
  }

  return (
    <div className="page-wrap inbox-page">
      <div className="inbox-header">
        <h1 className="inbox-title">Inbox</h1>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="inbox-loading">
          <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="inbox-empty">
          <p className="inbox-empty-icon">📭</p>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="inbox-list">
          {notifications.map(function(notif) {
            return (
              <div
                key={notif.id}
                className={'inbox-item' + (notif.is_read === 0 ? ' inbox-item-unread' : '')}
                onClick={function() { handleClickNotification(notif); }}
              >
                <span className="inbox-icon">{getIcon(notif.type)}</span>
                <div className="inbox-body">
                  <p className="inbox-message">{notif.message}</p>
                  <p className="inbox-time">{formatDate(notif.created_at)}</p>
                </div>
                {notif.is_read === 0 && <span className="inbox-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
