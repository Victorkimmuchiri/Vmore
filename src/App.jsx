import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import OurStory from './pages/OurStory';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';

/* scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* Let fonts + images load, then hide splash */
    const t = setTimeout(() => {
      const splash = document.getElementById('splash');
      if (splash) splash.classList.add('hide');
      document.body.classList.remove('no-scroll');
      setReady(true);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <StoreProvider>
      <ScrollToTop />
      <div className="app-container">
        {!isAdmin && <Navbar />}
        {!isAdmin && <CartDrawer />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProducts />} />
              <Route path="login" element={<AdminLogin />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </main>
        {!isAdmin && <Footer />}
      </div>
    </StoreProvider>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
