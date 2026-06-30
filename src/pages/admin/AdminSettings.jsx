import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminSettings = () => {
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    ourStoryTitle: '',
    ourStoryBody: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data());
        } else {
          // Defaults if not exists
          setContent({
            heroTitle: 'Heritage in Every Thread',
            heroSubtitle: 'Discover handcrafted African artifacts, textiles, and jewelry that tell a story of rhythm, culture, and timeless artistry.',
            ourStoryTitle: 'The Rhythm of Creation',
            ourStoryBody: 'Every piece in our collection carries the heartbeat of the artisans who crafted it...'
          });
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), content);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Site Settings</h1>
      </div>

      <div className="admin-card">
        <h3>Homepage Hero</h3>
        <form className="admin-form" onSubmit={handleSave}>
          <div className="form-group">
            <label>Hero Title</label>
            <input required value={content.heroTitle} onChange={e=>setContent({...content,heroTitle:e.target.value})} />
          </div>
          <div className="form-group">
            <label>Hero Subtitle</label>
            <textarea required rows="3" value={content.heroSubtitle} onChange={e=>setContent({...content,heroSubtitle:e.target.value})} />
          </div>

          <h3 style={{marginTop: '2rem'}}>Our Story Page</h3>
          <div className="form-group">
            <label>Title</label>
            <input required value={content.ourStoryTitle} onChange={e=>setContent({...content,ourStoryTitle:e.target.value})} />
          </div>
          <div className="form-group">
            <label>Body Content</label>
            <textarea required rows="6" value={content.ourStoryBody} onChange={e=>setContent({...content,ourStoryBody:e.target.value})} />
          </div>

          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
