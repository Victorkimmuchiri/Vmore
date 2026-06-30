import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <div className="container contact-container">
        <div className="contact-info reveal visible">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you. Reach out with any questions about our artisan pieces or your order.</p>
          <ul>
            <li>Email: info@vmore.co.ke</li>
            <li>Phone: +254 700 000 000</li>
            <li>Location: Nairobi, Kenya</li>
          </ul>
        </div>
        
        <form className="contact-form reveal visible" onSubmit={handleSubmit}>
          <h3>Send a Message</h3>
          {status === 'success' && <div className="alert success">Message sent successfully! We'll get back to you soon.</div>}
          {status === 'error' && <div className="alert error">Failed to send message. Please try again later.</div>}
          
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea 
              required 
              rows="5" 
              value={formData.message} 
              onChange={e => setFormData({...formData, message: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn-gold" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
