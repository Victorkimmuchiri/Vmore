import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import './Navbar.css';

const Navbar = () => {
  const { cartCount, toggleCart } = useContext(StoreContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">

        {/* Logo */}
        <Link to="/" className="nav__brand">
          <img src="/images/logo.jpg" alt="Vmore" className="nav__logo-img" />
          <div className="nav__brand-text">
            <span className="nav__brand-name">VMORE</span>
            <span className="nav__brand-sub">GIFT SHOP</span>
          </div>
        </Link>

        {/* Mobile Overlay */}
        <div 
          className={`nav__overlay ${menuOpen ? 'nav__overlay--open' : ''}`} 
          onClick={() => setMenuOpen(false)} 
        />

        {/* Desktop Nav */}
        <nav className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/collection" className={isActive('/collection')}>Collection</Link>
          <Link to="/our-story" className={isActive('/our-story')}>Our Story</Link>
          <Link to="/contact" className={isActive('/contact')}>Contact</Link>
        </nav>

        {/* Actions */}
        <div className="nav__actions">
          <button className="nav__icon-btn" onClick={toggleCart} aria-label="Open cart">
            {/* cart icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
          </button>

          <button
            className={`nav__hamburger ${menuOpen ? 'nav__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
