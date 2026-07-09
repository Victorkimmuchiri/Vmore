import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    const querySnapshot = await getDocs(collection(db, 'messages'));
    let msgs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    msgs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    setMessages(msgs);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteDoc(doc(db, 'messages', id));
      fetchMessages();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Messages</h1>
      </div>
      
      <div className="admin-messages-list">
        {messages.length === 0 ? <p>No messages found.</p> : null}
        {messages.map(m => (
          <div key={m.id} className="admin-card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
              <strong>{m.name} ({m.email}) {m.phone && <span style={{color:'var(--gold)',marginLeft:'0.5rem'}}>📞 {m.phone}</span>}</strong>
              <small style={{color:'var(--muted)'}}>{new Date(m.createdAt).toLocaleString()}</small>
            </div>
            <p style={{whiteSpace:'pre-wrap'}}>{m.message}</p>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button className="btn btn-outline" style={{padding:'0.4rem 1rem'}} onClick={() => handleDelete(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMessages;
