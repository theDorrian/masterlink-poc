import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tradesmensApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './TradesmanDetailPage.css';

export default function TradesmanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [tradesman, setTradesman] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    tradesmensApi.getById(id)
      .then(res => {
        setTradesman(res.data.tradesman);
        setReviews(res.data.reviews || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 80 }}><span className="spinner spinner-dark" style={{ width: 36, height: 36 }} /></div>;
  if (!tradesman) return <div className="page-wrap">Tradesman not found.</div>;

  const { name, trade, city, hourly_rate, call_out_fee, avg_rating, review_count, is_available, years_experience, bio, avatar_url } = tradesman;

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card detail-header">
            <div className="detail-avatar">
              <img src={avatar_url || '/default-avatar.svg'} alt={name} className="detail-avatar-img" />
            </div>
            <div className="detail-info">
              <div className="detail-name-row">
                <h1>{name}</h1>
                <span className={`badge ${is_available ? 'badge-green' : 'badge-gray'}`}>
                  {is_available ? '● Available' : '● Unavailable'}
                </span>
              </div>
              <div className="detail-trade">{trade}</div>
              <div className="detail-stats">
                {avg_rating > 0 && <span>★ {avg_rating.toFixed(1)} ({review_count} reviews)</span>}
                <span>📍 {city}</span>
                <span>🏆 {years_experience || 1} yrs exp</span>
              </div>
            </div>
          </div>

          {bio && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-h2">About</h2>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7 }}>{bio}</p>
            </div>
          )}

          <ReviewsSection reviews={reviews} />
        </div>

        <aside className="detail-sidebar">
          <div className="card pricing-card">
            <h2 className="section-h2">Pricing</h2>
            <div className="price-item">
              <span>Hourly Rate</span>
              <strong>{hourly_rate} TJS/hr</strong>
            </div>
            <div className="price-item">
              <span>Call-out Fee</span>
              <strong>{call_out_fee || 50} TJS</strong>
            </div>
            <p className="price-note">Final price agreed after inspection. Payment after completion.</p>

            {role === 'customer' && (
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                onClick={() => navigate(`/job-request/${id}`, { state: { tradesman } })}>
                Book Service
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewsSection({ reviews }) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 className="section-h2">Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No reviews yet</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((r, i) => (
            <div key={i} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{r.reviewer_name}</span>
                <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                {new Date(r.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
