import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    });
    return unsub;
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (location.pathname === '/admin/login') {
    return <Outlet />;
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
