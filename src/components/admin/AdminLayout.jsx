import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Admin.css';

const NAV_ITEMS = [
  { to: '/admin',            icon: '📊', label: 'Dashboard',       match: p => p === '/admin' || p.includes('/dashboard') },
  { to: '/admin/products',   icon: '✨', label: 'Products',         match: p => p.includes('/products') },
  { to: '/admin/orders',     icon: '🛒', label: 'Orders',           match: p => p.includes('/orders') },
  { to: '/admin/reviews',    icon: '💬', label: 'Reviews',          match: p => p.includes('/reviews') },
  { to: '/admin/messages',   icon: '✉️', label: 'Messages',         match: p => p.includes('/messages') },
  { to: '/admin/subscribers',icon: '📧', label: 'Subscribers',      match: p => p.includes('/subscribers') },
  { to: '/admin/campaigns',  icon: '📣', label: 'Campaigns',        match: p => p.includes('/campaigns') },
  { to: '/admin/story',      icon: '📖', label: 'Our Story',        match: p => p.includes('/story') },
  { to: '/admin/settings',   icon: '⚙️', label: 'Hero Settings',    match: p => p.includes('/settings') },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

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
      <div className="admin-auth-check">
        <div className="admin-auth-spinner" />
        <span>Checking credentials…</span>
      </div>
    );
  }

  if (location.pathname === '/admin/login') return <Outlet />;
  if (!user) return null;

  return (
    <div className="admin-layout">
      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-inner">
            <div>
              <h2>VMORE</h2>
              <span>Admin Panel</span>
            </div>
            {/* Close button on mobile */}
            <button
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="admin-nav" role="navigation" aria-label="Admin navigation">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={item.match(location.pathname) ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="admin-logout">
          <span>↩</span> Sign Out
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main-wrapper">
        {/* Mobile topbar */}
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="admin-topbar-brand">
            <span>VMORE</span>
            <small>Admin</small>
          </div>
          <div className="admin-topbar-actions">
            <button onClick={handleLogout} className="admin-topbar-logout" aria-label="Sign out">
              ↩
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
