import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isWishlisted, getProductReviews, addReview } = useContext(StoreContext);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === parseInt(id));
  const wishlisted = product ? isWishlisted(product.id) : false;

  // Related products
  const related = product
    ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3)
    : [];

  useEffect(() => {
    if (products.length > 0 && !product) navigate('/collection');
  }, [product, products, navigate]);

  if (!product) return null;

  return (
    <div className="pdp">
      {/* Back nav */}
      <div className="container pdp__back-row">
        <Link to="/collection" className="pdp__back">← Back to Collection</Link>
      </div>

      {/* Main content */}
      <div className="container pdp__main">
        <div className="pdp__gallery">
          <img src={product.image} alt={product.name} className="pdp__hero-img" />
        </div>

        <div className="pdp__info">
          <span className="pdp__category">{product.category.toUpperCase()}</span>
          <h1 className="pdp__title">{product.name}</h1>
          <span className="pdp__price">{product.currency} {product.price.toLocaleString()}</span>

          <p className="pdp__desc">{product.description}</p>

          <div className="pdp__divider" />

          {product.motif && (
            <div className="pdp__section">
              <h3>The Motif</h3>
              <p>{product.motif}</p>
            </div>
          )}
          {product.sound && (
            <div className="pdp__section">
              <h3>The Sound</h3>
              <p>{product.sound}</p>
            </div>
          )}

          <div className="pdp__divider" />

          <div className="pdp__meta-row">
            <span><strong>Material:</strong> {product.material}</span>
            <span><strong>Artisan:</strong> {product.artisan}</span>
          </div>

          <div className="pdp__divider" />

          {/* Actions */}
          <div className="pdp__actions">
            <div className="pdp__qty">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="btn btn-gold pdp__add-btn" onClick={() => addToCart(product, quantity)}>
              Add to Cart — {product.currency} {(product.price * quantity).toLocaleString()}
            </button>
            <button
              className={`pdp__wishlist-btn ${wishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={wishlisted ? 'var(--accent-red)' : 'none'} stroke={wishlisted ? 'var(--accent-red)' : 'currentColor'} strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="container">
        <ReviewSection 
          productId={product.id}
          reviews={getProductReviews(product.id)}
          onAddReview={addReview}
        />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="pdp__related container">
          <h2>You May Also Like</h2>
          <div className="pdp__related-grid">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
