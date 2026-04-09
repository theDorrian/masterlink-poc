import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="page-wrap" style={{ maxWidth: 600 }}>
      <h1 className="page-title">Profile</h1>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--orange)', color: '#fff', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.name?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{user.name}</div>
            <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>{user.email}</div>
            <span className={`badge ${role === 'tradesman' ? 'badge-orange' : 'badge-blue'}`} style={{ marginTop: 6 }}>
              {role === 'tradesman' ? 'Tradesman' : 'Customer'}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 15 }}>
            <span style={{ color: 'var(--gray-500)' }}>Name</span>
            <strong>{user.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 15 }}>
            <span style={{ color: 'var(--gray-500)' }}>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 15 }}>
            <span style={{ color: 'var(--gray-500)' }}>Role</span>
            <strong style={{ textTransform: 'capitalize' }}>{role}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15 }}>
            <span style={{ color: 'var(--gray-500)' }}>Member since</span>
            <strong>{new Date(user.created_at).toLocaleDateString()}</strong>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ marginTop: 24, width: '100%', color: 'var(--red)', borderColor: '#FCA5A5' }}
          onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
