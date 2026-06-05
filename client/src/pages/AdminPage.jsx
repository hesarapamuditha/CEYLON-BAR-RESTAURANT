import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService, reservationService, menuService, contactService } from '../services';
import { Users, ShoppingBag, Calendar, MessageSquare, TrendingUp, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, resRes, msgRes, statsRes] = await Promise.all([
          orderService.getAll({ limit: 10 }),
          reservationService.getAll({ limit: 10 }),
          contactService.getAll({ limit: 10 }),
          orderService.getStats(),
        ]);
        setOrders(ordersRes.data.orders);
        setReservations(resRes.data.reservations);
        setMessages(msgRes.data.messages);
        setStats(statsRes.data);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, { status });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      toast.success('Order updated');
    } catch { toast.error('Update failed'); }
  };

  const updateReservation = async (id, status) => {
    try {
      await reservationService.update(id, { status });
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      toast.success('Reservation updated');
    } catch { toast.error('Update failed'); }
  };

  const markMessageRead = async (id) => {
    try {
      await contactService.update(id, { isRead: true });
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, isRead: true } : m));
    } catch {}
  };

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = orders.length;

  return (
    <div className="admin-page page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <ShoppingBag size={24} />
          <div><span className="stat-num">{totalOrders}</span><span>Recent Orders</span></div>
        </div>
        <div className="stat-card">
          <Calendar size={24} />
          <div><span className="stat-num">{reservations.length}</span><span>Reservations</span></div>
        </div>
        <div className="stat-card">
          <MessageSquare size={24} />
          <div><span className="stat-num">{messages.filter(m => !m.isRead).length}</span><span>Unread Messages</span></div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div><span className="stat-num">${totalRevenue.toFixed(0)}</span><span>Total Revenue</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview', 'orders', 'reservations', 'messages'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          {/* Orders Tab */}
          {(activeTab === 'overview' || activeTab === 'orders') && (
            <div className="admin-section">
              <h2>Recent Orders</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-6)}</td>
                        <td>{order.user?.name || order.guestName || 'Guest'}</td>
                        <td><span className="badge">{order.orderType}</span></td>
                        <td>${order.grandTotal.toFixed(2)}</td>
                        <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                        <td>
                          <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className="status-select">
                            {['pending','confirmed','preparing','ready','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {(activeTab === 'overview' || activeTab === 'reservations') && (
            <div className="admin-section">
              <h2>Recent Reservations</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Code</th><th>Name</th><th>Date</th><th>Time</th><th>Size</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr key={res._id}>
                        <td><code>{res.confirmationCode}</code></td>
                        <td>{res.name}</td>
                        <td>{new Date(res.date).toLocaleDateString()}</td>
                        <td>{res.time}</td>
                        <td>{res.partySize}</td>
                        <td><span className={`status-badge status-${res.status}`}>{res.status}</span></td>
                        <td>
                          <select value={res.status} onChange={(e) => updateReservation(res._id, e.target.value)} className="status-select">
                            {['pending','confirmed','cancelled','completed','no-show'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {(activeTab === 'overview' || activeTab === 'messages') && (
            <div className="admin-section">
              <h2>Contact Messages</h2>
              <div className="messages-list">
                {messages.map((msg) => (
                  <div key={msg._id} className={`message-card ${!msg.isRead ? 'unread' : ''}`} onClick={() => markMessageRead(msg._id)}>
                    <div className="message-header">
                      <strong>{msg.name}</strong>
                      <span className="message-email">{msg.email}</span>
                      {!msg.isRead && <span className="badge badge-new">New</span>}
                    </div>
                    <p className="message-subject">{msg.subject}</p>
                    <p className="message-body">{msg.message.substring(0, 120)}...</p>
                    <span className="message-date">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
