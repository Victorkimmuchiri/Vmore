import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setCheckingAuth(false);
      if (!u && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    });
    return unsub;
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (checkingAuth) {
    return (
      <div className="admin-loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-deep, #0c0c0e)',
        color: 'var(--gold, #d4af37)',
        fontFamily: 'var(--font-sans, sans-serif)',
        fontSize: '1.25rem',
        letterSpacing: '0.1em'
      }}>
        Checking credentials...
      </div>
    );
  }

  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>VMORE</h2>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' || location.pathname.includes('/dashboard') ? 'active' : ''}>
            📊 Dashboard
          </Link>
          <Link to="/admin/products" className={location.pathname.includes('/products') ? 'active' : ''}>
            ✨ Products (CRUD)
          </Link>
          <Link to="/admin/story" className={location.pathname.includes('/story') ? 'active' : ''}>
            📖 Our Story (CRUD)
          </Link>
          <Link to="/admin/orders" className={location.pathname.includes('/orders') ? 'active' : ''}>
            🛒 Orders
          </Link>
          <Link to="/admin/messages" className={location.pathname.includes('/messages') ? 'active' : ''}>
            ✉️ Messages
          </Link>
          <Link to="/admin/subscribers" className={location.pathname.includes('/subscribers') ? 'active' : ''}>
            📧 Subscribers
          </Link>
          <Link to="/admin/campaigns" className={location.pathname.includes('/campaigns') ? 'active' : ''}>
            ✉️ Email Campaigns
          </Link>
          <Link to="/admin/reviews" className={location.pathname.includes('/reviews') ? 'active' : ''}>
            💬 Product Reviews
          </Link>
          <Link to="/admin/settings" className={location.pathname.includes('/settings') ? 'active' : ''}>
            ⚙️ Hero Settings
          </Link>
        </nav>
        <button onClick={handleLogout} className="admin-logout">Sign Out →</button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
