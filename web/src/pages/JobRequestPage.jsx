import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Calendar, Send } from 'lucide-react';
import { jobsApi } from '../api/client';
import './JobRequestPage.css';

function defaultSchedule() {
  return new Date().toISOString().slice(0, 16);
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
        scheduled_at: form.scheduled_at || null,
      });
      navigate('/my-jobs', { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="job-request-layout">
        <div className="card" style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Service Request</h1>

          {tradesman && (
            <div className="request-tradesman">
              <div className="req-avatar">{tradesman.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{tradesman.name}</div>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{tradesman.trade}</div>
              </div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title *</label>
              <input className="form-control" placeholder="e.g. Leaking pipe under kitchen sink"
                value={form.title} onChange={set('title')} required />
            </div>

            <div className="form-group">
              <label>Problem Description</label>
              <textarea className="form-control" rows={4}
                placeholder="Describe the problem in detail. When did it start? What happened?"
                value={form.description} onChange={set('description')} />
            </div>

            <div className="form-group">
              <label>Urgency</label>
              <div className="urgency-btns">
                {[
                  ['emergency', <><Zap size={13} /> Emergency</>, 'red'],
                  ['flexible',  <><Calendar size={13} /> Scheduled</>, 'blue'],
                ].map(([val, label, color]) => (
                  <button key={val} type="button"
                    className={`urgency-btn ${form.urgency === val ? 'active active-' + color : ''}`}
                    onClick={() => setForm(f => ({ ...f, urgency: val, scheduled_at: val === 'emergency' ? '' : f.scheduled_at || defaultSchedule() }))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {form.urgency !== 'emergency' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Preferred Date &amp; Time</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={set('scheduled_at')}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <span style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>
                  Defaults to next available slot
                </span>
              </div>
            )}

            <div className="form-group">
              <label>Address</label>
              <input className="form-control" placeholder="e.g. Rudaki Ave 45, apt 12, Dushanbe"
                value={form.address} onChange={set('address')} />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : <><Send size={15} /> Submit Request</>}
            </button>
          </form>
        </div>

        {tradesman && (
          <div className="card job-pricing-summary" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Pricing</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Call-out fee</span>
              <strong>{tradesman.call_out_fee || 50} TJS</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Hourly rate</span>
              <strong>{tradesman.hourly_rate} TJS/hr</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 12, lineHeight: 1.5 }}>
              Final price agreed after inspection. Payment only after completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
