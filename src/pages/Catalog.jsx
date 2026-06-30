import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

const CATEGORIES = ['All Pieces', 'Jewelry', 'Textiles', 'Accessories'];

const Catalog = () => {
  const { products } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCat, setActiveCat] = useState('All Pieces');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat && CATEGORIES.includes(cat)) {
      setActiveCat(cat);
    }
  }, [searchParams]);

  const handleCatChange = (cat) => {
    setActiveCat(cat);
    if (cat === 'All Pieces') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', cat);
    }
    setSearchParams(searchParams);
  };

  let filtered = activeCat === 'All Pieces'
    ? [...products]
    : products.filter(p => p.category === activeCat);

  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  if (sortBy === 'featured') filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="catalog">
      <div className="catalog__header">
        <div className="container">
          <span className="catalog__eyebrow">Collection</span>
          <h1>Our Pieces</h1>
        </div>
      </div>

      <div className="container catalog__body">
        <div className="catalog__toolbar">
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

        <p className="catalog__count">{filtered.length} piece{filtered.length !== 1 ? 's' : ''}</p>

        {filtered.length > 0 ? (
          <div className="catalog__grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="catalog__empty">
            <p>No pieces found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
