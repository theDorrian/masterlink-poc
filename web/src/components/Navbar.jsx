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
            <Link to="/search" className="navbar-link">Search</Link>
            <Link to="/my-jobs" className="navbar-link">
              {role === 'tradesman' ? 'Requests' : 'My Jobs'}
            </Link>
            <Link to="/profile" className="navbar-link">Profile</Link>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="navbar-right">
            <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
