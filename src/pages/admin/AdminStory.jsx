import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

const defaultChapters = [
  {
    eyebrow: 'The Beginning',
    heading: 'Where Music Meets Purpose',
    body: [
      'As a Grade School piano tutor, Grade School theory tutor, a student at Ghetto Classics Art of Music, and an alumni of Kenya Conservatoire of Music, I have spent years immersed in the world of music.',
      "As a background vocalist in church and with the Suluhisho Band, I understand that music is more than sound — it's identity, tradition, and storytelling."
    ],
    img: '/images/Products/brass-africa-set.jpeg',
    reverse: false,
    order: 1
  },
  {
    eyebrow: 'The Vision',
    heading: 'Wear What You Play',
    body: [
      'VMORE Gift Shop was born from the realization that musicians and educators are often overlooked when it comes to personalized, symbolic accessories.',
      'There was no way for them to wear what they play, teach, and believe in — until now.'
    ],
    img: '/images/Products/brass-treble-clef-earrings.jpeg',
    reverse: true,
    order: 2
  },
  {
    eyebrow: 'The Craft',
    heading: 'Every Piece Carries a Story',
    body: [
      'Each piece draws from African instruments, Adinkra symbols, and motifs representing rhythm, harmony, and unity. Our jewelry is handcrafted with care, ethically made, and rich in meaning.',
      "Whether it's a brass cuff inspired by the Kora, or earrings echoing the shape of a Djembe, every design carries a story."
    ],
    img: '/images/Products/beaded-set-black-white.jpeg',
    reverse: false,
    order: 3
  },
  {
    eyebrow: 'Who We Serve',
    heading: 'For Those Who Live Music',
    body: [
      'Our collections are ideal for performers, music teachers, composers, and institutions that celebrate global musical traditions.',
      "Whether it's stage wear, educational gifts, cultural events, or simply showcasing a love for music with purpose — VMORE Gift Shop speaks to those who understand that music lives beyond the stage."
    ],
    img: '/images/Products/g-clef-wall-hanging.jpeg',
    reverse: true,
    order: 4
  }
];

const AdminStory = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    eyebrow: '',
    heading: '',
    bodyText: '', // split by newline to create body array
    reverse: false,
    order: 1
  });

  useEffect(() => { fetchChapters(); }, []);

  const fetchChapters = async () => {
    try {
      const snap = await getDocs(collection(db, 'story_chapters'));
      let chList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      chList.sort((a, b) => a.order - b.order);
      setChapters(chList);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSeedStory = async () => {
    if (!window.confirm("Initialize your Story chapters in the database with the current content?")) return;
    setUploading(true);
    try {
      for (const ch of defaultChapters) {
        await addDoc(collection(db, 'story_chapters'), ch);
      }
      alert('Story initialized in database!');
      fetchChapters();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `story/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Convert bodyText paragraphs split by newline
      const bodyArray = form.bodyText.split('\n').map(p => p.trim()).filter(p => p.length > 0);

      const chData = {
        eyebrow: form.eyebrow,
        heading: form.heading,
        body: bodyArray,
        reverse: Boolean(form.reverse),
        order: Number(form.order)
      };

      if (imageUrl) {
        chData.img = imageUrl;
      } else if (!editingId) {
        chData.img = '/images/Products/brass-africa-set.jpeg';
      }

      if (!editingId) {
        await addDoc(collection(db, 'story_chapters'), chData);
      } else {
        await updateDoc(doc(db, 'story_chapters', editingId), chData);
      }

      setForm({ eyebrow: '', heading: '', bodyText: '', reverse: false, order: chapters.length + 2 });
      setEditingId(null);
      setImageFile(null);
      fetchChapters();
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const startEdit = (ch) => {
    setForm({
      eyebrow: ch.eyebrow || '',
      heading: ch.heading || '',
      bodyText: (ch.body || []).join('\n'),
      reverse: ch.reverse || false,
      order: ch.order || 1
    });
    setEditingId(ch.id);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this chapter from your Story page?')) {
      await deleteDoc(doc(db, 'story_chapters', id));
      fetchChapters();
    }
  };

  if (loading) return <div className="admin-loading">Loading Story...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Content Management</span>
          <h1>Edit Our Story</h1>
        </div>
        {chapters.length === 0 && (
          <button onClick={handleSeedStory} className="btn btn-outline" disabled={uploading}>
            Initialize Story Chapters
          </button>
        )}
      </div>

      <div className="admin-card">
        <h3>{editingId ? 'Edit Chapter Block' : 'Add New Chapter Block'}</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Eyebrow (e.g. The Beginning)</label>
              <input required value={form.eyebrow} onChange={e=>setForm({...form, eyebrow: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Heading</label>
              <input required value={form.heading} onChange={e=>setForm({...form, heading: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Display Order (1, 2, 3...)</label>
              <input type="number" required value={form.order} onChange={e=>setForm({...form, order: e.target.value})} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.8rem' }}>
              <input 
                type="checkbox" 
                id="reverse" 
                checked={form.reverse} 
                onChange={e=>setForm({...form, reverse: e.target.checked})}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <label htmlFor="reverse" style={{ cursor: 'pointer', marginBottom: 0 }}>Reverse Layout (Image on right)</label>
            </div>
          </div>

          <div className="form-group">
            <label>Body Paragraphs (Press enter for new paragraphs)</label>
            <textarea required rows="5" value={form.bodyText} onChange={e=>setForm({...form, bodyText: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Image {editingId && '(Leave empty to keep current)'}</label>
            <input type="file" onChange={e=>setImageFile(e.target.files[0])}/>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-gold" disabled={uploading}>
              {uploading ? 'Processing...' : (editingId ? 'Update Chapter' : 'Add Chapter')}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={() => {
                setEditingId(null);
                setForm({ eyebrow: '', heading: '', bodyText: '', reverse: false, order: chapters.length + 1 });
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3>Active Chapters List</h3>
        {chapters.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>
            No chapters loaded in database. Click 'Initialize Story Chapters' to start.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Image</th>
                  <th>Eyebrow / Heading</th>
                  <th>Snippet</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map(ch => (
                  <tr key={ch.id}>
                    <td><strong>#{ch.order}</strong></td>
                    <td><img src={ch.img} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>{ch.eyebrow}</span>
                      <div style={{ fontWeight: '600' }}>{ch.heading}</div>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {ch.body ? ch.body[0] : ''}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 1rem' }} onClick={() => startEdit(ch)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 1rem' }} onClick={() => handleDelete(ch.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStory;
