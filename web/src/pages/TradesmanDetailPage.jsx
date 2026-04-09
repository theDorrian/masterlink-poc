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

  useEffect(() => {
    tradesmensApi.getById(id)
      .then(res => {
        setTradesman(res.data.tradesman);
        setReviews(res.data.reviews || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 80 }}><span className="spinner spinner-dark" style={{ width: 36, height: 36 }} /></div>;
  if (!tradesman) return <div className="page-wrap">Tradesman not found.</div>;

  const { name, trade, city, hourly_rate, call_out_fee, avg_rating, review_count, is_available, years_experience, bio } = tradesman;

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-layout">
        <div className="detail-main">
          {/* Header Card */}
          <div className="card detail-header">
            <div className="detail-avatar">{name?.[0]}</div>
            <div className="detail-info">
              <div className="detail-name-row">
                <h1>{name}</h1>
                <span className={`badge ${is_available ? 'badge-green' : 'badge-gray'}`}>
                  {is_available ? '● Available Now' : '● Unavailable'}
                </span>
              </div>
              <div className="detail-trade">{trade}</div>
              <div className="detail-stats">
                {avg_rating > 0 && <span>★ {avg_rating.toFixed(1)} ({review_count} reviews)</span>}
                <span>📍 {city}</span>
                <span>🏆 {years_experience || 1} years exp.</span>
              </div>
            </div>
          </div>

          {/* About */}
          {bio && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-h2">About</h2>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7 }}>{bio}</p>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-h2">Recent Reviews</h2>
              <div className="reviews-list">
                {reviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{r.reviewer_name}</span>
                      <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p className="review-comment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          <div className="card pricing-card">
            <h2 className="section-h2">Pricing</h2>
            <div className="price-item">
              <span>Hourly Rate</span>
              <strong>£{hourly_rate}/hr</strong>
            </div>
            <div className="price-item">
              <span>Call-out Fee</span>
              <strong>£{call_out_fee || 50}</strong>
            </div>
            <p className="price-note">Final price determined after inspection. Not charged until job is completed.</p>

            {role === 'customer' && (
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                onClick={() => navigate(`/job-request/${id}`, { state: { tradesman } })}>
                Request Job
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
