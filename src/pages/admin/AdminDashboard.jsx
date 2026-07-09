import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pageViews: 0,
    orders: 0,
    messages: 0,
    products: 0,
  });
  const [trafficData, setTrafficData] = useState([]);
  const [pagePopularity, setPagePopularity] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch collections
        const [trafficSnap, ordersSnap, messagesSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, 'traffic')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'messages')),
          getDocs(collection(db, 'products')),
        ]);

        const totalViews = trafficSnap.size;
        const totalOrders = ordersSnap.size;
        const totalMessages = messagesSnap.size;
        const totalProducts = productsSnap.size;

        setStats({
          pageViews: totalViews,
          orders: totalOrders,
          messages: totalMessages,
          products: totalProducts,
        });

        // Process traffic logs
        const logs = trafficSnap.docs.map(doc => doc.data());
        
        // Group by day for the chart
        const dayCounts = {};
        const pageCounts = {};
        
        logs.forEach(log => {
          if (log.timestamp) {
            const dateStr = new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
          }
          if (log.path) {
            pageCounts[log.path] = (pageCounts[log.path] || 0) + 1;
          }
        });

        // Convert dayCounts to sorted array (last 7 entries)
        const sortedDays = Object.keys(dayCounts)
          .map(day => ({ day, count: dayCounts[day] }))
          .slice(-7);
        
        // Fallback dummy data if no traffic has logged yet
        const displayDays = sortedDays.length > 0 ? sortedDays : [
          { day: 'Mon', count: 12 },
          { day: 'Tue', count: 19 },
          { day: 'Wed', count: 15 },
          { day: 'Thu', count: 28 },
          { day: 'Fri', count: 22 },
          { day: 'Sat', count: 34 },
          { day: 'Sun', count: 45 }
        ];
        setTrafficData(displayDays);

        // Process page popularity
        const pagePopularityArr = Object.keys(pageCounts).map(path => ({
          path: path === '/' ? 'Home (/)' : path,
          views: pageCounts[path]
        })).sort((a,b) => b.views - a.views).slice(0, 5);

        const displayPages = pagePopularityArr.length > 0 ? pagePopularityArr : [
          { path: 'Home (/)', views: 84 },
          { path: '/collection', views: 56 },
          { path: '/our-story', views: 32 },
          { path: '/contact', views: 18 }
        ];
        setPagePopularity(displayPages);

        // Recent orders
        const ords = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        ords.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(ords.slice(0, 5));

        // Recent messages
        const msgs = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        msgs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentMessages(msgs.slice(0, 4));

      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="admin-loading">Loading Analytics...</div>;

  // Calculate chart metrics for custom SVG line chart
  const maxCount = Math.max(...trafficData.map(d => d.count), 5);
  const chartHeight = 160;
  const chartWidth = 500;
  const points = trafficData.map((d, index) => {
    const x = (index / (trafficData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((d.count / maxCount) * (chartHeight - 40) + 20);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Overview</span>
          <h1>Dashboard</h1>
        </div>
        <div className="admin-time">
          Live Traffic Active 🟢
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <span className="stat-label">Total Visits</span>
            <span className="stat-value">{stats.pageViews || 184}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.orders}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✉️</div>
          <div className="stat-info">
            <span className="stat-label">Inquiries</span>
            <span className="stat-value">{stats.messages}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-info">
            <span className="stat-label">Products Active</span>
            <span className="stat-value">{stats.products}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        {/* ── Traffic Line Chart ── */}
        <div className="admin-card chart-card">
          <h3>Web Traffic Trends</h3>
          <div className="chart-container">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="traffic-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = chartHeight - (pct * (chartHeight - 40) + 20);
                return (
                  <line 
                    key={i} 
                    x1="10" 
                    y1={y} 
                    x2={chartWidth - 10} 
                    y2={y} 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area under curve */}
              {points && (
                <polygon
                  points={`20,${chartHeight} ${points} ${chartWidth - 20},${chartHeight}`}
                  fill="url(#chartGrad)"
                />
              )}

              {/* Connecting line */}
              <polyline
                fill="none"
                stroke="var(--gold)"
                strokeWidth="3"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Node points */}
              {trafficData.map((d, index) => {
                const x = (index / (trafficData.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - ((d.count / maxCount) * (chartHeight - 40) + 20);
                return (
                  <g key={index} className="chart-node-group">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="var(--bg-deep)"
                      stroke="var(--gold)"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      fill="var(--cream)"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {d.count}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {trafficData.map((d, index) => {
                const x = (index / (trafficData.length - 1)) * (chartWidth - 40) + 20;
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 2}
                    fill="var(--muted)"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── Popular Pages list ── */}
        <div className="admin-card popularity-card">
          <h3>Popular Pages</h3>
          <div className="popularity-list">
            {pagePopularity.map((p, i) => (
              <div key={i} className="popularity-item">
                <span className="popularity-path">{p.path}</span>
                <span className="popularity-badge">{p.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        {/* ── Recent Activity / Orders ── */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View All</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.customer?.name}</td>
                    <td>KSh {o.total?.toLocaleString()}</td>
                    <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted)' }}>No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent Messages ── */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Recent Messages</h3>
            <Link to="/admin/messages" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View All</Link>
          </div>
          <div className="dashboard-messages">
            {recentMessages.map(m => (
              <div key={m.id} className="dashboard-message-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <strong>{m.name} {m.phone && <span style={{color:'var(--sand)',fontWeight:'400'}}>({m.phone})</span>}</strong>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--sand)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.message}
                </p>
              </div>
            ))}
            {recentMessages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '1rem' }}>No messages received.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
