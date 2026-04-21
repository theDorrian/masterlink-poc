import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Award } from 'lucide-react';
import { tradesmensApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './TradesmanDetailPage.css';

var REVIEWS_PER_PAGE = 5;

function StarRow({ rating }) {
  var stars = [];
  for (var i = 0; i < 5; i++) {
    stars.push(
      <Star key={i} size={14} fill={i < rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
    );
  }
  return <span className="star-row">{stars}</span>;
}

export default function TradesmanDetailPage() {
  var { id } = useParams();
  var navigate = useNavigate();
  var { user, role } = useAuth();
  var [tradesman, setTradesman] = useState(null);
  var [reviews, setReviews] = useState([]);
  var [loading, setLoading] = useState(true);
  var [reviewPage, setReviewPage] = useState(1);

  useEffect(function() {
    tradesmensApi.getById(id)
      .then(function(res) {
        setTradesman(res.data.tradesman);
        setReviews(res.data.reviews || []);
      })
      .finally(function() {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 80 }}>
        <span className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (!tradesman) {
    return <div className="page-wrap">Tradesman not found.</div>;
  }

  var name = tradesman.name;
  var trade = tradesman.trade;
  var city = tradesman.city;
  var hourly_rate = tradesman.hourly_rate;
  var call_out_fee = tradesman.call_out_fee;
  var avg_rating = tradesman.avg_rating;
  var review_count = tradesman.review_count;
  var is_available = tradesman.is_available;
  var years_experience = tradesman.years_experience;
  var bio = tradesman.bio;
  var avatar_url = tradesman.avatar_url;

  var totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  if (totalReviewPages < 1) totalReviewPages = 1;
  var reviewStart = (reviewPage - 1) * REVIEWS_PER_PAGE;
  var visibleReviews = reviews.slice(reviewStart, reviewStart + REVIEWS_PER_PAGE);

  function handleBook() {
    if (user) {
      navigate('/job-request/' + id, { state: { tradesman: tradesman } });
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={function() { navigate(-1); }}>← Back</button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card detail-header">
            <div className="detail-avatar">
              <img src={avatar_url || '/default-avatar.svg'} alt={name} className="detail-avatar-img" />
            </div>
            <div className="detail-info">
              <div className="detail-name-row">
                <h1>{name}</h1>
                <span className={'badge ' + (is_available ? 'badge-green' : 'badge-gray')}>
                  {is_available ? '● Available' : '● Unavailable'}
                </span>
              </div>
              <div className="detail-trade">{trade}</div>
              <div className="detail-stats">
                {avg_rating > 0 && (
                  <span className="detail-rating">
                    <Star size={14} fill="currentColor" className="detail-star" />
                    {avg_rating.toFixed(1)} ({review_count} reviews)
                  </span>
                )}
                <span className="detail-stat-item"><MapPin size={13} />{city}</span>
                <span className="detail-stat-item"><Award size={13} />{years_experience || 1} yrs exp</span>
              </div>
            </div>
          </div>

          {bio && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-h2">About</h2>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7 }}>{bio}</p>
            </div>
          )}

          {/* Reviews section with pagination */}
          <div className="card" style={{ marginTop: 16 }}>
            <h2 className="section-h2">Reviews {reviews.length > 0 && '(' + reviews.length + ')'}</h2>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No reviews yet</p>
            ) : (
              <>
                <div className="reviews-list">
                  {visibleReviews.map(function(r, i) {
                    var stars = [];
                    for (var j = 0; j < 5; j++) {
                      stars.push(
                        <Star key={j} size={13} fill={j < r.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      );
                    }
                    return (
                      <div key={i} className="review-item">
                        <div className="review-header">
                          <span className="reviewer-name">{r.reviewer_name}</span>
                          <span className="review-stars">{stars}</span>
                        </div>
                        {r.comment && <p className="review-comment">{r.comment}</p>}
                        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                          {new Date(r.created_at).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {totalReviewPages > 1 && (
                  <div className="reviews-pagination">
                    <button
                      className="page-btn"
                      onClick={function() { setReviewPage(function(p) { return p - 1; }); }}
                      disabled={reviewPage === 1}
                    >
                      ← Prev
                    </button>
                    <span className="page-info">Page {reviewPage} of {totalReviewPages}</span>
                    <button
                      className="page-btn"
                      onClick={function() { setReviewPage(function(p) { return p + 1; }); }}
                      disabled={reviewPage === totalReviewPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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

            {role !== 'tradesman' && (
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={handleBook}>
                Book Service
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
