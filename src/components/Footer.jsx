import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || status === 'submitting') return;
    
    setStatus('submitting');
    try {
      // Check for duplicate subscription using doc ID for security
      const docRef = doc(db, 'subscribers', cleanEmail);
      let isDuplicate = false;
      
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          isDuplicate = true;
        }
      } catch (readErr) {
        console.warn("Duplicate check skipped due to permissions:", readErr);
      }

      if (isDuplicate) {
        setStatus('duplicate');
        return;
      }

      await setDoc(docRef, {
        email: cleanEmail,
        createdAt: new Date().toISOString()
      });

      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setStatus('error');
    }
  };

  return (
    <footer className="footer">
      <div className="footer__gold-line" />
      <br></br>
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
          <form className="footer__form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Your email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'submitting'}
            />
            <button 
              type="submit" 
              className="btn btn-gold" 
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? '...' : 'Join'}
            </button>
          </form>
          {status === 'success' && (
            <p className="footer__status-success">Thank you for subscribing!</p>
          )}
          {status === 'duplicate' && (
            <p className="footer__status-info">This email is already subscribed.</p>
          )}
          {status === 'error' && (
            <p className="footer__status-error">Failed to subscribe. Please try again.</p>
          )}
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
};

export default Footer;
