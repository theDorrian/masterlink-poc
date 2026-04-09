import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jobsApi } from '../api/client';
import './JobRequestPage.css';

export default function JobRequestPage() {
  const { tradesmanId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const tradesman = state?.tradesman;

  const [form, setForm] = useState({ title: '', description: '', address: '', urgency: 'flexible', offered_fee: '' });
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
      <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'none', fontSize: 14, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 20, padding: 0, cursor: 'pointer', border: 'none' }}>
        ← Back
      </button>

      <div className="job-request-layout">
        <div className="card" style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Job Request</h1>
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
              <label>Job Title *</label>
              <input className="form-control" placeholder="e.g. Leaking pipe under kitchen sink"
                value={form.title} onChange={set('title')} required />
            </div>

            <div className="form-group">
              <label>Detailed Description</label>
              <textarea className="form-control" rows={4}
                placeholder="Describe the issue in detail. When did it start? Any relevant info?"
                value={form.description} onChange={set('description')} />
            </div>

            <div className="form-group">
              <label>Urgency</label>
              <div className="urgency-btns">
                {[['emergency', '⚡ Emergency', 'red'], ['flexible', '📅 Flexible', 'blue']].map(([val, label, color]) => (
                  <button key={val} type="button"
                    className={`urgency-btn ${form.urgency === val ? 'active active-' + color : ''}`}
                    onClick={() => setForm(f => ({ ...f, urgency: val }))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Service Address</label>
              <input className="form-control" placeholder="e.g. 123 Maple Street, London"
                value={form.address} onChange={set('address')} />
            </div>

            <div className="form-group">
              <label>Offered Fee (£, optional)</label>
              <input className="form-control" type="number" placeholder="Your budget"
                value={form.offered_fee} onChange={set('offered_fee')} />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Send Request ✈'}
            </button>
          </form>
        </div>

        {tradesman && (
          <div className="card job-pricing-summary" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Pricing Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Call-out Fee (Est.)</span>
              <strong>£{tradesman.call_out_fee || 50}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Hourly Rate</span>
              <strong>£{tradesman.hourly_rate}/hr</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 12, lineHeight: 1.5 }}>
              Final price will be determined after inspection. You will not be charged until the job is accepted and completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
