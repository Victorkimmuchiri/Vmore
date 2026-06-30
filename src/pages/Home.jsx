import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const { products, siteContent } = useContext(StoreContext);
  const featured = products.filter(p => p.featured).slice(0, 4);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <div className="home">

      {/* ════ Hero ════ */}
      <section className="hero">
        <div className="hero__bg">
          <img src="/images/hero-bg.png" alt="" className="hero__bg-img" />
          <div className="hero__overlay" />
        </div>
        <div className="container hero__content">
          <span className="hero__eyebrow">Preserving Culture · Crafting Memories</span>
          <h1 className="hero__title">{siteContent?.heroTitle || 'Heritage in Every Thread'}</h1>
          <p className="hero__sub">
            {siteContent?.heroSubtitle || 'Discover handcrafted African artifacts, textiles, and jewelry that tell a story of rhythm, culture, and timeless artistry.'}
          </p>
          <div className="hero__actions">
            <Link to="/collection" className="btn btn-gold">Explore Collection</Link>
            <Link to="/our-story" className="btn btn-outline">Our Story</Link>
          </div>
        </div>
      </section>

      {/* ════ Categories ════ */}
      <section className="categories container" ref={addRevealRef}>
        <div className="section-head reveal" ref={addRevealRef}>
          <span className="section-head__eyebrow">Shop by Category</span>
          <h2>Our Collections</h2>
        </div>

        <div className="categories__grid reveal" ref={addRevealRef}>
          {[
            { name: 'Fine Jewelry', tag: 'Sacred Melody', cat: 'Jewelry', img: '/images/adinkra-pendant.png' },
            { name: 'Textiles', tag: 'Deep Resonance', cat: 'Textiles', img: '/images/sankofa-wrap.png' },
            { name: 'Accessories', tag: 'High Vibe', cat: 'Accessories', img: '/images/treble-brooch.png' },
          ].map((c, i) => (
            <Link to={`/collection?cat=${c.cat}`} key={i} className="cat-card">
              <div className="cat-card__img-wrap">
                <img src={c.img} alt={c.name} className="cat-card__img" />
              </div>
              <div className="cat-card__info">
                <span className="cat-card__tag">{c.tag}</span>
                <h3>{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════ Featured Pieces ════ */}
      <section className="featured container" ref={addRevealRef}>
        <div className="section-head reveal" ref={addRevealRef}>
          <span className="section-head__eyebrow">Curated Selection</span>
          <h2>Featured Pieces</h2>
        </div>

        <div className="featured__grid reveal" ref={addRevealRef}>
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="featured__cta reveal" ref={addRevealRef}>
          <Link to="/collection" className="btn btn-outline">View All Pieces</Link>
        </div>
      </section>

      {/* ════ Story Preview ════ */}
      <section className="story-preview reveal" ref={addRevealRef}>
        <div className="container story-preview__inner">
          <div className="story-preview__img-wrap">
            <img src="/images/kora-cuff.png" alt="Artisan craftsmanship" className="story-preview__img" />
          </div>
          <div className="story-preview__text">
            <span className="section-head__eyebrow">The Artisan</span>
            <h2>Preserving Culture,<br /><em>Crafting Memories</em></h2>
            <p>
              As a piano and music theory tutor, vocalist, and member of Ghetto Classics Art of Music, I bring an authentic understanding of the themes woven into every piece.
            </p>
            <p>
              Each design carries the soul of African musical traditions — from the rhythms of percussion to the harmony of stringed instruments. This isn't just jewelry. It's identity, tradition, and storytelling you can wear.
            </p>
            <Link to="/our-story" className="btn btn-outline">Read Full Story →</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
