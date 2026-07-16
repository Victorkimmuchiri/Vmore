import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLLECTION_PRODUCTS } from '../../data/collection_data';

const AdminCampaigns = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [subscribers, setSubscribers] = useState([]);
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [outboxLogs, setOutboxLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('news'); // 'news' | 'products' | 'offer'
  const [body, setBody] = useState('');
  const [featuredProductIds, setFeaturedProductIds] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [validUntil, setValidUntil] = useState('');

  // Product Selection Filters
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Search Terms
  const [campaignSearch, setCampaignSearch] = useState('');
  const [outboxSearch, setOutboxSearch] = useState('');

  // Sending States
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendingToEmail, setSendingToEmail] = useState('');

  // Quick Templates List
  const quickTemplates = [
    {
      id: 'shuka_spotlight',
      name: '📰 Maasai Tartan Spotlight',
      icon: '🧣',
      description: 'Highlight Maasai Shuka blankets and heritage storytelling.',
      subject: 'Heritage Spotlight: Woven Maasai Shuka Tartan Blankets',
      template: 'news',
      body: 'Embrace the warmth and heritage of African musical traditions and daily life with our authentic Maasai Shuka blankets.\n\nHandcrafted with bold Tartan check patterns, these blankets serve as versatile throws, wraps, and home statement pieces. Learn more about the artisan communities behind them in our Our Story page.',
      setup: (productsList) => {
        const shuka = productsList.find(p => p.name.toLowerCase().includes('shuka') || p.category === 'Textiles');
        return { productIds: shuka ? [shuka.id] : [], coupon: '', discount: 0, valid: '' };
      }
    },
    {
      id: 'jewelry_launch',
      name: '✨ Handcrafted Jewelry Showcase',
      icon: '💍',
      description: 'Feature newly arrived brass necklaces, beaded sets, and bone earrings.',
      subject: 'New Arrivals: Masterfully Handcrafted Brass & Beaded Jewelry',
      template: 'products',
      body: 'Add the elegant warmth of warm golden brass and Maasai beadwork to your wardrobe. Our newest collection features stunning choker necklaces, adjustable bangles, and bone drop earrings designed by master artisans.',
      setup: (productsList) => {
        const jewelry = productsList.filter(p => p.category === 'Jewelry').slice(0, 2);
        return { productIds: jewelry.map(j => j.id), coupon: '', discount: 0, valid: '' };
      }
    },
    {
      id: 'flash_sale',
      name: '🎁 VIP Flash Coupon Sale',
      icon: '🎟️',
      description: 'Dispatch a storewide discount promo code to email subscribers.',
      subject: 'VIP Reward: Enjoy 20% Off Storewide This Weekend!',
      template: 'offer',
      body: 'To thank you for being a part of the VMORE community, we are sharing an exclusive storewide coupon. Use this code at checkout to enjoy 20% off all handcrafted African musical arts, jewelry, textiles, and bags.',
      setup: (productsList) => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        return { productIds: [], coupon: 'VMOREVIP20', discount: 20, valid: nextWeekStr };
      }
    }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [subsSnap, prodSnap, campSnap, outSnap] = await Promise.all([
        getDocs(collection(db, 'subscribers')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'campaigns')),
        getDocs(collection(db, 'sent_emails'))
      ]);

      setSubscribers(subsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const campaignsList = campSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      campaignsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCampaigns(campaignsList);

      const logsList = outSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      logsList.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
      setOutboxLogs(logsList);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyQuickTemplate = (qt) => {
    setSubject(qt.subject);
    setTemplate(qt.template);
    setBody(qt.body);
    const { productIds, coupon, discount, valid } = qt.setup(products);
    setFeaturedProductIds(productIds);
    setPromoCode(coupon);
    setDiscountPercent(discount || 15);
    setValidUntil(valid || '');
  };

  const handleProductToggle = (id) => {
    setFeaturedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const preselectNewestArrivals = () => {
    const newest = [...products].slice(0, 3);
    setFeaturedProductIds(newest.map(p => p.id));
  };

  const insertProductsText = () => {
    if (featuredProductIds.length === 0) {
      alert("Please select some products first from the list below.");
      return;
    }
    const selected = products.filter(p => featuredProductIds.includes(p.id));
    const productTextList = selected.map(p => `• ${p.name} - ${p.currency || 'KSh'} ${p.price?.toLocaleString()}`).join('\n');
    setBody(prev => prev ? `${prev}\n\nFeatured Products:\n${productTextList}` : `Featured Products:\n${productTextList}`);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (subscribers.length === 0) {
      alert("No subscribers found. Please add a subscriber in the footer first!");
      return;
    }
    if (!subject.trim()) {
      alert("Please specify a subject line.");
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    const newCampaign = {
      subject,
      template,
      body,
      featuredProductIds: template === 'products' ? featuredProductIds : [],
      promoCode: template === 'offer' ? promoCode : '',
      discountPercent: template === 'offer' ? Number(discountPercent) : 0,
      validUntil: template === 'offer' ? validUntil : '',
      sentCount: subscribers.length,
      createdAt: new Date().toISOString()
    };

    // Firestore Live Mode
    try {
      const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
      const campaignId = docRef.id;

      for (let i = 0; i < subscribers.length; i++) {
        const recipient = subscribers[i].email;
        setSendingToEmail(recipient);

        await addDoc(collection(db, 'sent_emails'), {
          recipientEmail: recipient,
          subject: subject,
          campaignId: campaignId,
          status: 'delivered',
          sentAt: new Date().toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, 300));
        setSendProgress(Math.round(((i + 1) / subscribers.length) * 100));
      }

      await loadAllData();
    } catch (err) {
      console.error('Error dispatching campaign:', err);
      alert('Failed to execute campaign dispatch live.');
      setIsSending(false);
      return;
    }

    // Clear Form Fields
    setSubject('');
    setBody('');
    setFeaturedProductIds([]);
    setPromoCode('');
    setDiscountPercent(15);
    setValidUntil('');

    alert(`Dispatched successfully! Simulated ${subscribers.length} deliveries. Logs added to Outbox.`);
    setIsSending(false);
    setSendingToEmail('');
    setSendProgress(0);
    setActiveTab('history');
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign record?")) {
      try {
        await deleteDoc(doc(db, 'campaigns', id));
        loadAllData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearOutboxLogs = async () => {
    if (window.confirm("Are you sure you want to purge all outbox delivery logs?")) {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'sent_emails'));
        const batchDeletes = querySnapshot.docs.map(d => deleteDoc(doc(db, 'sent_emails', d.id)));
        await Promise.all(batchDeletes);
        loadAllData();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtered Lists
  const filteredProducts = products.filter(p =>
    productCategoryFilter === 'All' ? true : p.category === productCategoryFilter
  );

  const filteredCampaigns = campaigns.filter(c =>
    c.subject.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const filteredOutbox = outboxLogs.filter(log =>
    (log.recipientEmail || '').toLowerCase().includes(outboxSearch.toLowerCase()) ||
    (log.subject || '').toLowerCase().includes(outboxSearch.toLowerCase())
  );

  const selectedProducts = products.filter(p => featuredProductIds.includes(p.id));

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Marketing & Broadcasts</span>
          <h1>Internal Campaign Mailer</h1>
        </div>
        <div className="admin-time">
          Active Audience: {subscribers.length} Subscribers
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'create' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveTab('create')}
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
        >
          ✍️ Compose Campaign
        </button>
        <button
          className={`btn ${activeTab === 'history' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveTab('history')}
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
        >
          📂 Campaign Logs
        </button>
        <button
          className={`btn ${activeTab === 'outbox' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveTab('outbox')}
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
        >
          📈 Outbox Logs (Internal Mailer)
        </button>
      </div>

      {activeTab === 'create' && (
        <div>
          {/* Quick-Load Templates Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--sand)', marginBottom: '1rem' }}>⚡ Select Quick Template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {quickTemplates.map(qt => (
                <div
                  key={qt.id}
                  onClick={() => applyQuickTemplate(qt)}
                  style={{
                    background: 'var(--bg-card, #1c1815)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                  className="quick-template-card"
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{qt.icon}</span>
                    <strong style={{ color: 'var(--cream)', fontSize: '0.95rem' }}>{qt.name}</strong>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>
                    {qt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* ── Left Pane: Composer Form ── */}
            <div className="admin-card" style={{ margin: 0, padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Draft Message</h3>
              
              <form onSubmit={handleSend} className="admin-form">
                <div className="form-group">
                  <label>Subject Line</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discover Our Stunning New Brass Jewellery Collection!"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={isSending}
                  />
                </div>

                <div className="form-group">
                  <label>Template Type</label>
                  <select
                    value={template}
                    onChange={e => setTemplate(e.target.value)}
                    disabled={isSending}
                  >
                    <option value="news">📰 News & Brand Updates</option>
                    <option value="products">✨ Featured Products Showcase</option>
                    <option value="offer">🎁 Exclusive Promo Code & Offer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea
                    rows="6"
                    required
                    placeholder="Write your email body copy here..."
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    disabled={isSending}
                  />
                </div>

                {/* Showcase Products Fields */}
                {template === 'products' && (
                  <div className="form-group" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ color: 'var(--gold)' }}>Feature Products</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={preselectNewestArrivals}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '4px', cursor: 'pointer' }}
                          disabled={isSending}
                        >
                          ⚡ Pre-select New Arrivals
                        </button>
                        <button
                          type="button"
                          onClick={insertProductsText}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '4px', cursor: 'pointer' }}
                          disabled={isSending}
                        >
                          📝 Insert as Text
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {['All', 'Jewelry', 'Textiles', 'Accessories'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setProductCategoryFilter(cat)}
                          style={{
                            background: productCategoryFilter === cat ? 'var(--gold)' : 'transparent',
                            color: productCategoryFilter === cat ? '#000000' : 'var(--cream)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                      {filteredProducts.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={featuredProductIds.includes(p.id)}
                            onChange={() => handleProductToggle(p.id)}
                            disabled={isSending}
                          />
                          <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                          <strong style={{ color: 'var(--gold)' }}>{p.currency || 'KSh'} {p.price}</strong>
                        </label>
                      ))}
                      {filteredProducts.length === 0 && (
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No matching products.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Exclusive Offer Fields */}
                {template === 'offer' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                    <div className="form-group">
                      <label style={{ color: 'var(--gold)' }}>Promo Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER20"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        disabled={isSending}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: 'var(--gold)' }}>Discount (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={discountPercent}
                        onChange={e => setDiscountPercent(e.target.value)}
                        disabled={isSending}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ color: 'var(--gold)' }}>Valid Until</label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={e => setValidUntil(e.target.value)}
                        disabled={isSending}
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontWeight: '700' }}
                  disabled={isSending}
                >
                  🚀 Dispatch to {subscribers.length} Subscribers
                </button>
              </form>
            </div>

            {/* ── Right Pane: Live HTML Email Preview ── */}
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--sand)' }}>Live Email Preview</h3>
              
              <div style={{
                background: '#ffffff',
                color: '#333333',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                {/* Email Envelope Header */}
                <div style={{ background: '#f5f5f7', padding: '1rem', borderBottom: '1px solid #e1e1e3', fontSize: '0.8rem', color: '#666666' }}>
                  <div><strong>From:</strong> VMORE Gift Shop &lt;marketing@vmore.co.ke&gt;</div>
                  <div style={{ marginTop: '0.25rem' }}><strong>To:</strong> newsletter-subscribers@vmore.co.ke</div>
                  <div style={{ marginTop: '0.25rem' }}><strong>Subject:</strong> {subject || '(Draft Subject Line)'}</div>
                </div>

                {/* Email Body Template */}
                <div style={{ padding: '2rem 1.5rem', background: '#fafafa', minHeight: '350px' }}>
                  <div style={{ maxWidth: '500px', margin: '0 auto', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                    
                    {/* Brand Banner */}
                    <div style={{ background: '#0c0c0e', padding: '1.5rem', textAlign: 'center', borderBottom: '3px solid #d4af37' }}>
                      <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.4rem', letterSpacing: '2px', fontFamily: 'serif' }}>VMORE</h2>
                      <span style={{ fontSize: '0.6rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '3px' }}>GIFT SHOP</span>
                    </div>

                    {/* Message Body */}
                    <div style={{ padding: '2rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#111111', fontWeight: '700' }}>
                        {subject || 'Welcome to our newsletter'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#555555', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {body || 'Select a template or compose content to view preview.'}
                      </p>
                      
                      {/* Products Showcase Layout */}
                      {template === 'products' && selectedProducts.length > 0 && (
                        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                          {selectedProducts.map(p => (
                            <div key={p.id} style={{ border: '1px solid #ededed', borderRadius: '4px', overflow: 'hidden', textAlign: 'center', background: '#fafafa', padding: '0.75rem' }}>
                              {p.image ? (
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '2px' }} />
                              ) : (
                                <div style={{ width: '100%', height: '120px', background: '#f5efe6', border: '1px solid #d4af37', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                  ✨
                                </div>
                              )}
                              <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.85rem', color: '#222222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                              <span style={{ display: 'block', color: '#d4af37', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>KSh {p.price?.toLocaleString()}</span>
                              <span style={{ display: 'inline-block', background: '#0c0c0e', color: '#ffffff', padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderRadius: '2px', textDecoration: 'none', fontWeight: '600' }}>Shop Now</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Exclusive Offer Card Layout */}
                      {template === 'offer' && promoCode && (
                        <div style={{ marginTop: '2rem', border: '2px dashed #d4af37', background: '#fffef9', borderRadius: '6px', padding: '1.5rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>EXCLUSIVE SUBSCRIBER REWARD</span>
                          <h2 style={{ color: '#d4af37', fontSize: '2.2rem', margin: '0.5rem 0', fontWeight: '800' }}>{discountPercent}% OFF</h2>
                          <div style={{ background: '#0c0c0e', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', display: 'inline-block', margin: '0.5rem 0' }}>
                            {promoCode}
                          </div>
                          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#888888' }}>
                            Apply code at checkout. Valid until: {validUntil ? new Date(validUntil).toLocaleDateString() : 'Limited Time'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Email Footer */}
                    <div style={{ background: '#f9f9f9', padding: '1.5rem', borderTop: '1px solid #eaeaea', textAlign: 'center', fontSize: '0.75rem', color: '#888888' }}>
                      <p style={{ margin: '0 0 0.5rem' }}>VMORE Gift Shop • Preserving Culture, Crafting Memories</p>
                      <p style={{ margin: 0 }}>You are receiving this because you signed up on our website. <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Unsubscribe</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Search Campaigns</label>
              <input
                type="text"
                placeholder="Search campaigns by subject..."
                value={campaignSearch}
                onChange={e => setCampaignSearch(e.target.value)}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign Subject</th>
                  <th>Template Style</th>
                  <th>Audience Size</th>
                  <th>Date Sent</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ display: 'block', color: 'var(--cream)' }}>{c.subject}</strong>
                      {c.promoCode && <span style={{ fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(212,175,55,0.1)', padding: '0.1rem 0.4rem', borderRadius: '2px', marginTop: '0.2rem', display: 'inline-block' }}>🎟️ Code: {c.promoCode} ({c.discountPercent}% Off)</span>}
                    </td>
                    <td>
                      <span className="status-badge processing" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                        {c.template === 'news' ? '📰 Newsletter' : c.template === 'products' ? '✨ Product Showcase' : '🎁 Special Offer'}
                      </span>
                    </td>
                    <td><strong>{c.sentCount} recipients</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(c.createdAt).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline"
                        style={{
                          padding: '0.4rem 1rem',
                          borderColor: 'rgba(255, 77, 77, 0.4)',
                          color: 'var(--accent-red, #ff4d4d)'
                        }}
                        onClick={() => handleDeleteCampaign(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No matching campaigns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'outbox' && (
        <div>
          <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '280px' }}>
              <label>Search Deliveries</label>
              <input
                type="text"
                placeholder="Search outbox by recipient email or subject..."
                value={outboxSearch}
                onChange={e => setOutboxSearch(e.target.value)}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>
            <button
              onClick={handleClearOutboxLogs}
              className="btn btn-outline"
              style={{
                borderColor: 'rgba(255, 77, 77, 0.4)',
                color: 'var(--accent-red, #ff4d4d)',
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem'
              }}
            >
              🗑️ Clear Outbox History
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Recipient Email</th>
                  <th>Campaign Subject</th>
                  <th>Mailer Status</th>
                  <th>Delivered At</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutbox.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '600', color: 'var(--cream)' }}>{log.recipientEmail}</td>
                    <td style={{ color: 'var(--sand)' }}>{log.subject}</td>
                    <td>
                      <span className="status-badge delivered" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        🟢 Delivered
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredOutbox.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No delivery logs in Outbox.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sending Queue Modal */}
      {isSending && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(12, 12, 14, 0.95)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '3rem', border: '1px solid var(--gold-dim)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✉️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', marginBottom: '0.5rem' }}>Dispatching Campaign</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Simulating mail dispatch queue...
            </p>
            
            {/* Progress Container */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', height: '12px', width: '100%', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{
                background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
                width: `${sendProgress}%`,
                height: '100%',
                borderRadius: '100px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--sand)', marginBottom: '1.5rem' }}>
              <span>Progress: {sendProgress}%</span>
              <span>{Math.round((sendProgress / 100) * subscribers.length)} / {subscribers.length} Emails</span>
            </div>

            {sendingToEmail && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                Sending to: <span style={{ color: 'var(--gold)' }}>{sendingToEmail}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCampaigns;
