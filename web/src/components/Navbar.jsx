import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/client';
import './Navbar.css';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(function() {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Poll for unread notifications every 30 seconds
  useEffect(function() {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    function fetchUnread() {
      notificationsApi.getAll()
        .then(function(res) {
          setUnreadCount(res.data.unread_count || 0);
        })
        .catch(function() {
          // silently ignore polling errors
        });
    }

    fetchUnread();
    var interval = setInterval(fetchUnread, 30000);
    return function() {
      clearInterval(interval);
    };
  }, [user]);

  function handleLogout() {
    setOpen(false);
    setMenuOpen(false);
    logout();
    navigate('/');
  }

  function closeMobile() {
    setMenuOpen(false);
  }

  // Build initials from user name
  var initials = '';
  if (user) {
    var parts = user.name.split(' ');
    for (var i = 0; i < parts.length && initials.length < 2; i++) {
      if (parts[i].length > 0) {
        initials += parts[i][0].toUpperCase();
      }
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-logo">
          Master<span>Link</span>
        </Link>

        {/* Desktop navigation */}
        <div className="navbar-right">
          {role === 'tradesman' && (
            <NavLink to="/dashboard" className={function({ isActive }) { return 'navbar-link' + (isActive ? ' active' : ''); }}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/search" className={function({ isActive }) { return 'navbar-link' + (isActive ? ' active' : ''); }}>
            Search
          </NavLink>
          <NavLink to="/about" className={function({ isActive }) { return 'navbar-link' + (isActive ? ' active' : ''); }}>
            About Us
          </NavLink>

          <div className="navbar-sep" />

          {user ? (
            <>
              {/* Notification bell */}
              <Link to="/inbox" className="navbar-bell" title="Inbox">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="navbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>

              <div className="avatar-menu" ref={dropdownRef}>
                <button
                  className="avatar-btn"
                  onClick={function() { setOpen(function(prev) { return !prev; }); }}
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
                    <Link to="/inbox" className="dropdown-item" onClick={function() { setOpen(false); }}>
                      <Bell size={15} className="di-icon" />
                      Inbox
                      {unreadCount > 0 && <span className="dropdown-badge">{unreadCount}</span>}
                    </Link>
                    <Link to="/my-jobs" className="dropdown-item" onClick={function() { setOpen(false); }}>
                      <ClipboardList size={15} className="di-icon" />
                      {role === 'tradesman' ? 'Requests' : 'My Jobs'}
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={function() { setOpen(false); }}>
                      <User size={15} className="di-icon" />Profile
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <LogOut size={15} className="di-icon" />Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="mobile-menu-btn"
          onClick={function() { setMenuOpen(function(prev) { return !prev; }); }}
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
            <NavLink to="/dashboard" className={function({ isActive }) { return 'mobile-nav-link' + (isActive ? ' active' : ''); }} onClick={closeMobile}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/search" className={function({ isActive }) { return 'mobile-nav-link' + (isActive ? ' active' : ''); }} onClick={closeMobile}>
            Search
          </NavLink>
          <NavLink to="/about" className={function({ isActive }) { return 'mobile-nav-link' + (isActive ? ' active' : ''); }} onClick={closeMobile}>
            About Us
          </NavLink>

          {user ? (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/inbox" className="mobile-nav-link" onClick={closeMobile}>
                Inbox {unreadCount > 0 && '(' + unreadCount + ')'}
              </Link>
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
