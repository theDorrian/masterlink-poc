import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import TradesmanDetailPage from './pages/TradesmanDetailPage';
import JobRequestPage from './pages/JobRequestPage';
import MyJobsPage from './pages/MyJobsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import TradesmanDashboard from './pages/TradesmanDashboard';
import InboxPage from './pages/InboxPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, role } = useAuth();

  // /home is the post-login destination; / always shows the landing page
  const homeRedirect = role === 'tradesman' ? '/dashboard' : '/search';

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={user ? <Navigate to={homeRedirect} /> : <Navigate to="/" />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about"    element={<AboutPage />} />
        <Route path="/search"   element={<SearchPage />} />
        <Route path="/tradesman/:id" element={<TradesmanDetailPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><TradesmanDashboard /></ProtectedRoute>} />
        <Route path="/job-request/:tradesmanId" element={<ProtectedRoute><JobRequestPage /></ProtectedRoute>} />
        <Route path="/inbox"    element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
        <Route path="/my-jobs"  element={<ProtectedRoute><MyJobsPage /></ProtectedRoute>} />
        <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
