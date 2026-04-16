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
  if (!tradesman) return <div className="page-wrap">Мастер не найден.</div>;

  const { name, trade, city, hourly_rate, call_out_fee, avg_rating, review_count, is_available, years_experience, bio } = tradesman;

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card detail-header">
            <div className="detail-avatar">{name?.[0]}</div>
            <div className="detail-info">
              <div className="detail-name-row">
                <h1>{name}</h1>
                <span className={`badge ${is_available ? 'badge-green' : 'badge-gray'}`}>
                  {is_available ? '● Доступен' : '● Недоступен'}
                </span>
              </div>
              <div className="detail-trade">{trade}</div>
              <div className="detail-stats">
                {avg_rating > 0 && <span>★ {avg_rating.toFixed(1)} ({review_count} отзывов)</span>}
                <span>📍 {city}</span>
                <span>🏆 Стаж: {years_experience || 1} лет</span>
              </div>
            </div>
          </div>

          {bio && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-h2">О мастере</h2>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7 }}>{bio}</p>
            </div>
          )}

          <ReviewsSection reviews={reviews} tradesmanId={id} role={role} onReviewAdded={fetchData} />
        </div>

        <aside className="detail-sidebar">
          <div className="card pricing-card">
            <h2 className="section-h2">Стоимость</h2>
            <div className="price-item">
              <span>Почасовая ставка</span>
              <strong>{hourly_rate} сом/ч</strong>
            </div>
            <div className="price-item">
              <span>Выезд на объект</span>
              <strong>{call_out_fee || 50} сом</strong>
            </div>
            <p className="price-note">Окончательная цена определяется после осмотра. Оплата после выполнения.</p>

            {role === 'customer' && (
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                onClick={() => navigate(`/job-request/${id}`, { state: { tradesman } })}>
                Заказать услугу
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewsSection({ reviews, tradesmanId, role, onReviewAdded }) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 className="section-h2">Отзывы {reviews.length > 0 && `(${reviews.length})`}</h2>
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Отзывов пока нет</p>
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
                {new Date(r.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
