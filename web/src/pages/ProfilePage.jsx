import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client';
import './ProfilePage.css';

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
      {/* User card */}
      <div className="card profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user.name?.[0]}</div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <span className={`badge ${role === 'tradesman' ? 'badge-orange' : 'badge-blue'}`} style={{ marginTop: 6, display: 'inline-block' }}>
              {role === 'tradesman' ? 'Tradesman' : 'Customer'}
            </span>
          </div>
        </div>

        <div className="profile-details">
          {[
            ['Name',        user.name],
            ['Email',       user.email],
            ['Role',        role === 'tradesman' ? 'Tradesman' : 'Customer'],
            ['Member Since', new Date(user.created_at).toLocaleDateString('en-GB')],
          ].map(([label, value]) => (
            <div key={label} className="profile-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary profile-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Completed jobs */}
      <div className="profile-section">
        <h2 className="page-title" style={{ marginBottom: 16 }}>Completed Jobs</h2>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : completedJobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--gray-400)' }}>
            No completed jobs yet
          </div>
        ) : (
          <div className="completed-list">
            {completedJobs.map(job => (
              <div key={job.id} className="card completed-job">
                <div className="completed-header">
                  <div>
                    <div className="job-title-small">{job.title}</div>
                    <div className="job-meta-small">
                      {role === 'customer' ? (
                        <span
                          className="tradesman-link"
                          onClick={() => navigate(`/tradesman/${job.tradesman_id}`)}
                        >
                          {job.tradesman_name} · {job.trade}
                        </span>
                      ) : (
                        <>Customer: {job.customer_name}</>
                      )}
                      {job.city && <> · 📍 {job.city}</>}
                    </div>
                  </div>
                  <span className="badge badge-blue">✓ Completed</span>
                </div>

                {job.scheduled_at && (
                  <div className="completed-date">
                    🗓 {new Date(job.scheduled_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                )}

                {job.offered_fee && (
                  <div className="completed-fee">💰 {job.offered_fee} TJS</div>
                )}

                {role === 'customer' && job.tradesman_id && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 10, alignSelf: 'start' }}
                    onClick={() => navigate(`/tradesman/${job.tradesman_id}`)}
                  >
                    View Tradesman Profile →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
