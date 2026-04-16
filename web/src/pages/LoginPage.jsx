import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
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
        <h1 className="auth-title">Добро пожаловать</h1>
        <p className="auth-sub">Войдите в свой аккаунт</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" placeholder="Введите email"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input className="form-control" type="password" placeholder="Введите пароль"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-lg auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Войти'}
          </button>
        </form>

        <div className="auth-divider"><span>или</span></div>
        <p className="auth-switch">Нет аккаунта?{' '}
          <Link to="/register">Зарегистрироваться</Link>
        </p>

        <p className="auth-demo">
          Демо: <code>sarvinoz@example.com</code> / <code>password123</code>
        </p>
      </div>
    </div>
  );
}
