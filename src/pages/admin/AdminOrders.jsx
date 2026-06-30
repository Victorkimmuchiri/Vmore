import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    let ords = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    ords.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(ords);
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
    fetchOrders();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteDoc(doc(db, 'orders', id));
      fetchOrders();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Orders</h1>
      </div>
      
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.customer?.name}<br/><small>{o.customer?.email}</small></td>
                <td>KSh {o.total?.toLocaleString()}</td>
                <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} style={{padding:'0.4rem', background:'var(--bg-rich)', color:'var(--cream)'}}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button className="btn btn-outline" style={{padding:'0.4rem 1rem'}} onClick={() => handleDelete(o.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length===0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
