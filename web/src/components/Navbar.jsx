import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? '/search' : '/'} className="navbar-logo">
          Master<span>L</span>ink
        </Link>

        {user ? (
          <div className="navbar-right">
            <Link to="/search" className="navbar-link">Поиск</Link>
            <Link to="/my-jobs" className="navbar-link">
              {role === 'tradesman' ? 'Заявки' : 'Мои заказы'}
            </Link>
            <Link to="/profile" className="navbar-link">Профиль</Link>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        ) : (
          <div className="navbar-right">
            <Link to="/login" className="btn btn-secondary btn-sm">Войти</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
