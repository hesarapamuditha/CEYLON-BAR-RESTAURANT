import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService, reservationService, menuService, contactService, categoryService, authService } from '../services';
import {
  Users, ShoppingBag, Calendar, MessageSquare, TrendingUp, ChefHat,
  Plus, Edit, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const DIETARY_OPTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'halal', label: 'Halal' },
  { value: 'contains-nuts', label: 'Contains Nuts' },
  { value: 'dairy-free', label: 'Dairy Free' }
];

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Admin Management States
  const [admins, setAdmins] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminSubmitLoading, setAdminSubmitLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // Category Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  // Menu Modal States
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    dietaryTags: [],
    isAvailable: true,
    isFeatured: false,
    preparationTime: 15,
    hasSizes: false,
    sizes: { small: '', regular: '', large: '' },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, resRes, msgRes, statsRes, catRes, menuRes, adminRes] = await Promise.all([
          orderService.getAll({ limit: 10 }),
          reservationService.getAll({ limit: 10 }),
          contactService.getAll({ limit: 10 }),
          orderService.getStats(),
          categoryService.getAll(),
          menuService.getAll({ limit: 1000 }),
          authService.getAdmins(),
        ]);
        setOrders(ordersRes.data.orders);
        setReservations(resRes.data.reservations);
        setMessages(msgRes.data.messages);
        setStats(statsRes.data);
        setCategories(catRes.data.categories);
        setMenuItems(menuRes.data.items);
        setAdmins(adminRes.data.admins);
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
      const statsRes = await orderService.getStats();
      setStats(statsRes.data);
    } catch { toast.error('Update failed'); }
  };

  const updateReservation = async (id, status) => {
    try {
      await reservationService.update(id, { status });
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      toast.success('Reservation updated');
    } catch { toast.error('Update failed'); }
  };

  const handleTableChange = async (id, val) => {
    const tableNum = val ? parseInt(val) : null;
    try {
      await reservationService.update(id, { tableNumber: tableNum });
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, tableNumber: tableNum } : r));
      toast.success(`Table ${tableNum || 'unassigned'} successfully!`, { id: `table-assign-${id}` });
    } catch {
      toast.error('Failed to assign table');
    }
  };

  const markMessageRead = async (id) => {
    try {
      await contactService.update(id, { isRead: true });
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, isRead: true } : m));
    } catch { }
  };

  // Category Actions
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      displayOrder: 0,
      isActive: true,
    });
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await categoryService.update(editingCategory._id, categoryForm);
        setCategories(prev => prev.map(c => c._id === editingCategory._id ? res.data.category : c));
        toast.success('Category updated successfully');
      } else {
        const res = await categoryService.create(categoryForm);
        setCategories(prev => [...prev, res.data.category]);
        toast.success('Category created successfully');
      }
      setShowCategoryModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This might affect items in it.')) return;
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Menu Actions
  const openAddMenuItem = () => {
    setEditingMenuItem(null);
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category: categories[0]?._id || '',
      image: '',
      dietaryTags: [],
      isAvailable: true,
      isFeatured: false,
      preparationTime: 15,
      hasSizes: false,
      sizes: { small: '', regular: '', large: '' },
    });
    setShowMenuModal(true);
  };

  const openEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || '',
      price: item.price !== undefined && item.price !== null ? item.price : '',
      category: item.category?._id || item.category || '',
      image: item.image || '',
      dietaryTags: item.dietaryTags || [],
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isFeatured: item.isFeatured || false,
      preparationTime: item.preparationTime || 15,
      hasSizes: item.hasSizes || false,
      sizes: {
        small: item.sizes?.small !== undefined && item.sizes?.small !== null ? item.sizes.small : '',
        regular: item.sizes?.regular !== undefined && item.sizes?.regular !== null ? item.sizes.regular : '',
        large: item.sizes?.large !== undefined && item.sizes?.large !== null ? item.sizes.large : '',
      },
    });
    setShowMenuModal(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (!menuForm.category) {
      toast.error('Please select a category');
      return;
    }
    if (menuForm.hasSizes) {
      if (!menuForm.sizes.small && !menuForm.sizes.regular && !menuForm.sizes.large) {
        toast.error('Please enter a price for at least one size.');
        return;
      }
    }
    const payload = {
      ...menuForm,
      price: menuForm.hasSizes 
        ? parseFloat(menuForm.sizes.regular || menuForm.sizes.small || menuForm.sizes.large || 0)
        : parseFloat(menuForm.price),
      preparationTime: parseInt(menuForm.preparationTime),
      sizes: menuForm.hasSizes ? {
        small: menuForm.sizes.small ? parseFloat(menuForm.sizes.small) : null,
        regular: menuForm.sizes.regular ? parseFloat(menuForm.sizes.regular) : null,
        large: menuForm.sizes.large ? parseFloat(menuForm.sizes.large) : null,
      } : { small: null, regular: null, large: null }
    };
    try {
      if (editingMenuItem) {
        const res = await menuService.update(editingMenuItem._id, payload);
        setMenuItems(prev => prev.map(m => m._id === editingMenuItem._id ? res.data.item : m));
        toast.success('Menu item updated successfully');
      } else {
        const res = await menuService.create(payload);
        setMenuItems(prev => [...prev, res.data.item]);
        toast.success('Menu item created successfully');
      }
      setShowMenuModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await menuService.delete(id);
      setMenuItems(prev => prev.filter(m => m._id !== id));
      toast.success('Menu item deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openAddAdmin = () => {
    setAdminForm({
      name: '',
      email: '',
      password: '',
      phone: ''
    });
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminSubmitLoading(true);
    try {
      const res = await authService.createAdmin(adminForm);
      setAdmins(prev => [...prev, res.data.admin]);
      toast.success('Admin user created successfully');
      setShowAdminModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setAdminSubmitLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (id === user?._id) {
      toast.error('You cannot delete your own admin account!');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await authService.deleteAdmin(id);
      setAdmins(prev => prev.filter(a => a._id !== id));
      toast.success('Admin deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleDietaryChange = (tag) => {
    setMenuForm(prev => {
      const exists = prev.dietaryTags.includes(tag);
      const newTags = exists
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag];
      return { ...prev, dietaryTags: newTags };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
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
        <div className="admin-header-actions">
          {activeTab === 'categories' && (
            <button className="btn btn-primary" onClick={openAddCategory}>
              <Plus size={16} /> Add Category
            </button>
          )}
          {activeTab === 'menu' && (
            <button className="btn btn-primary" onClick={openAddMenuItem}>
              <Plus size={16} /> Add Menu Item
            </button>
          )}
          {activeTab === 'admins' && (
            <button className="btn btn-primary" onClick={openAddAdmin}>
              <Plus size={16} /> Add Admin
            </button>
          )}
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
        {['overview', 'orders', 'reservations', 'categories', 'menu', 'messages', 'admins'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'menu' ? 'Menu Items' : tab === 'admins' ? 'Admin Users' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                        <td>
                          <span className={`badge-type ${order.orderType || 'dine-in'}`}>
                            {order.orderType || 'dine-in'}
                            {order.orderType === 'dine-in' && order.tableNumber && ` (T-${order.tableNumber})`}
                          </span>
                        </td>
                        <td>${order.grandTotal.toFixed(2)}</td>
                        <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                        <td>
                          <select 
                            value={order.status} 
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)} 
                            className="status-select"
                            disabled={order.status === 'completed'}
                          >
                            {['pending', 'confirmed', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <tr><th>Code</th><th>Name</th><th>Date</th><th>Time</th><th>Size</th><th>Table</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr key={res._id}>
                        <td><code>{res.confirmationCode}</code></td>
                        <td>{res.name}</td>
                        <td>{new Date(res.date).toLocaleDateString()}</td>
                        <td>{res.time}</td>
                        <td>{res.partySize}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            placeholder="Assign"
                            value={res.tableNumber || ''}
                            onChange={(e) => handleTableChange(res._id, e.target.value)}
                            disabled={res.status === 'completed'}
                            className="table-number-input"
                          />
                        </td>
                        <td><span className={`status-badge status-${res.status}`}>{res.status}</span></td>
                        <td>
                          <select 
                            value={res.status} 
                            onChange={(e) => updateReservation(res._id, e.target.value)} 
                            className="status-select"
                            disabled={res.status === 'completed'}
                          >
                            {['pending', 'confirmed', 'cancelled', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="admin-section">
              <h2>Manage Menu Categories</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id}>
                        <td><strong>{cat.name}</strong></td>
                        <td>{cat.description || <span className="text-muted">No description</span>}</td>
                        <td>{cat.displayOrder}</td>
                        <td>
                          <span className={`badge-status ${cat.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-outline btn-sm" onClick={() => openEditCategory(cat)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(cat._id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center' }}>No categories found. Click "Add Category" to create one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Menu Items Tab */}
          {activeTab === 'menu' && (
            <div className="admin-section">
              <h2>Manage Menu Items</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Prep Time</th><th>Availability</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item._id}>
                        <td>
                          {item.image
                            ? <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }} 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = document.createElement('div');
                                  placeholder.style.width = '40px';
                                  placeholder.style.height = '40px';
                                  placeholder.style.display = 'flex';
                                  placeholder.style.alignItems = 'center';
                                  placeholder.style.justifyContent = 'center';
                                  placeholder.style.background = 'var(--bg-secondary)';
                                  placeholder.style.borderRadius = '4px';
                                  placeholder.innerText = '🍽️';
                                  e.target.parentNode.appendChild(placeholder);
                                }}
                              />
                            : <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px' }}>🍽️</div>
                          }
                        </td>
                        <td>
                          <div>
                            <strong>{item.name}</strong>
                            {item.isFeatured && <span className="badge-status badge-featured" style={{ marginLeft: 8, fontSize: '0.7rem', padding: '2px 6px' }}>Featured</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.dietaryTags?.join(', ')}
                          </div>
                        </td>
                        <td>{item.category?.name || <span className="text-muted">Uncategorized</span>}</td>
                        <td>
                          {item.hasSizes ? (
                            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 2, color: 'var(--text-muted)' }}>
                              {item.sizes?.small !== undefined && item.sizes?.small !== null && <div>S: <strong style={{ color: 'var(--text-primary)' }}>${item.sizes.small.toFixed(2)}</strong></div>}
                              {item.sizes?.regular !== undefined && item.sizes?.regular !== null && <div>R: <strong style={{ color: 'var(--text-primary)' }}>${item.sizes.regular.toFixed(2)}</strong></div>}
                              {item.sizes?.large !== undefined && item.sizes?.large !== null && <div>L: <strong style={{ color: 'var(--text-primary)' }}>${item.sizes.large.toFixed(2)}</strong></div>}
                            </div>
                          ) : (
                            `$${item.price.toFixed(2)}`
                          )}
                        </td>
                        <td>⏱ {item.preparationTime || 15} min</td>
                        <td>
                          <span className={`badge-status ${item.isAvailable ? 'badge-active' : 'badge-inactive'}`}>
                            {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-outline btn-sm" onClick={() => openEditMenuItem(item)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMenuItem(item._id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {menuItems.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center' }}>No menu items found. Click "Add Menu Item" to create one.</td></tr>
                    )}
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

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div className="admin-section">
              <h2>Manage Admin Users</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {admins.map((adminUser) => (
                      <tr key={adminUser._id}>
                        <td>
                          <strong>{adminUser.name}</strong>
                          {adminUser._id === user?._id && <span className="badge-status badge-featured" style={{ marginLeft: 8, fontSize: '0.7rem', padding: '2px 6px' }}>You</span>}
                        </td>
                        <td>{adminUser.email}</td>
                        <td>{adminUser.phone || <span className="text-muted">N/A</span>}</td>
                        <td>
                          {adminUser._id !== user?._id ? (
                            <div className="action-buttons">
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAdmin(adminUser._id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Non-deletable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No admins found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Category Add/Edit Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Rice & Curry"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Describe this category..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group" style={{ justifyContent: 'center', paddingTop: 24 }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    />
                    Is Category Active
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Add/Edit Modal */}
      {showMenuModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button className="modal-close" onClick={() => setShowMenuModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMenuSubmit}>
               <div className="form-row" style={{ alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Item Name *</label>
                  <input
                    type="text"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    placeholder="e.g. Chicken Kottu"
                  />
                </div>
                <div className="form-group" style={{ flex: 1, justifyContent: 'center', paddingTop: 20 }}>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={menuForm.hasSizes}
                      onChange={(e) => setMenuForm({ ...menuForm, hasSizes: e.target.checked })}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    Has Portion Sizes
                  </label>
                </div>
              </div>

              {!menuForm.hasSizes ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      placeholder="9.99"
                    />
                  </div>
                </div>
              ) : (
                <div className="form-row">
                  <div className="form-group">
                    <label>Small Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={menuForm.sizes.small}
                      onChange={(e) => setMenuForm({
                        ...menuForm,
                        sizes: { ...menuForm.sizes, small: e.target.value }
                      })}
                      placeholder="e.g. 7.99"
                    />
                  </div>
                  <div className="form-group">
                    <label>Regular Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={menuForm.sizes.regular}
                      onChange={(e) => setMenuForm({
                        ...menuForm,
                        sizes: { ...menuForm.sizes, regular: e.target.value }
                      })}
                      placeholder="e.g. 9.99"
                    />
                  </div>
                  <div className="form-group">
                    <label>Large Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={menuForm.sizes.large}
                      onChange={(e) => setMenuForm({
                        ...menuForm,
                        sizes: { ...menuForm.sizes, large: e.target.value }
                      })}
                      placeholder="e.g. 12.99"
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={menuForm.preparationTime}
                    onChange={(e) => setMenuForm({ ...menuForm, preparationTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  placeholder="Describe the dish ingredients, spice level, etc..."
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {menuForm.image && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <img
                        src={menuForm.image}
                        alt="Preview"
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setMenuForm(prev => ({ ...prev, image: '' }))}
                        style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {!menuForm.image?.startsWith('data:') ? (
                      <input
                        type="text"
                        value={menuForm.image}
                        onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                        placeholder="Or enter image URL (https://...)"
                      />
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        ✓ Local file loaded (Base64)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Dietary Tags</label>
                <div className="dietary-checkbox-grid">
                  {DIETARY_OPTIONS.map(opt => (
                    <label key={opt.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={menuForm.dietaryTags.includes(opt.value)}
                        onChange={() => handleDietaryChange(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={menuForm.isAvailable}
                      onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })}
                    />
                    In Stock / Available
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={menuForm.isFeatured}
                      onChange={(e) => setMenuForm({ ...menuForm, isFeatured: e.target.checked })}
                    />
                    Chef's Pick / Featured
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Menu Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Modal */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Admin User</h2>
              <button className="modal-close" onClick={() => setShowAdminModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="e.g. john@ceylonbar.com"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="e.g. +94 77 123 4567"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdminModal(false)} disabled={adminSubmitLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={adminSubmitLoading}>
                  {adminSubmitLoading ? 'Saving...' : 'Save Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
