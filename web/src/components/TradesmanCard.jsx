import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TradesmanCard.css';

export default function TradesmanCard({ tradesman }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { id, name, trade, city, hourly_rate, avg_rating, review_count, is_available, avatar_url } = tradesman;

  return (
    <div className="t-card">
      <div className="t-card-left">
        <div className="t-avatar">
          <img src={avatar_url || '/default-avatar.svg'} alt={name} className="t-avatar-img" />
          <span className={`t-dot ${is_available ? 'online' : 'offline'}`} />
        </div>
        <div className="t-info">
          <div className="t-name-row">
            <span className="t-name">{name}</span>
            {avg_rating > 0 && (
              <span className="t-rating">★ {avg_rating.toFixed(1)} ({review_count})</span>
            )}
          </div>
          <span className="t-trade">{trade}</span>
          <div className="t-meta">
            <span>📍 {city}</span>
            <span className={`badge ${is_available ? 'badge-green' : 'badge-gray'}`}>
              {is_available ? 'Available Now' : 'Avail. Later'}
            </span>
          </div>
        </div>
      </div>
      <div className="t-card-right">
        <div className="t-rate">{hourly_rate}<span> tjs/hr</span></div>
        <div className="t-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/tradesman/${id}`)}>
            View Profile
          </button>
          {role === 'customer' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/job-request/${id}`, { state: { tradesman } })}>
              Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
