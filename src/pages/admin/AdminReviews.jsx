import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { StoreContext } from '../../context/StoreContext';

const AdminReviews = () => {
  const { products } = useContext(StoreContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: true });
    } catch (err) {
      console.error("Error approving review:", err);
      alert("Failed to approve review.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        console.error("Error deleting review:", err);
        alert("Failed to delete review.");
      }
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    return product ? product.name : `Unknown Product (${productId})`;
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const filteredReviews = reviews.filter(r => {
    const isPending = !r.approved;
    if (activeTab === 'pending' && !isPending) return false;
    if (activeTab === 'approved' && isPending) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const productName = getProductName(r.productId).toLowerCase();
      return (
        r.name?.toLowerCase().includes(query) ||
        r.title?.toLowerCase().includes(query) ||
        r.text?.toLowerCase().includes(query) ||
        productName.includes(query)
      );
    }
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Product Reviews</h1>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Moderation ({reviews.filter(r => !r.approved).length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Reviews ({reviews.filter(r => r.approved).length})
          </button>
        </div>

        <div className="admin-actions">
          <input
            type="text"
            placeholder="Search reviews by name, title, text, or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ maxWidth: '400px' }}
          />
        </div>

        {loading ? (
          <div className="admin-loading">Loading reviews...</div>
        ) : filteredReviews.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date)).map(review => (
                  <tr key={review.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(review.date).toLocaleDateString()}
                    </td>
                    <td>{getProductName(review.productId)}</td>
                    <td>{review.name}</td>
                    <td style={{ color: 'var(--gold)' }}>{renderStars(review.rating)}</td>
                    <td style={{ maxWidth: '300px' }}>
                      <strong>{review.title}</strong>
                      <p style={{ fontSize: '0.9em', marginTop: '4px', opacity: 0.9 }}>
                        {review.text}
                      </p>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {activeTab === 'pending' && (
                          <button 
                            onClick={() => handleApprove(review.id)}
                            className="admin-btn-action approve"
                            title="Approve Review"
                          >
                            ✅ Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="admin-btn-action delete"
                          title={activeTab === 'pending' ? "Reject & Delete" : "Delete"}
                        >
                          🗑️ {activeTab === 'pending' ? 'Reject' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <p>No {activeTab} reviews found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
