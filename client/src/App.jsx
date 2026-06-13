import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectListPage from './pages/ProjectListPage.jsx';
import DeploymentDetailsPage from './pages/DeploymentDetailsPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import { Layout, LogOut, Shield, Database, Terminal, User as UserIcon } from './components/Icons.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-shell animate-fade-in">
      <header className="header">
        <div className="container header-container">
          <div className="logo-group" onClick={() => navigate('/dashboard')}>
            <Layout size={20} />
            <span>AI DASHBOARD</span>
          </div>

          <nav className="nav-links">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/projects" className={`nav-link ${isActive('/projects')}`}>Projects</Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>API Keys</Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserIcon size={14} />
                {user?.name}
              </span>
              <span className={`badge ${user?.role === 'Admin' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                {user?.role}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Log out">
                <LogOut size={14} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:id" element={<DeploymentDetailsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <div>© {new Date().getFullYear()} AI Dashboard. Powered by SQLite & React.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Database size={12} /> SQLite Local</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={12} /> Role-Based Control</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Terminal size={12} /> Deployment Timelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
