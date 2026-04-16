import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jobsApi } from '../api/client';
import './JobRequestPage.css';

function defaultSchedule() {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 30) * 30, 0, 0);
  // формат для datetime-local: YYYY-MM-DDTHH:MM
  return d.toISOString().slice(0, 16);
}

export default function JobRequestPage() {
  const { tradesmanId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const tradesman = state?.tradesman;

  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    urgency: 'flexible',
    offered_fee: '',
    scheduled_at: defaultSchedule(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await jobsApi.create({
        tradesman_id: parseInt(tradesmanId),
        title: form.title,
        description: form.description,
        address: form.address,
        urgency: form.urgency,
        offered_fee: form.offered_fee ? parseFloat(form.offered_fee) : null,
        scheduled_at: form.scheduled_at || null,
      });
      navigate('/my-jobs', { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>

      <div className="job-request-layout">
        <div className="card" style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Заявка на услугу</h1>

          {tradesman && (
            <div className="request-tradesman">
              <div className="req-avatar">{tradesman.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{tradesman.name}</div>
                <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>{tradesman.trade}</div>
              </div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Название заявки *</label>
              <input className="form-control" placeholder="Например: Протечка трубы под раковиной"
                value={form.title} onChange={set('title')} required />
            </div>

            <div className="form-group">
              <label>Описание проблемы</label>
              <textarea className="form-control" rows={4}
                placeholder="Опишите проблему подробнее. Когда началась? Что случилось?"
                value={form.description} onChange={set('description')} />
            </div>

            <div className="form-group">
              <label>Срочность</label>
              <div className="urgency-btns">
                {[['emergency', '⚡ Срочно', 'red'], ['flexible', '📅 Планово', 'blue']].map(([val, label, color]) => (
                  <button key={val} type="button"
                    className={`urgency-btn ${form.urgency === val ? 'active active-' + color : ''}`}
                    onClick={() => setForm(f => ({ ...f, urgency: val }))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>📅 Дата и время визита</label>
              <input
                className="form-control"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={set('scheduled_at')}
                min={new Date().toISOString().slice(0, 16)}
              />
              <span style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
                По умолчанию — ближайшее удобное время
              </span>
            </div>

            <div className="form-group">
              <label>Адрес</label>
              <input className="form-control" placeholder="Например: ул. Рудаки 45, кв. 12, Душанбе"
                value={form.address} onChange={set('address')} />
            </div>

            <div className="form-group">
              <label>Предлагаемая оплата (сомони, необязательно)</label>
              <input className="form-control" type="number" placeholder="Ваш бюджет"
                value={form.offered_fee} onChange={set('offered_fee')} />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Отправить заявку ✈'}
            </button>
          </form>
        </div>

        {tradesman && (
          <div className="card job-pricing-summary" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Стоимость</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Выезд (ориент.)</span>
              <strong>{tradesman.call_out_fee || 50} сом</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Почасовая ставка</span>
              <strong>{tradesman.hourly_rate} сом/ч</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 12, lineHeight: 1.5 }}>
              Окончательная цена определяется после осмотра. Оплата только после выполнения работы.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
