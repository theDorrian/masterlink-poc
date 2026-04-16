import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi, jobsApi } from '../api/client';
import './ProfilePage.css';

const TABS = [
  { id: 'account',  label: 'Edit Profile' },
  { id: 'balance',  label: 'Balance' },
  { id: 'payment',  label: 'Payment' },
  { id: 'security', label: 'Security' },
  { id: 'jobs',     label: 'Completed Jobs' },
];

const PAYMENT_TYPES = ['Visa', 'Mastercard', 'PayMe', 'Click', 'Bank Transfer', 'Cash'];
const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler'];

export default function ProfilePage() {
  const { user, role, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    authApi.me().then(res => setProfile(res.data.profile));
    jobsApi.mine()
      .then(res => setCompletedJobs((res.data.jobs || []).filter(j => j.status === 'completed')))
      .finally(() => setLoadingJobs(false));
  }, []);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="page-wrap profile-wrap">
      {/* User info card — always visible */}
      <div className="card profile-header-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user.name?.[0]}</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <span className={`badge ${role === 'tradesman' ? 'badge-orange' : 'badge-blue'}`}
              style={{ marginTop: 6, display: 'inline-block' }}>
              {role === 'tradesman' ? 'Tradesman' : 'Customer'}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm profile-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`profile-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'jobs' && !loadingJobs && completedJobs.length > 0 && (
              <span className="tab-badge">{completedJobs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card tab-content">
        {tab === 'account' && (
          <EditProfileTab
            user={user}
            role={role}
            profile={profile}
            onSaved={(newUser, newProfile) => {
              refreshUser();
              if (newProfile) setProfile(newProfile);
            }}
          />
        )}
        {tab === 'balance'  && <BalanceTab  user={user} onUpdated={refreshUser} />}
        {tab === 'payment'  && <PaymentTab  user={user} onUpdated={refreshUser} />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'jobs' && (
          <CompletedJobsTab
            jobs={completedJobs}
            loading={loadingJobs}
            role={role}
            navigate={navigate}
            open={jobsOpen}
            setOpen={setJobsOpen}
          />
        )}
      </div>
    </div>
  );
}

// ── Edit Profile ──────────────────────────────────────────────────────────────

function EditProfileTab({ user, role, profile, onSaved }) {
  const [form, setForm] = useState({
    name:             user.name || '',
    bio:              profile?.bio || '',
    city:             profile?.city || '',
    trade:            profile?.trade || '',
    hourly_rate:      profile?.hourly_rate || '',
    call_out_fee:     profile?.call_out_fee || '',
    years_experience: profile?.years_experience || '',
    is_available:     profile?.is_available ?? 1,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      const res = await authApi.updateProfile(form);
      onSaved(res.data.user, res.data.profile);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="tab-title">Edit Profile</h2>
      {msg   && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="form-group">
        <label>Full Name</label>
        <input className="form-control" value={form.name} onChange={set('name')} required />
      </div>

      {role === 'tradesman' && (
        <>
          <div className="form-group">
            <label>Trade</label>
            <div className="trade-pills">
              {TRADES.map(t => (
                <button key={t} type="button"
                  className={`trade-pill ${form.trade === t ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, trade: t }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea className="form-control" rows={3} value={form.bio} onChange={set('bio')}
              placeholder="Describe your skills and experience..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input className="form-control" value={form.city} onChange={set('city')} />
            </div>
            <div className="form-group">
              <label>Years Experience</label>
              <input className="form-control" type="number" min="0" value={form.years_experience} onChange={set('years_experience')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hourly Rate (TJS)</label>
              <input className="form-control" type="number" min="0" value={form.hourly_rate} onChange={set('hourly_rate')} />
            </div>
            <div className="form-group">
              <label>Call-out Fee (TJS)</label>
              <input className="form-control" type="number" min="0" value={form.call_out_fee} onChange={set('call_out_fee')} />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label" style={{ fontSize: 15 }}>
              <input type="checkbox" checked={!!form.is_available}
                onChange={e => setForm(f => ({ ...f, is_available: e.target.checked ? 1 : 0 }))} />
              Available for new jobs
            </label>
          </div>
        </>
      )}

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ minWidth: 140 }}>
        {loading ? <span className="spinner" /> : 'Save Changes'}
      </button>
    </form>
  );
}

// ── Balance ───────────────────────────────────────────────────────────────────

function BalanceTab({ user, onUpdated }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleTopUp = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await authApi.topUp(parseFloat(amount));
      await onUpdated();
      setMsg(`${amount} TJS added to your balance!`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="tab-title">Balance</h2>

      <div className="balance-cards">
        <div className="balance-card available">
          <div className="balance-label">Available</div>
          <div className="balance-amount">{(user.balance || 0).toFixed(0)} <span>TJS</span></div>
        </div>
        {(user.frozen_balance || 0) > 0 && (
          <div className="balance-card frozen">
            <div className="balance-label">Frozen (in escrow)</div>
            <div className="balance-amount">{(user.frozen_balance || 0).toFixed(0)} <span>TJS</span></div>
          </div>
        )}
      </div>

      <div className="tab-divider" />

      <h3 className="tab-subtitle">Top Up Balance</h3>
      {msg   && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleTopUp} style={{ display: 'flex', gap: 10, maxWidth: 360 }}>
        <input
          className="form-control"
          type="number"
          min="1"
          placeholder="Amount in TJS"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? <span className="spinner" /> : 'Add Funds'}
        </button>
      </form>
      <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 10 }}>
        Funds are instantly added. When a job is accepted, the offered fee is frozen until completion.
      </p>
    </div>
  );
}

// ── Payment Method ────────────────────────────────────────────────────────────

function PaymentTab({ user, onUpdated }) {
  const parsed = (() => {
    try { return user.payment_method ? JSON.parse(user.payment_method) : null; }
    catch { return null; }
  })();

  const [type, setType]       = useState(parsed?.type || '');
  const [identifier, setId]   = useState(parsed?.identifier || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      const method = JSON.stringify({ type, identifier });
      await authApi.setPaymentMethod(method);
      await onUpdated();
      setMsg('Payment method saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await authApi.setPaymentMethod(null);
      await onUpdated();
      setType(''); setId(''); setMsg('Payment method removed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="tab-title">Payment Method</h2>

      {parsed && (
        <div className="payment-current">
          <span className="payment-icon">💳</span>
          <div>
            <div style={{ fontWeight: 700 }}>{parsed.type}</div>
            {parsed.identifier && <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{parsed.identifier}</div>}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleRemove} style={{ marginLeft: 'auto' }}>
            Remove
          </button>
        </div>
      )}

      {msg   && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}

      <h3 className="tab-subtitle" style={{ marginTop: parsed ? 20 : 0 }}>
        {parsed ? 'Update Payment Method' : 'Add Payment Method'}
      </h3>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Type</label>
          <div className="trade-pills">
            {PAYMENT_TYPES.map(pt => (
              <button key={pt} type="button"
                className={`trade-pill ${type === pt ? 'active' : ''}`}
                onClick={() => setType(pt)}>
                {pt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>
            {type === 'Visa' || type === 'Mastercard' ? 'Last 4 digits' :
             type === 'PayMe' || type === 'Click'      ? 'Phone number' :
             type === 'Bank Transfer'                  ? 'Account number' : 'Details (optional)'}
          </label>
          <input className="form-control" style={{ maxWidth: 300 }}
            placeholder={
              type === 'Visa' || type === 'Mastercard' ? '**** **** **** 1234' :
              type === 'PayMe' || type === 'Click'     ? '+992 XX XXX XXXX' : ''
            }
            value={identifier}
            onChange={e => setId(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading || !type} style={{ minWidth: 140 }}>
          {loading ? <span className="spinner" /> : 'Save'}
        </button>
      </form>
    </div>
  );
}

// ── Security ──────────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setError('New passwords do not match'); return;
    }
    setLoading(true); setMsg(''); setError('');
    try {
      await authApi.changePassword({ current_password: form.current_password, new_password: form.new_password });
      setMsg('Password changed successfully!');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h2 className="tab-title">Change Password</h2>
      {msg   && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="form-group">
        <label>Current Password</label>
        <input className="form-control" type="password" value={form.current_password} onChange={set('current_password')} required />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input className="form-control" type="password" placeholder="Min 6 characters" value={form.new_password} onChange={set('new_password')} required />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input className="form-control" type="password" value={form.confirm} onChange={set('confirm')} required />
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ minWidth: 180 }}>
        {loading ? <span className="spinner" /> : 'Change Password'}
      </button>
    </form>
  );
}

// ── Completed Jobs ────────────────────────────────────────────────────────────

function CompletedJobsTab({ jobs, loading, role, navigate, open, setOpen }) {
  return (
    <div>
      <button className="accordion-toggle" style={{ width: '100%' }} onClick={() => setOpen(o => !o)}>
        <span className="accordion-title">
          Completed Jobs
          {!loading && jobs.length > 0 && <span className="accordion-count">{jobs.length}</span>}
        </span>
        <span className={`accordion-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div style={{ paddingTop: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)', fontSize: 14 }}>
              No completed jobs yet
            </div>
          ) : (
            <div className="completed-list">
              {jobs.map(job => (
                <div key={job.id} className="completed-job">
                  <div className="completed-header">
                    <div>
                      <div className="job-title-small">{job.title}</div>
                      <div className="job-meta-small">
                        {role === 'customer' ? (
                          <span className="tradesman-link" onClick={() => navigate(`/tradesman/${job.tradesman_id}`)}>
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
                  {job.offered_fee && <div className="completed-fee">💰 {job.offered_fee} TJS</div>}
                  {role === 'customer' && job.tradesman_id && (
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}
                      onClick={() => navigate(`/tradesman/${job.tradesman_id}`)}>
                      View Tradesman Profile →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
