import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import './OurStory.css';

const WHATSAPP_LINK = 'https://api.whatsapp.com/send/?phone=254723740714&text=I%27d+love+to+learn+more+about+VMORE+Gift+Shop&type=phone_number&app_absent=0';
const PHONE_NUMBER  = '+254723740714';

const defaultChapters = [
  {
    eyebrow: 'The Beginning',
    heading: 'Where Music Meets Purpose',
    body: [
      'As a Grade School piano tutor, Grade School theory tutor, a student at Ghetto Classics Art of Music, and an alumni of Kenya Conservatoire of Music, I have spent years immersed in the world of music.',
      "As a background vocalist in church and with the Suluhisho Band, I understand that music is more than sound — it's identity, tradition, and storytelling.",
    ],
    img: '/images/Products/brass-africa-set.jpeg',
    reverse: false,
  },
  {
    eyebrow: 'The Vision',
    heading: 'Wear What You Play',
    body: [
      'VMORE Gift Shop was born from the realization that musicians and educators are often overlooked when it comes to personalized, symbolic accessories.',
      'There was no way for them to wear what they play, teach, and believe in — until now.',
    ],
    img: '/images/Products/brass-treble-clef-earrings.jpeg',
    reverse: true,
  },
  {
    eyebrow: 'The Craft',
    heading: 'Every Piece Carries a Story',
    body: [
      'Each piece draws from African instruments, Adinkra symbols, and motifs representing rhythm, harmony, and unity. Our jewelry is handcrafted with care, ethically made, and rich in meaning.',
      "Whether it's a brass cuff inspired by the Kora, or earrings echoing the shape of a Djembe, every design carries a story.",
    ],
    img: '/images/Products/beaded-set-black-white.jpeg',
    reverse: false,
  },
  {
    eyebrow: 'Who We Serve',
    heading: 'For Those Who Live Music',
    body: [
      'Our collections are ideal for performers, music teachers, composers, and institutions that celebrate global musical traditions.',
      "Whether it's stage wear, educational gifts, cultural events, or simply showcasing a love for music with purpose — VMORE Gift Shop speaks to those who understand that music lives beyond the stage.",
    ],
    img: '/images/Products/g-clef-wall-hanging.jpeg',
    reverse: true,
  },
];

const OurStory = () => {
  const [chapters, setChapters] = useState(defaultChapters);
  const revealRefs = useRef([]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const snap = await getDocs(collection(db, 'story_chapters'));
        if (!snap.empty) {
          let list = snap.docs.map(d => d.data());
          list.sort((a,b) => a.order - b.order);
          setChapters(list);
        }
      } catch (err) {
        console.log("Could not load dynamic story chapters, using defaults.");
      }
    };
    fetchChapters();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  const addRef = el => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <div className="story">

      {/* ── Hero ── */}
      <section className="story__hero">
        <div className="story__hero-bg">
          <img src="/images/Products/beaded-set-necklaces.jpeg" alt="" />
          <div className="story__hero-overlay" />
        </div>
        <div className="container story__hero-content">
          <span className="story__eyebrow">Our Story</span>
          <h1>The Rhythm <em>of Creation</em></h1>
          <p className="story__hero-sub">
            Where African craft, musical heritage, and purposeful design converge.
          </p>
        </div>
      </section>

      {/* ── Chapter Blocks ── */}
      <section className="story__body container">
        {chapters.map((ch, i) => (
          <div
            key={i}
            className={`story__block reveal ${ch.reverse ? 'story__block--reverse' : ''}`}
            ref={addRef}
          >
            <div className="story__block-img">
              <img src={ch.img} alt={ch.heading} />
            </div>
            <div className="story__block-text">
              <span className="story__chapter-eyebrow">{ch.eyebrow}</span>
              <h2>{ch.heading}</h2>
              {ch.body && ch.body.map((p, j) => <p key={j}>{p}</p>)}
            </div>
          </div>
        ))}
      </section>

      {/* ── Values strip ── */}
      <section className="story__values reveal" ref={addRef}>
        <div className="container story__values-inner">
          {[
            { icon: '🎵', label: 'Music-inspired' },
            { icon: '🌍', label: 'African Heritage' },
            { icon: '🤲', label: 'Ethically Handcrafted' },
            { icon: '🎓', label: 'Education-rooted' },
          ].map((v, i) => (
            <div key={i} className="story__value-item">
              <span className="story__value-icon">{v.icon}</span>
              <span className="story__value-label">{v.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Get in Touch ── */}
      <section className="story__contact reveal" ref={addRef}>
        <div className="container story__contact-inner">
          <span className="story__eyebrow">Get in Touch</span>
          <h2>Every piece has a story.<br /><em>I'd love to share it with you.</em></h2>
          <p>
            Create something custom, or help you find the perfect piece for your journey —
            whether it's stage wear, a gift, or a personal symbol of your musical identity.
          </p>
          <div className="story__contact-btns">
            <a
              href={WHATSAPP_LINK}
              className="btn btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Me
            </a>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="btn btn-outline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.7A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.36-.36a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Call Me
            </a>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="story__cta container reveal" ref={addRef}>
        <h2>Explore the Collection</h2>
        <p>Find the piece that resonates with your personal rhythm.</p>
        <Link to="/collection" className="btn btn-gold">Browse All Pieces</Link>
      </section>

    </div>
  );
};

export default OurStory;
