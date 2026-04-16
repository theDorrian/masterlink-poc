import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client';
import './ProfilePage.css';

const STATUS_RU = { pending: 'Ожидает', accepted: 'Принята', declined: 'Отклонена', completed: 'Завершена' };
const STATUS_BADGE = { pending: 'badge-yellow', accepted: 'badge-green', declined: 'badge-red', completed: 'badge-blue' };

export default function ProfilePage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    jobsApi.mine()
      .then(res => {
        const done = (res.data.jobs || []).filter(j => j.status === 'completed');
        setCompletedJobs(done);
      })
      .finally(() => setLoadingJobs(false));
  }, []);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="page-wrap profile-wrap">
      {/* Карточка пользователя */}
      <div className="card profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user.name?.[0]}</div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <span className={`badge ${role === 'tradesman' ? 'badge-orange' : 'badge-blue'}`} style={{ marginTop: 6, display: 'inline-block' }}>
              {role === 'tradesman' ? 'Мастер' : 'Клиент'}
            </span>
          </div>
        </div>

        <div className="profile-details">
          {[
            ['Имя', user.name],
            ['Email', user.email],
            ['Роль', role === 'tradesman' ? 'Мастер' : 'Клиент'],
            ['Дата регистрации', new Date(user.created_at).toLocaleDateString('ru-RU')],
          ].map(([label, value]) => (
            <div key={label} className="profile-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary profile-logout" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>

      {/* Завершённые работы */}
      <div className="profile-section">
        <h2 className="page-title" style={{ marginBottom: 16 }}>
          {role === 'tradesman' ? 'Выполненные заказы' : 'Завершённые услуги'}
        </h2>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : completedJobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--gray-400)' }}>
            {role === 'customer' ? '🔨 Завершённых заказов пока нет' : '✅ Выполненных заказов пока нет'}
          </div>
        ) : (
          <div className="completed-list">
            {completedJobs.map(job => (
              <div key={job.id} className="card completed-job">
                <div className="completed-header">
                  <div>
                    <div className="job-title-small">{job.title}</div>
                    <div className="job-meta-small">
                      {role === 'customer'
                        ? <>{job.tradesman_name} · {job.trade}</>
                        : <>Клиент: {job.customer_name}</>}
                      {job.city && <> · 📍 {job.city}</>}
                    </div>
                  </div>
                  <span className="badge badge-blue">✓ Завершена</span>
                </div>

                {job.scheduled_at && (
                  <div className="completed-date">
                    🗓 {new Date(job.scheduled_at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                )}

                {job.offered_fee && (
                  <div className="completed-fee">💰 {job.offered_fee} сомони</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
