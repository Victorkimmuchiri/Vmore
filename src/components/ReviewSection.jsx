import React, { useState, useCallback } from 'react';
import './ReviewSection.css';

const ReviewSection = ({ productId, reviews = [], onAddReview }) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(r => r.rating === rating).length
  );

  const getSortedReviews = () => {
    const sorted = [...reviews];
    if (sortBy === 'recent') {
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'highest') {
      return sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      return sorted.sort((a, b) => a.rating - b.rating);
    }
    return sorted;
  };

  return (
    <section className="reviews">
      <div className="reviews__header">
        <h2>Customer Reviews</h2>
        <button 
          className="reviews__add-btn"
          onClick={() => setShowForm(v => !v)}
        >
          <span>{showForm ? '✕ Cancel' : '✦ Write a Review'}</span>
        </button>
      </div>

      {showForm && (
        <ReviewForm 
          productId={productId} 
          onSubmit={(review) => {
            onAddReview(review);
            setShowForm(false);
          }}
        />
      )}

      {reviews.length > 0 ? (
        <>
          <div className="reviews__summary">
            <div className="reviews__rating-box">
              <div className="reviews__avg-rating">{avgRating}</div>
              <div className="reviews__rating-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`reviews__star ${i < Math.round(avgRating) ? 'reviews__star--filled' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="reviews__review-count">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="reviews__distribution">
              {[5, 4, 3, 2, 1].map((rating, idx) => (
                <div key={rating} className="reviews__rating-row">
                  <span className="reviews__rating-label">{rating} star</span>
                  <div className="reviews__rating-bar">
                    <div 
                      className="reviews__rating-fill"
                      style={{ width: `${reviews.length > 0 ? (ratingCounts[idx] / reviews.length * 100) : 0}%` }}
                    />
                  </div>
                  <span className="reviews__rating-count">{ratingCounts[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reviews__controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="reviews__sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="reviews__list">
            {getSortedReviews().map((review, idx) => {
              const initials = (review.name || '?')
                .split(' ')
                .map(w => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              return (
                <div key={idx} className="reviews__item">
                  {/* Decorative quote mark */}
                  <span className="reviews__item-quote" aria-hidden="true">&ldquo;</span>

                  <div className="reviews__item-header">
                    <div className="reviews__item-rating">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`reviews__star ${i < review.rating ? 'reviews__star--filled' : ''}`}
                          width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                          style={i < review.rating ? { animationDelay: `${i * 0.06}s` } : {}}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="reviews__item-date">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h4 className="reviews__item-title">{review.title}</h4>
                  <p className="reviews__item-text">{review.text}</p>

                  <div className="reviews__item-author">
                    <div className="reviews__item-avatar" aria-hidden="true">{initials}</div>
                    <span className="reviews__item-name">{review.name}</span>
                    {review.approved && (
                      <span className="reviews__item-verified" title="Verified purchase">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="reviews__empty">
          <div className="reviews__empty-icon">✦</div>
          <p>No reviews yet. Be the first to share your experience with this piece!</p>
        </div>
      )}
    </section>
  );
};

const ReviewForm = ({ productId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a review title');
      return;
    }
    if (!text.trim()) {
      setError('Please enter your review');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      onSubmit({
        productId,
        rating,
        title: title.trim(),
        text: text.trim(),
        name: name.trim(),
        date: new Date().toISOString()
      });

      setRating(5);
      setTitle('');
      setText('');
      setName('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form__group">
        <label htmlFor="rating">Rating</label>
        <div className="review-form__stars">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              className={`review-form__star ${num <= rating ? 'review-form__star--active' : ''}`}
              onClick={() => setRating(num)}
              aria-label={`${num} stars`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="review-form__group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div className="review-form__group">
        <label htmlFor="title">Review Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
        />
      </div>

      <div className="review-form__group">
        <label htmlFor="text">Your Review</label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this piece..."
          rows="5"
          required
        />
      </div>

      {error && <div className="review-form__error">{error}</div>}

      <button type="submit" className="review-form__submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewSection;
