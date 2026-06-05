import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuService, categoryService } from '../services';
import { Star, Search, Filter, ShoppingCart, Leaf, Flame, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';

const DIETARY_ICONS = {
  vegan: { icon: <Leaf size={12} />, color: '#22c55e', label: 'Vegan' },
  vegetarian: { icon: <Leaf size={12} />, color: '#86efac', label: 'Vegetarian' },
  spicy: { icon: <Flame size={12} />, color: '#ef4444', label: 'Spicy' },
  'gluten-free': { icon: <Wheat size={12} />, color: '#f59e0b', label: 'GF' },
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          menuService.getAll({ available: true }),
          categoryService.getAll(),
        ]);
        setItems(menuRes.data.items);
        setCategories(catRes.data.categories);
      } catch {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = items.filter((item) => {
    const matchCat = !selectedCategory || item.category?._id === selectedCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c._id === item._id);
      if (exists) return prev.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="page menu-page">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Authentic Sri Lankan flavours crafted with love</p>
      </div>

      {/* Filters */}
      <div className="menu-filters">
        <div className="search-bar">
          <Search size={18} />
          <input placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button className={`tab-btn ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>All</button>
        {categories.map((cat) => (
          <button key={cat._id} className={`tab-btn ${selectedCategory === cat._id ? 'active' : ''}`} onClick={() => setSelectedCategory(cat._id)}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map((item) => (
            <div key={item._id} className="menu-card">
              <div className="menu-card-image">
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="menu-card-placeholder">🍽️</div>}
                {item.isFeatured && <span className="badge badge-featured">Chef's Pick</span>}
              </div>
              <div className="menu-card-body">
                <div className="menu-card-top">
                  <h3>{item.name}</h3>
                  <span className="price">${item.price.toFixed(2)}</span>
                </div>
                <p className="menu-card-desc">{item.description}</p>
                <div className="menu-card-footer">
                  <div className="dietary-tags">
                    {item.dietaryTags?.map((tag) => DIETARY_ICONS[tag] && (
                      <span key={tag} className="dietary-tag" style={{ background: DIETARY_ICONS[tag].color + '22', color: DIETARY_ICONS[tag].color }}>
                        {DIETARY_ICONS[tag].icon} {DIETARY_ICONS[tag].label}
                      </span>
                    ))}
                  </div>
                  <div className="rating">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}</span>
                    {item.reviewCount > 0 && <span className="review-count">({item.reviewCount})</span>}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                  <ShoppingCart size={14} /> Add to Order
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state">No items found</div>}
        </div>
      )}

      {/* Floating cart */}
      {cart.length > 0 && (
        <div className="cart-fab">
          <ShoppingCart size={20} />
          <span>{cart.reduce((s, c) => s + c.qty, 0)} items</span>
          <span className="cart-total">${cart.reduce((s, c) => s + c.price * c.qty, 0).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
