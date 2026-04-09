import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import './AuthPages.css';

const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler', 'Decorator'];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', trade: '', hourly_rate: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'tradesman') {
        payload.trade = form.trade;
        payload.hourly_rate = parseFloat(form.hourly_rate);
        payload.city = form.city;
      }
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
        <div className="auth-logo">Master<span>L</span>ink</div>
        <h1 className="auth-title">Create account</h1>

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
            <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
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
                  <label>Hourly Rate (£)</label>
                  <input className="form-control" type="number" placeholder="e.g. 75"
                    value={form.hourly_rate} onChange={set('hourly_rate')} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input className="form-control" placeholder="e.g. London"
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
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
