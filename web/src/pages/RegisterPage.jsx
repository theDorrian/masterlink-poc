import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import AvatarCropModal from '../components/AvatarCropModal';
import './AuthPages.css';

const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler'];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', trade: '', hourly_rate: '', city: '' });
  const [avatarDataUrl, setAvatarDataUrl] = useState(null); // base64 ready to send
  const [avatarSrc, setAvatarSrc]         = useState(null); // objectURL for crop modal
  const [avatarError, setAvatarError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAvatarClick = () => {
    setAvatarError('');
    fileRef.current?.click();
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;

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

  const handleCropSave = dataUrl => {
    URL.revokeObjectURL(avatarSrc);
    setAvatarSrc(null);
    setAvatarDataUrl(dataUrl);
    setAvatarError('');
  };

  const handleCropClose = () => {
    URL.revokeObjectURL(avatarSrc);
    setAvatarSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'tradesman' && !avatarDataUrl) {
      setAvatarError('Profile photo is required for tradesmen');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'tradesman') {
        payload.trade = form.trade;
        payload.hourly_rate = parseFloat(form.hourly_rate);
        payload.city = form.city;
      }
      if (avatarDataUrl) payload.avatar_url = avatarDataUrl;

      const res = await authApi.register(payload);
      login(res.data.token, res.data.user);
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">Master<span>Link</span></div>
        <h1 className="auth-title">Create an account</h1>

        <div className="role-toggle">
          <button type="button"
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}>Customer</button>
          <button type="button"
            className={`role-btn ${role === 'tradesman' ? 'active' : ''}`}
            onClick={() => setRole('tradesman')}>Tradesman</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Avatar picker */}
          <div className="form-group">
            <label>
              Profile Photo{role === 'tradesman' ? ' *' : ' (optional)'}
            </label>
            <div className="reg-avatar-wrap">
              <div
                className="reg-avatar"
                onClick={handleAvatarClick}
                title="Choose profile photo"
              >
                <img
                  src={avatarDataUrl || '/default-avatar.svg'}
                  alt="Profile"
                  className="reg-avatar-img"
                />
                <div className="avatar-cam-hint">
                  <svg width="15" height="14" viewBox="0 0 20 18" fill="white" aria-hidden="true">
                    <path d="M7 1 5.5 3H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2.5L13 1H7Zm3 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/>
                  </svg>
                </div>
              </div>
              <div className="reg-avatar-hint">
                {avatarDataUrl
                  ? <span className="reg-avatar-set">Photo set — click to change</span>
                  : <span>Click to upload a photo</span>}
                {avatarError && <div className="avatar-error">{avatarError}</div>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleFileChange} />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" placeholder="Your full name" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" placeholder="Your email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
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
              <div className="form-row">
                <div className="form-group">
                  <label>Hourly rate (TJS)</label>
                  <input className="form-control" type="number" placeholder="e.g. 120"
                    value={form.hourly_rate} onChange={set('hourly_rate')} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input className="form-control" placeholder="e.g. Dushanbe"
                    value={form.city} onChange={set('city')} required />
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary btn-lg auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">Already have an account?{' '}
          <Link to="/login">Log In</Link>
        </p>
      </div>

      {avatarSrc && (
        <AvatarCropModal src={avatarSrc} onSave={handleCropSave} onClose={handleCropClose} />
      )}
    </div>
  );
}
