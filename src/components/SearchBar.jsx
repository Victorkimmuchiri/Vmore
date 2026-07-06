import React, { useState, useCallback, useContext, useRef, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const { products } = useContext(StoreContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  const searchProducts = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = products
      .filter(p => 
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.tag.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, 6);

    setResults(filtered);
    setSelectedIndex(-1);
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen && e.key !== 'Enter') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = `/product/${results[selectedIndex].id}`;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="search" ref={containerRef}>
      <div className="search__container">
        <input
          ref={inputRef}
          type="text"
          className="search__input"
          placeholder="Search pieces..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="search-results"
        />
        <svg className="search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div className="search__dropdown" id="search-results" role="listbox">
          {results.map((product, idx) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className={`search__result ${selectedIndex === idx ? 'search__result--selected' : ''}`}
              role="option"
              aria-selected={selectedIndex === idx}
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
            >
              <img src={product.image} alt={product.name} className="search__result-img" />
              <div className="search__result-info">
                <div className="search__result-name">{product.name}</div>
                <div className="search__result-price">
                  {product.currency} {product.price.toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="search__empty">
          No pieces found for "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;
