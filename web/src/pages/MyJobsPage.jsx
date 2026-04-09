import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './MyJobsPage.css';

const STATUS_BADGE = {
  pending: 'badge-yellow',
  accepted: 'badge-green',
  declined: 'badge-red',
  completed: 'badge-blue',
};

export default function MyJobsPage() {
  const { role } = useAuth();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(location.state?.success);

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
        <div style={{ background: 'var(--green-light)', color: 'var(--green-dark)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontWeight: 600 }}>
          ✅ Job request sent successfully!
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-jobs">
          <div style={{ fontSize: 48 }}>📋</div>
          <h3>{role === 'tradesman' ? 'No incoming requests yet' : 'No jobs yet'}</h3>
          <p>{role === 'customer' ? 'Find a tradesman and send your first request' : 'Requests from customers will appear here'}</p>
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
                      : <span>From: {job.customer_name}</span>}
                    <span>·</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    {job.city && <><span>·</span><span>📍 {job.city}</span></>}
                  </div>
                </div>
                <div className="job-badges">
                  <span className={`badge badge-${job.urgency === 'emergency' ? 'red' : 'blue'}`}>
                    {job.urgency === 'emergency' ? '⚡ Emergency' : '📅 Flexible'}
                  </span>
                  <span className={`badge ${STATUS_BADGE[job.status] || 'badge-gray'}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>

              {job.description && <p className="job-desc">{job.description}</p>}
              {job.address && <p className="job-address">📍 {job.address}</p>}
              {job.offered_fee && <p className="job-fee">Budget: <strong>£{job.offered_fee}</strong></p>}

              {role === 'tradesman' && job.status === 'pending' && (
                <div className="job-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatus(job.id, 'accepted')}>
                    Accept
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(job.id, 'declined')}>
                    Decline
                  </button>
                </div>
              )}
              {role === 'customer' && job.status === 'accepted' && (
                <div className="job-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatus(job.id, 'completed')}>
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
