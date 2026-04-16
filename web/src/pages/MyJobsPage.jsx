import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import './MyJobsPage.css';

const STATUS_BADGE = {
  pending:   'badge-yellow',
  accepted:  'badge-green',
  declined:  'badge-red',
  completed: 'badge-blue',
};
const STATUS_EN = { pending: 'Pending', accepted: 'Accepted', declined: 'Declined', completed: 'Completed' };

export default function MyJobsPage() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(location.state?.success);
  const [reviewModal, setReviewModal] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.mine();
      setJobs(res.data.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleStatus = async (jobId, status) => {
    try {
      await jobsApi.updateStatus(jobId, status);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating status');
    }
  };

  return (
    <div className="page-wrap">
      <h1 className="page-title">{role === 'tradesman' ? 'Incoming Requests' : 'My Jobs'}</h1>

      {success && (
        <div className="success-msg">✅ Request submitted successfully!</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-jobs">
          <div style={{ fontSize: 48 }}>📋</div>
          <h3>{role === 'tradesman' ? 'No requests yet' : 'No jobs yet'}</h3>
          <p>{role === 'customer'
            ? <button className="btn btn-primary" onClick={() => navigate('/search')}>Find a tradesman</button>
            : 'Client requests will appear here'}
          </p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job.id} className="job-card card">
              <div className="job-header">
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-meta">
                    {role === 'customer'
                      ? <span>{job.tradesman_name} · {job.trade}</span>
                      : <span>Customer: {job.customer_name}</span>}
                    <span>·</span>
                    <span>{new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                    {job.city && <><span>·</span><span>📍 {job.city}</span></>}
                  </div>
                </div>
                <div className="job-badges">
                  <span className={`badge badge-${job.urgency === 'emergency' ? 'red' : 'blue'}`}>
                    {job.urgency === 'emergency' ? '⚡ Emergency' : '📅 Scheduled'}
                  </span>
                  <span className={`badge ${STATUS_BADGE[job.status] || 'badge-gray'}`}>
                    {STATUS_EN[job.status] || job.status}
                  </span>
                </div>
              </div>

              {job.scheduled_at && (
                <div className="job-schedule">
                  🗓 Scheduled: <strong>{new Date(job.scheduled_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                </div>
              )}
              {job.description && <p className="job-desc">{job.description}</p>}
              {job.address && <p className="job-address">📍 {job.address}</p>}
              {job.offered_fee && <p className="job-fee">Budget: <strong>{job.offered_fee} TJS</strong></p>}

              <div className="job-actions">
                {role === 'tradesman' && job.status === 'pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatus(job.id, 'accepted')}>Accept</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(job.id, 'declined')}>Decline</button>
                  </>
                )}
                {role === 'customer' && job.status === 'accepted' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatus(job.id, 'completed')}>
                    Mark as Complete
                  </button>
                )}
                {role === 'customer' && job.status === 'completed' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setReviewModal(job)}>
                    ⭐ Leave a Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewModal && (
        <ReviewModal job={reviewModal} onClose={() => { setReviewModal(null); fetchJobs(); }} />
      )}
    </div>
  );
}

function ReviewModal({ job, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post('/api/reviews', { job_id: job.id, rating, comment });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Leave a Review</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
          {job.tradesman_name} · {job.trade}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button"
                  className={`star-btn ${s <= rating ? 'active' : ''}`}
                  onClick={() => setRating(s)}>★</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Comment (optional)</label>
            <textarea className="form-control" rows={3}
              placeholder="Share your experience with this tradesman..."
              value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner" /> : 'Submit'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
