import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#d4af37', bg: 'rgba(212,175,55,0.12)',    border: 'rgba(212,175,55,0.35)' },
  processing: { label: 'Processing', color: '#8ab4f8', bg: 'rgba(100,149,237,0.12)',   border: 'rgba(100,149,237,0.35)' },
  shipped:    { label: 'Shipped',    color: '#d7a8ff', bg: 'rgba(170,59,255,0.12)',    border: 'rgba(170,59,255,0.35)' },
  delivered:  { label: 'Delivered',  color: '#a4dca4', bg: 'rgba(61,107,61,0.12)',     border: 'rgba(61,107,61,0.35)' },
  cancelled:  { label: 'Cancelled',  color: '#ff8a80', bg: 'rgba(255,82,82,0.12)',     border: 'rgba(255,82,82,0.35)' },
};

const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#c5b39c', bg: 'rgba(197,179,156,0.1)', border: 'rgba(197,179,156,0.3)' };
  return (
    <span style={{
      padding: '0.3rem 0.8rem',
      borderRadius: '100px',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

const MiniStar = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#d4af37">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

/* Top Selling Products — horizontal bar chart */
const TopSellersChart = ({ topSellers }) => {
  const max = topSellers[0]?.qty || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {topSellers.map((item, i) => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: i === 0 ? 'var(--gold)' : i === 1 ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.25)',
            color: i === 0 ? 'var(--bg-deep)' : 'var(--cream)',
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.8rem', color: 'var(--cream)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {item.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>
                {item.qty} sold
              </span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(item.qty / max) * 100}%`,
                background: i === 0
                  ? 'linear-gradient(90deg, var(--gold), #f3e5ab)'
                  : i === 1
                  ? 'rgba(212,175,55,0.65)'
                  : 'rgba(212,175,55,0.35)',
                borderRadius: '100px',
                transition: 'width 0.8s cubic-bezier(.16,1,.3,1)',
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              Revenue: {fmt(item.revenue)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* Expandable order row — shows ordered items */
const OrderRow = ({ order, onStatusChange, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || order.cartItems || [];

  return (
    <>
      <tr
        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
        onClick={() => setExpanded(v => !v)}
        className="order-main-row"
      >
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              transform: `rotate(${expanded ? 90 : 0}deg)`,
              transition: 'transform 0.2s',
              display: 'inline-block',
              color: 'var(--gold)',
              fontSize: '0.75rem',
            }}>▶</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{fmtDate(order.createdAt)}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                #{order.id?.slice(-6).toUpperCase()}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{order.customer?.name || '—'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{order.customer?.email}</div>
          {order.customer?.phone && (
            <div style={{ fontSize: '0.72rem', color: 'var(--sand)' }}>{order.customer.phone}</div>
          )}
        </td>
        <td>
          <div style={{ fontSize: '0.8rem', color: 'var(--sand)' }}>
            {items.length > 0
              ? items.map(i => i.name || i.productName || '').filter(Boolean).slice(0, 2).join(', ') +
                (items.length > 2 ? ` +${items.length - 2} more` : '')
              : <span style={{ color: 'var(--muted)' }}>No items recorded</span>}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        </td>
        <td>
          <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.95rem' }}>
            {fmt(order.total)}
          </div>
        </td>
        <td onClick={e => e.stopPropagation()}>
          <StatusBadge status={order.status || 'pending'} />
        </td>
        <td onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={order.status || 'pending'}
              onChange={e => onStatusChange(order.id, e.target.value)}
              style={{
                padding: '0.35rem 0.6rem',
                background: 'var(--bg-rich)',
                color: 'var(--cream)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {Object.keys(STATUS_CONFIG).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <button
              onClick={() => onDelete(order.id)}
              style={{
                padding: '0.35rem 0.75rem',
                background: 'rgba(255,82,82,0.1)',
                color: '#ff8a80',
                border: '1px solid rgba(255,82,82,0.25)',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded: product items */}
      {expanded && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <div style={{
              background: 'rgba(212,175,55,0.03)',
              borderTop: '1px solid rgba(212,175,55,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              padding: '1.25rem 2rem',
            }}>
              {items.length > 0 ? (
                <>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '1rem' }}>
                    Order Items
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        flexWrap: 'wrap',
                      }}>
                        {(item.image || item.imageUrl) && (
                          <img
                            src={item.image || item.imageUrl}
                            alt={item.name || item.productName}
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--cream)' }}>
                            {item.name || item.productName || 'Unknown Product'}
                          </div>
                          {item.category && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{item.category}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</div>
                            <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '1rem' }}>{item.quantity || 1}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Unit</div>
                            <div style={{ fontWeight: 600, color: 'var(--sand)', fontSize: '0.88rem' }}>{fmt(item.price)}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Subtotal</div>
                            <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.95rem' }}>
                              {fmt((item.price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address if available */}
                  {(order.customer?.address || order.shippingAddress) && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '0.82rem',
                      color: 'var(--sand)',
                    }}>
                      <span style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.68rem' }}>
                        Delivery Address
                      </span>
                      <div style={{ marginTop: '0.25rem' }}>
                        {order.customer?.address || order.shippingAddress}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                  ⚠️ No product line items recorded for this order. Items may have been stored differently.
                </div>
              )}

              {/* Order notes */}
              {order.notes && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(212,175,55,0.04)',
                  borderRadius: '6px',
                  border: '1px solid rgba(212,175,55,0.12)',
                  fontSize: '0.82rem',
                  color: 'var(--sand)',
                }}>
                  <span style={{ color: 'var(--gold)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Order Notes
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>{order.notes}</div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/* Mobile order card (< 768px) */
const OrderCard = ({ order, onStatusChange, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || order.cartItems || [];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '1rem',
    }}>
      {/* Card header */}
      <div
        style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.customer?.name || '—'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              #{order.id?.slice(-6).toUpperCase()} · {fmtDate(order.createdAt)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <StatusBadge status={order.status || 'pending'} />
            <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>{fmt(order.total)}</div>
          </div>
        </div>
        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--sand)' }}>
          {items.length > 0
            ? `${items.length} item${items.length !== 1 ? 's' : ''} · ${items.map(i => i.name || i.productName || '').filter(Boolean).slice(0, 2).join(', ')}${items.length > 2 ? '...' : ''}`
            : 'Tap to view details'}
        </div>
        <div style={{ textAlign: 'right', color: 'var(--gold)', fontSize: '0.72rem', marginTop: '0.5rem' }}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {/* Items */}
          {items.length > 0 ? items.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem', background: 'rgba(255,255,255,0.02)',
              borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)',
            }}>
              {(item.image || item.imageUrl) && (
                <img src={item.image || item.imageUrl} alt={item.name || item.productName}
                  style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{item.name || item.productName || 'Product'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Qty: {item.quantity || 1} · {fmt(item.price)} each
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem' }}>
                {fmt((item.price || 0) * (item.quantity || 1))}
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem', textAlign: 'center' }}>No item details recorded</div>
          )}

          {/* Customer info */}
          <div style={{
            padding: '0.75rem', background: 'rgba(255,255,255,0.02)',
            borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)',
            fontSize: '0.8rem',
          }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Customer</div>
            <div>{order.customer?.email}</div>
            {order.customer?.phone && <div style={{ color: 'var(--sand)' }}>{order.customer.phone}</div>}
            {(order.customer?.address || order.shippingAddress) && (
              <div style={{ color: 'var(--sand)', marginTop: '0.25rem' }}>{order.customer?.address || order.shippingAddress}</div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={order.status || 'pending'}
              onChange={e => onStatusChange(order.id, e.target.value)}
              style={{
                flex: 1, padding: '0.5rem 0.6rem',
                background: 'var(--bg-rich)', color: 'var(--cream)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
                fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              {Object.keys(STATUS_CONFIG).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <button
              onClick={() => onDelete(order.id)}
              style={{
                padding: '0.5rem 0.9rem',
                background: 'rgba(255,82,82,0.1)', color: '#ff8a80',
                border: '1px solid rgba(255,82,82,0.25)', borderRadius: '4px',
                fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ords = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      ords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ords);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'orders', id));
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  /* ── Analytics ── */
  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Product sales tally
    const productSales = {};
    orders.forEach(order => {
      const items = order.items || order.cartItems || [];
      items.forEach(item => {
        const name = item.name || item.productName || 'Unknown';
        const qty = item.quantity || 1;
        const rev = (item.price || 0) * qty;
        if (!productSales[name]) productSales[name] = { name, qty: 0, revenue: 0 };
        productSales[name].qty += qty;
        productSales[name].revenue += rev;
      });
    });

    const topSellers = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    return { totalRevenue, pending, processing, delivered, avgOrderValue, topSellers };
  }, [orders]);

  /* ── Filtered & sorted orders ── */
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filterStatus !== 'all') result = result.filter(o => o.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        (o.items || o.cartItems || []).some(i =>
          (i.name || i.productName || '').toLowerCase().includes(q)
        )
      );
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'highest') result.sort((a, b) => (b.total || 0) - (a.total || 0));
    else if (sortBy === 'lowest') result.sort((a, b) => (a.total || 0) - (b.total || 0));
    return result;
  }, [orders, filterStatus, searchQuery, sortBy]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1rem' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--sand)' }}>Loading orders…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* ── Page Head ── */}
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Store Management</span>
          <h1>Orders</h1>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Analytics Stats ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {[
          { icon: '💰', label: 'Total Revenue', value: fmt(analytics.totalRevenue), accent: true },
          { icon: '📦', label: 'Total Orders', value: orders.length, accent: false },
          { icon: '⏳', label: 'Pending', value: analytics.pending, accent: false },
          { icon: '🚚', label: 'Processing', value: analytics.processing, accent: false },
          { icon: '✅', label: 'Delivered', value: analytics.delivered, accent: false },
          { icon: '📊', label: 'Avg. Order', value: fmt(analytics.avgOrderValue), accent: false },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.accent ? 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.05))' : 'var(--bg-card)',
            border: `1px solid ${stat.accent ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            transition: 'transform 0.2s',
          }}>
            <span style={{
              fontSize: '1.4rem',
              background: 'rgba(212,175,55,0.1)',
              width: '44px', height: '44px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)' }}>{stat.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.accent ? 'var(--gold)' : 'var(--cream)', marginTop: '0.15rem' }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Top Sellers + Status Breakdown ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: analytics.topSellers.length > 0 ? '2fr 1fr' : '1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Top Sellers */}
        {analytics.topSellers.length > 0 && (
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MiniStar /> Top Selling Products
            </h3>
            <TopSellersChart topSellers={analytics.topSellers} />
          </div>
        )}

        {/* Order Status Breakdown */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h3>Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = orders.filter(o => o.status === key).length;
              const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: cfg.color, borderRadius: '100px',
                      transition: 'width 0.8s cubic-bezier(.16,1,.3,1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Search by name, email, order ID or product…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1, minWidth: '200px',
            padding: '0.6rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--cream)', borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '0.88rem',
            outline: 'none',
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '0.6rem 0.8rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--cream)', borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '0.6rem 0.8rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--cream)', borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Value</option>
          <option value="lowest">Lowest Value</option>
        </select>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Orders List ── */}
      {filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--bg-card)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: '8px',
          color: 'var(--muted)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
          <div style={{ fontSize: '1rem', color: 'var(--sand)' }}>
            {searchQuery || filterStatus !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}
          </div>
        </div>
      ) : isMobile ? (
        /* Mobile card layout */
        <div>
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Desktop table */
        <div className="admin-table-wrap">
          <table className="admin-table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '140px' }} />
              <col style={{ width: '180px' }} />
              <col />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '200px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Date / ID</th>
                <th>Customer</th>
                <th>Products Ordered</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .order-main-row:hover { background: rgba(212,175,55,0.03) !important; }
      `}</style>
    </div>
  );
};

export default AdminOrders;
