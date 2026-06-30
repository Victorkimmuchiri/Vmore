import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import './OurStory.css';

const OurStory = () => {
  const { siteContent } = useContext(StoreContext);

  return (
    <div className="story">
      {/* Hero banner */}
      <section className="story__hero">
        <div className="story__hero-bg">
          <img src="/images/hero-bg.png" alt="" />
          <div className="story__hero-overlay" />
        </div>
        <div className="container story__hero-content">
          <span className="story__eyebrow">Our Story</span>
          <h1>{siteContent?.ourStoryTitle || 'The Heart Behind Every Piece'}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="container story__body">
        <div className="story__block">
          <div className="story__block-img">
            <img src="/images/talking-drum-bangle.png" alt="Craftsmanship" />
          </div>
          <div className="story__block-text">
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--sand)' }}>
              {siteContent?.ourStoryBody || 'Every piece in our collection carries the heartbeat of the artisans who crafted it...'}
            </div>
          </div>
        </div>

        <div className="story__cta">
          <h2>Join the Rhythm</h2>
          <p>Explore the collection and find the piece that resonates with your personal rhythm.</p>
          <Link to="/collection" className="btn btn-gold">Explore the Collection</Link>
        </div>
      </section>
    </div>
  );
};

export default OurStory;
