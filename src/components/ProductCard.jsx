import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import './ProductCard.css';

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart, toggleWishlist, isWishlisted, getProductRating } = useContext(StoreContext);
  const wishlisted = isWishlisted(product.id);
  const productRating = getProductRating(product.id);

  return (
    <article className="pcard" style={{ animationDelay: `${index * .08}s` }}>
      <div className="pcard__img-wrap">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image || '/images/Products/brass-africa-set.jpeg'}
            alt={product.name}
            className="pcard__img"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/Products/brass-africa-set.jpeg';
            }}
          />
        </Link>

        {product.featured && <span className="pcard__badge">Featured</span>}

        {/* Wishlist heart */}
        <button
          className={`pcard__heart ${wishlisted ? 'pcard__heart--active' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'var(--accent-red)' : 'none'} stroke={wishlisted ? 'var(--accent-red)' : 'currentColor'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

      </div>

      <div className="pcard__info">
        <span className="pcard__tag">{product.tag}</span>
        <Link to={`/product/${product.id}`} className="pcard__name">{product.name}</Link>
        
        {/* Rating */}
        {productRating && (
          <div className="pcard__rating">
            <div className="pcard__stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`pcard__star ${i < Math.floor(productRating.rating) ? 'pcard__star--filled' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="pcard__review-count">({productRating.reviewCount})</span>
          </div>
        )}

        <span className="pcard__price">{product.currency} {product.price.toLocaleString()}</span>

        {/* Static Add to Cart Button */}
        <button className="pcard__btn btn btn-gold" onClick={() => addToCart(product)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
