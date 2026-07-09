import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

// All top-level categories
const CATEGORIES = ['All Pieces', 'Jewelry', 'Textiles', 'Accessories'];

// Subcategory groupings
const SUBCATEGORIES = {
  Jewelry: ['Brass Set', 'Beaded Set', 'Bone Set', 'Shell Set'],
  Accessories: ['Bags', 'Musical Art'],
  Textiles: ['Textile'],
};

// Category metadata for the "shop by category" header cards
const CATEGORY_META = [
  {
    cat: 'Jewelry',
    label: 'Jewels',
    eyebrow: 'Brass · Beaded · Bone · Shell',
    img: '/images/Products/brass-africa-set.jpeg',
  },
  {
    cat: 'Accessories',
    label: 'Bags & Musical Art',
    eyebrow: 'Kiondoo · Gunia · Rope · Summer · G Clef',
    img: '/images/Products/kiondoo-sisal-bag.jpeg',
  },
  {
    cat: 'Textiles',
    label: 'Textiles',
    eyebrow: 'Lesso · Shuka · KR Blankets · Kitenge',
    img: '/images/Products/beach-lesso-red.jpeg',
  },
];

const Catalog = () => {
  const { products } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCat, setActiveCat] = useState('All Pieces');
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat && CATEGORIES.includes(cat)) {
      setActiveCat(cat);
    }
  }, [searchParams]);

  const handleCatChange = (cat) => {
    setActiveCat(cat);
    setActiveSubCat('All');
    if (cat === 'All Pieces') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', cat);
    }
    setSearchParams(searchParams);
  };

  // Base filter by category
  let filtered = activeCat === 'All Pieces'
    ? [...products]
    : products.filter(p => p.category === activeCat);

  // Subcategory filter
  if (activeSubCat !== 'All') {
    filtered = filtered.filter(p => p.subcategory === activeSubCat);
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q))
    );
  }

  const currentSubCats = SUBCATEGORIES[activeCat] || [];

  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  if (sortBy === 'featured') filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  // Group products by category+subcategory for "All Pieces" view
  const groupedSections = () => {
    const sections = [];
    const catOrder = ['Jewelry', 'Accessories', 'Textiles'];
    catOrder.forEach(cat => {
      const catProducts = filtered.filter(p => p.category === cat);
      if (catProducts.length === 0) return;
      const subs = SUBCATEGORIES[cat] || [];
      if (subs.length > 0) {
        subs.forEach(sub => {
          const subProducts = catProducts.filter(p => p.subcategory === sub);
          if (subProducts.length > 0) {
            sections.push({ heading: sub, eyebrow: cat, items: subProducts });
          }
        });
        // any unclassified in category
        const unclassified = catProducts.filter(p => !subs.includes(p.subcategory));
        if (unclassified.length > 0) {
          sections.push({ heading: cat, eyebrow: '', items: unclassified });
        }
      } else {
        sections.push({ heading: cat, eyebrow: '', items: catProducts });
      }
    });
    return sections;
  };

  const showGrouped = activeCat === 'All Pieces' && activeSubCat === 'All' && !searchQuery.trim() && sortBy === 'featured';

  return (
    <div className="catalog">
      {/* ── Header ── */}
      <div className="catalog__header">
        <div className="container">
          <span className="catalog__eyebrow">Full Collection</span>
          <h1>Our Pieces</h1>
          <p className="catalog__header-sub">
            Handcrafted jewellery, textiles, bags & musical art — all in one place.
          </p>
        </div>
      </div>

      {/* ── Category Cards ── */}
      {activeCat === 'All Pieces' && !searchQuery && (
        <div className="catalog__cat-cards container">
          {CATEGORY_META.map(m => (
            <button
              key={m.cat}
              className="catalog__cat-card"
              onClick={() => handleCatChange(m.cat)}
            >
              <div className="catalog__cat-card__img-wrap">
                <img src={m.img} alt={m.label} />
              </div>
              <div className="catalog__cat-card__info">
                <span className="catalog__cat-card__eyebrow">{m.eyebrow}</span>
                <h3>{m.label}</h3>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="container catalog__body">
        {/* ── Search ── */}
        <div className="catalog__search-wrapper">
          <input
            type="text"
            className="catalog__search-input"
            placeholder="Search pieces…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
          />
          <svg className="catalog__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>

        {/* ── Toolbar ── */}
        <div className="catalog__toolbar">
          {/* Main category tabs */}
          <div className="catalog__filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`catalog__filter-btn ${activeCat === cat ? 'active' : ''}`}
                onClick={() => handleCatChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="catalog__sort">
            <label htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="catalog__sort-select"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* ── Subcategory pills ── */}
        {currentSubCats.length > 0 && (
          <div className="catalog__subcategories">
            <button
              className={`catalog__subcat-btn ${activeSubCat === 'All' ? 'active' : ''}`}
              onClick={() => setActiveSubCat('All')}
            >
              All
            </button>
            {currentSubCats.map(sub => (
              <button
                key={sub}
                className={`catalog__subcat-btn ${activeSubCat === sub ? 'active' : ''}`}
                onClick={() => setActiveSubCat(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <p className="catalog__count">{filtered.length} piece{filtered.length !== 1 ? 's' : ''}</p>

        {/* ── Products ── */}
        {filtered.length > 0 ? (
          showGrouped ? (
            /* Grouped by category + subcategory */
            <div className="catalog__sections">
              {groupedSections().map((section, si) => (
                <div key={si} className="catalog__section">
                  <div className="catalog__section-head">
                    {section.eyebrow && (
                      <span className="catalog__section-eyebrow">{section.eyebrow}</span>
                    )}
                    <h2 className="catalog__section-title">{section.heading}</h2>
                    <div className="catalog__section-line" />
                  </div>
                  <div className="catalog__grid">
                    {section.items.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flat grid for filtered/sorted views */
            <div className="catalog__grid">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )
        ) : (
          <div className="catalog__empty">
            <p>No pieces found. Try a different filter or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
