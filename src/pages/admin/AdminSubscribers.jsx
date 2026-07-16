import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'subscribers'));
      const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSubscribers(list);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      try {
        await deleteDoc(doc(db, 'subscribers', id));
        fetchSubscribers();
      } catch (err) {
        console.error('Error deleting subscriber:', err);
      }
    }
  };

  const filteredSubscribers = subscribers.filter(s =>
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="admin-loading">Loading subscribers...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Engagement</span>
          <h1>Newsletter Subscribers</h1>
        </div>
        <div className="admin-time">
          Total Subscribers: {subscribers.length}
        </div>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="subscriber-search" style={{ marginBottom: '0.5rem' }}>Search Email</label>
          <input
            id="subscriber-search"
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Subscribed At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: '500' }}>{s.email}</td>
                <td style={{ color: 'var(--muted)' }}>
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-outline"
                    style={{
                      padding: '0.4rem 1rem',
                      borderColor: 'rgba(255, 77, 77, 0.4)',
                      color: 'var(--accent-red, #ff4d4d)'
                    }}
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredSubscribers.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  {searchTerm ? 'No matching subscribers found.' : 'No subscribers yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSubscribers;
