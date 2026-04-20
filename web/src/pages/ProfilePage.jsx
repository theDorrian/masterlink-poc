import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi, jobsApi, reviewsApi } from '../api/client';
import AvatarCropModal from '../components/AvatarCropModal';
import './ProfilePage.css';

const PAYMENT_TYPES = ['Visa', 'Mastercard', 'PayMe', 'Click', 'Bank Transfer', 'Cash'];
const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler'];

export default function ProfilePage() {
  const { user, role, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [avatarSrc, setAvatarSrc]           = useState(null); // objectURL open in crop modal
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError]         = useState('');
  const avatarFileRef = useRef(null);

  useEffect(() => {
    authApi.me().then(res => setProfile(res.data.profile));
    jobsApi.mine()
      .then(res => setCompletedJobs((res.data.jobs || []).filter(j => j.status === 'completed')))
      .finally(() => setLoadingJobs(false));
    if (role === 'tradesman') {
      reviewsApi.mine().then(res => setReviews(res.data.reviews || []));
    }
  }, []);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const handleAvatarFileSelect = e => {
    const file = e.target.files?.[0];
    if (avatarFileRef.current) avatarFileRef.current.value = '';
    if (!file) return;
    setAvatarError('');

    if (!file.type.startsWith('image/')) { setAvatarError('Please select an image file'); return; }
    if (file.size > 20 * 1024 * 1024)   { setAvatarError('File must be under 20 MB'); return; }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < 150 || img.naturalHeight < 150) {
        URL.revokeObjectURL(url);
        setAvatarError('Image must be at least 150 × 150 px');
        return;
      }
      setAvatarSrc(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setAvatarError('Could not read image'); };
    img.src = url;
  };

  const handleCropSave = async dataUrl => {
    const toRevoke = avatarSrc;
    setAvatarSrc(null);
    URL.revokeObjectURL(toRevoke);
    setAvatarError('');
    setAvatarUploading(true);
    try {
      await authApi.uploadAvatar(dataUrl);
    } catch {
      setAvatarError('Upload failed — please try again');
      setAvatarUploading(false);
      return;
    }
    // Upload succeeded — refresh display; failure here is non-critical
    try { await refreshUser(); } catch { /* will reflect on next page load */ }
    setAvatarUploading(false);
  };

  const handleCropClose = () => {
    URL.revokeObjectURL(avatarSrc);
    setAvatarSrc(null);
  };

  let parsed = null;
  try {
    if (user.payment_method) parsed = JSON.parse(user.payment_method);
  } catch (e) {
    parsed = null;
  }

  return (
    <div className="page-wrap profile-wrap">

      {/* ── Profile card ── */}
      <div className="card profile-card">
        <div className="profile-avatar-wrap">
          <div
            className="profile-avatar"
            onClick={() => !avatarUploading && avatarFileRef.current?.click()}
            title="Change profile picture"
          >
            {avatarUploading
              ? <span className="spinner" style={{ width: 26, height: 26, borderTopColor: '#fff' }} />
              : <img src={user.avatar_url || '/default-avatar.svg'} alt={user.name} className="avatar-img" />}
            {!avatarUploading && (
              <div className="avatar-cam-hint">
                <svg width="15" height="14" viewBox="0 0 20 18" fill="white" aria-hidden="true">
                  <path d="M7 1 5.5 3H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2.5L13 1H7Zm3 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/>
                </svg>
              </div>
            )}
          </div>
          <input ref={avatarFileRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleAvatarFileSelect} />
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <span className={`badge ${role === 'tradesman' ? 'badge-orange' : 'badge-blue'}`}
              style={{ marginTop: 6, display: 'inline-block' }}>
              {role === 'tradesman' ? 'Tradesman' : 'Customer'}
            </span>
            {avatarError && <div className="avatar-error">{avatarError}</div>}
          </div>
        </div>

        <div className="profile-details">
          {[
            ['Name',         user.name],
            ['Email',        user.email],
            ['Role',         role === 'tradesman' ? 'Tradesman' : 'Customer'],
            ['Member Since', new Date(user.created_at).toLocaleDateString('en-GB')],
          ].map(([label, value]) => (
            <div key={label} className="profile-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}

          <div className="profile-row">
            <span>Balance</span>
            <strong style={{ color: 'var(--primary)' }}>{(user.balance || 0).toFixed(0)} TJS</strong>
          </div>

          {(user.frozen_balance || 0) > 0 && (
            <div className="profile-row">
              <span>Frozen (escrow)</span>
              <strong style={{ color: 'var(--gray-400)' }}>{user.frozen_balance.toFixed(0)} TJS</strong>
            </div>
          )}

          {parsed && (
            <div className="profile-row">
              <span>Payment</span>
              <strong>💳 {parsed.type}{parsed.identifier ? ` · ${parsed.identifier}` : ''}</strong>
            </div>
          )}
        </div>

        <button className="btn btn-secondary profile-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* ── Settings card ── */}
      <div className="card settings-card">
        <h2 className="settings-heading">Settings</h2>

        <SettingsSection title="Edit Profile">
          <EditProfileSection
            user={user} role={role} profile={profile}
            onSaved={(newUser, newProfile) => { refreshUser(); if (newProfile) setProfile(newProfile); }}
          />
        </SettingsSection>

        <SettingsSection title="Balance & Top Up">
          <BalanceSection user={user} onUpdated={refreshUser} />
        </SettingsSection>

        <SettingsSection title="Payment Method">
          <PaymentSection user={user} onUpdated={refreshUser} />
        </SettingsSection>

        <SettingsSection title="Change Password" last>
          <PasswordSection />
        </SettingsSection>
      </div>

      {/* ── Job history ── */}
      <div className="card accordion-card">
        <button className="accordion-toggle" onClick={() => setJobsOpen(o => !o)}>
          <span className="accordion-title">
            {role === 'customer' ? 'Job History' : 'Completed Jobs'}
            {!loadingJobs && completedJobs.length > 0 && (
              <span className="accordion-count">{completedJobs.length}</span>
            )}
          </span>
          <span className={`accordion-chevron ${jobsOpen ? 'open' : ''}`}>▾</span>
        </button>

        {jobsOpen && (
          <div className="accordion-body">
            {loadingJobs ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
              </div>
            ) : completedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)', fontSize: 14 }}>
                {role === 'customer' ? 'No jobs in your history yet' : 'No completed jobs yet'}
              </div>
            ) : (
              <div className="completed-list">
                {completedJobs.map(job => (
                  <div key={job.id} className="completed-job">
                    <div className="completed-header">
                      <div>
                        <div className="job-title-small">{job.title}</div>
                        <div className="job-meta-small">
                          {role === 'customer' ? (
                            <span className="tradesman-link"
                              onClick={() => navigate(`/tradesman/${job.tradesman_id}`)}>
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
                    {job.final_fee
                      ? <div className="completed-fee">💸 Paid: <strong>{job.final_fee} TJS</strong>{job.hours_worked ? ` (${job.hours_worked % 1 === 0 ? job.hours_worked : job.hours_worked.toFixed(1)} hrs)` : ''}</div>
                      : job.offered_fee
                        ? <div className="completed-fee">💰 Budget: {job.offered_fee} TJS</div>
                        : null
                    }
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
      {avatarSrc && (
        <AvatarCropModal src={avatarSrc} onSave={handleCropSave} onClose={handleCropClose} />
      )}

      {/* ── Reviews (tradesman only) ── */}
      {role === 'tradesman' && (
        <div className="card accordion-card">
          <button className="accordion-toggle" onClick={() => setReviewsOpen(o => !o)}>
            <span className="accordion-title">
              My Reviews
              {reviews.length > 0 && <span className="accordion-count">{reviews.length}</span>}
            </span>
            <span className={`accordion-chevron ${reviewsOpen ? 'open' : ''}`}>▾</span>
          </button>
          {reviewsOpen && (
            <div className="accordion-body">
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)', fontSize: 14 }}>
                  No reviews yet
                </div>
              ) : (
                <div className="completed-list">
                  {reviews.map(r => (
                    <div key={r.id} className="completed-job">
                      <div className="completed-header">
                        <div>
                          <div className="job-title-small">{r.job_title}</div>
                          <div className="job-meta-small">by {r.reviewer_name}</div>
                        </div>
                        <div className="review-stars">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      </div>
                      {r.comment && <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: '6px 0 0', lineHeight: 1.5 }}>{r.comment}</p>}
                      <div className="completed-date" style={{ marginTop: 6 }}>
                        {new Date(r.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reusable collapsible settings section ─────────────────────────────────────

function SettingsSection({ title, children, last }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`settings-section ${last ? 'last' : ''}`}>
      <button className="settings-row" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className={`accordion-chevron ${open ? 'open' : ''}`} style={{ fontSize: 16 }}>▾</span>
      </button>
      {open && <div className="settings-body">{children}</div>}
    </div>
  );
}

// ── Edit Profile ──────────────────────────────────────────────────────────────

function EditProfileSection({ user, role, profile, onSaved }) {
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
  const [msg, setMsg]   = useState('');
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      const res = await authApi.updateProfile(form);
      onSaved(res.data.user, res.data.profile);
      setMsg('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
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
                  onClick={() => setForm(f => ({ ...f, trade: t }))}>{t}</button>
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

function BalanceSection({ user, onUpdated }) {
  const [topUpAmount, setTopUpAmount]       = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');

  const handleTopUp = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await authApi.topUp(parseFloat(topUpAmount));
      await onUpdated();
      setMsg(`${topUpAmount} TJS added to your balance!`);
      setTopUpAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleWithdraw = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await authApi.withdraw(parseFloat(withdrawAmount));
      await onUpdated();
      setMsg(`${withdrawAmount} TJS withdrawn successfully!`);
      setWithdrawAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="balance-row">
        <div className="balance-pill available">
          Available <strong>{(user.balance || 0).toFixed(0)} TJS</strong>
        </div>
        {(user.frozen_balance || 0) > 0 && (
          <div className="balance-pill frozen">
            Frozen <strong>{user.frozen_balance.toFixed(0)} TJS</strong>
          </div>
        )}
      </div>
      {msg   && <div className="success-msg" style={{ marginTop: 12 }}>{msg}</div>}
      {error && <div className="error-msg"   style={{ marginTop: 12 }}>{error}</div>}
      <form onSubmit={handleTopUp} style={{ display: 'flex', gap: 10, maxWidth: 340, marginTop: 14 }}>
        <input className="form-control" type="number" min="1" placeholder="Amount in TJS"
          value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} required />
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? <span className="spinner" /> : '+ Add Funds'}
        </button>
      </form>
      <form onSubmit={handleWithdraw} style={{ display: 'flex', gap: 10, maxWidth: 340, marginTop: 10 }}>
        <input className="form-control" type="number" min="1" placeholder="Amount in TJS"
          value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} required />
        <button className="btn btn-secondary" type="submit" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? <span className="spinner spinner-dark" /> : '− Withdraw'}
        </button>
      </form>
    </div>
  );
}

// ── Payment Method ────────────────────────────────────────────────────────────

function PaymentSection({ user, onUpdated }) {
  let parsed = null;
  try {
    if (user.payment_method) parsed = JSON.parse(user.payment_method);
  } catch (e) {
    parsed = null;
  }

  const [type, setType]       = useState(parsed?.type || '');
  const [identifier, setId]   = useState(parsed?.identifier || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await authApi.setPaymentMethod(JSON.stringify({ type, identifier }));
      await onUpdated();
      setMsg('Payment method saved!');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSave}>
      {msg   && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label>Type</label>
        <div className="trade-pills">
          {PAYMENT_TYPES.map(pt => (
            <button key={pt} type="button"
              className={`trade-pill ${type === pt ? 'active' : ''}`}
              onClick={() => setType(pt)}>{pt}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>
          {type === 'Visa' || type === 'Mastercard' ? 'Last 4 digits' :
           type === 'PayMe' || type === 'Click'      ? 'Phone number' :
           type === 'Bank Transfer'                  ? 'Account number' : 'Details (optional)'}
        </label>
        <input className="form-control" style={{ maxWidth: 280 }}
          placeholder={type === 'Visa' || type === 'Mastercard' ? '**** 1234' : ''}
          value={identifier} onChange={e => setId(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading || !type} style={{ minWidth: 140 }}>
        {loading ? <span className="spinner" /> : 'Save'}
      </button>
    </form>
  );
}

// ── Change Password ───────────────────────────────────────────────────────────

function PasswordSection() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]   = useState('');
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setMsg(''); setError('');
    try {
      await authApi.changePassword({ current_password: form.current_password, new_password: form.new_password });
      setMsg('Password changed successfully!');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      {msg   && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label>Current Password</label>
        <input className="form-control" type="password" value={form.current_password} onChange={set('current_password')} required />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input className="form-control" type="password" placeholder="Min 8 characters" value={form.new_password} onChange={set('new_password')} required />
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

