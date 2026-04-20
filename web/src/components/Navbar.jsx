import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMobile = () => setMenuOpen(false);

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-logo">
          Master<span>Link</span>
        </Link>

        {/* Desktop right cluster */}
        <div className="navbar-right">
          {role === 'tradesman' && (
            <NavLink to="/dashboard" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/search" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
            Search
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
            About Us
          </NavLink>

          <div className="navbar-sep" />

          {user ? (
            <div className="avatar-menu" ref={dropdownRef}>
              <button
                className="avatar-btn"
                onClick={() => setOpen(o => !o)}
                aria-label="Account menu"
              >
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} className="avatar-photo" />
                  : <span className="avatar-initials">{initials}</span>
                }
                <span className="avatar-chevron">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt={user.name} className="dropdown-avatar-img" />
                        : <span>{initials}</span>
                      }
                    </div>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-role">{role === 'tradesman' ? 'Tradesman' : 'Client'}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/my-jobs" className="dropdown-item" onClick={() => setOpen(false)}>
                    <ClipboardList size={15} className="di-icon" />
                    {role === 'tradesman' ? 'Requests' : 'My Jobs'}
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
                    <User size={15} className="di-icon" />Profile
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <LogOut size={15} className="di-icon" />Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <div className="mobile-nav">
          {user && (
            <div className="mobile-nav-user">
              <div className="mobile-nav-avatar">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} className="mobile-nav-avatar-img" />
                  : initials
                }
              </div>
              <div>
                <p className="mobile-nav-name">{user.name}</p>
                <p className="mobile-nav-role">{role === 'tradesman' ? 'Tradesman' : 'Client'}</p>
              </div>
            </div>
          )}

          {role === 'tradesman' && (
            <NavLink to="/dashboard" className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')} onClick={closeMobile}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/search" className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')} onClick={closeMobile}>
            Search
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')} onClick={closeMobile}>
            About Us
          </NavLink>

          {user ? (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/my-jobs" className="mobile-nav-link" onClick={closeMobile}>
                {role === 'tradesman' ? 'Requests' : 'My Jobs'}
              </Link>
              <Link to="/profile" className="mobile-nav-link" onClick={closeMobile}>Profile</Link>
              <div className="mobile-nav-divider" />
              <button className="mobile-nav-link mobile-nav-logout" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <div className="mobile-nav-auth">
              <Link to="/login" className="btn btn-secondary" onClick={closeMobile}>Log In</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobile}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
