import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StoreContext } from '../context/StoreContext';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(StoreContext);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
  const [status, setStatus] = useState('idle');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'orders'), {
        customer: formData,
        items: cart,
        total: cartTotal,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setStatus('success');
      clearCart();
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="checkout-page container" style={{ textAlign: 'center', padding: '8rem 0' }}>
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. We will contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <br />
      <br />
      <br />
      <h2>Checkout</h2>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Billing Details</h3>
          {status === 'error' && <div className="alert error">Failed to place order. Try again.</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea required rows="3" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-gold" disabled={status === 'submitting' || cart.length === 0}>
            {status === 'submitting' ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cart.length === 0 ? <p>Your cart is empty.</p> : (
            <>
              <ul>
                {cart.map(item => (
                  <li key={item.id} className="summary-item">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{item.currency} {(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-total">
                <strong>Total</strong>
                <strong>KSh {cartTotal.toLocaleString()}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
