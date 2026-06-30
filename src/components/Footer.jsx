import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__gold-line" />
    <div className="container footer__grid">

      <div className="footer__col footer__brand-col">
        <Link to="/" className="footer__logo">
          <img src="/images/logo.jpg" alt="Vmore" className="footer__logo-img" />
          <div>
            <span className="footer__logo-name">VMORE</span>
            <span className="footer__logo-sub">GIFT SHOP</span>
          </div>
        </Link>
        <p className="footer__tagline">
          Preserving Culture, Crafting Memories.<br />
          Handcrafted heritage pieces inspired by the soul of African musical traditions.
        </p>
      </div>

      <div className="footer__col">
        <h4>Explore</h4>
        <ul>
          <li><Link to="/collection">All Pieces</Link></li>
          <li><Link to="/collection?cat=Jewelry">Jewelry</Link></li>
          <li><Link to="/collection?cat=Textiles">Textiles</Link></li>
          <li><Link to="/collection?cat=Accessories">Accessories</Link></li>
        </ul>
      </div>

      <div className="footer__col">
        <h4>Company</h4>
        <ul>
          <li><Link to="/our-story">Our Story</Link></li>
          <li><a href="#">Artisan Partners</a></li>
          <li><a href="#">Sustainability</a></li>
          <li><a href="#">Press</a></li>
        </ul>
      </div>

      <div className="footer__col">
        <h4>Stay Connected</h4>
        <p className="footer__newsletter-text">Subscribe for new arrivals and exclusive offers.</p>
        <form className="footer__form" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Your email" required />
          <button type="submit" className="btn btn-gold">Join</button>
        </form>
      </div>
    </div>

    <div className="footer__bottom container">
      <span>&copy; {new Date().getFullYear()} Vmore Gift Shop. All rights reserved.</span>
      <span className="footer__bottom-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </span>
    </div>
  </footer>
);

export default Footer;
