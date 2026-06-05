import { useState, useEffect } from 'react';
import { menuService, categoryService } from '../services';
import { useCart } from '../context/CartContext';
import { Star, Search, ShoppingCart, Leaf, Flame, Wheat, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const DIETARY_ICONS = {
  vegan: { icon: <Leaf size={11} />, color: '#22c55e', label: 'Vegan' },
  vegetarian: { icon: <Leaf size={11} />, color: '#86efac', label: 'Vegetarian' },
  spicy: { icon: <Flame size={11} />, color: '#ef4444', label: 'Spicy' },
  'gluten-free': { icon: <Wheat size={11} />, color: '#f59e0b', label: 'GF' },
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [justAdded, setJustAdded] = useState({}); // track per-item add animation
  const [selectedSizes, setSelectedSizes] = useState({});

  const { addItem, openCart } = useCart();

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

  const filtered = items
    .filter((item) => {
      const matchCat = !selectedCategory || item.category?._id === selectedCategory;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.averageRating - a.averageRating;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  const handleAddToCart = (item) => {
    const availableSizes = [];
    if (item.sizes?.small !== null && item.sizes?.small !== undefined) availableSizes.push('small');
    if (item.sizes?.regular !== null && item.sizes?.regular !== undefined) availableSizes.push('regular');
    if (item.sizes?.large !== null && item.sizes?.large !== undefined) availableSizes.push('large');

    const activeSize = selectedSizes[item._id] || (availableSizes.includes('regular') ? 'regular' : availableSizes[0]);
    const price = item.hasSizes && activeSize ? item.sizes[activeSize] : item.price;

    addItem({
      ...item,
      price,
      ...(item.hasSizes && activeSize && { selectedSize: activeSize }),
    });
    toast.success(`${item.name}${item.hasSizes && activeSize ? ` (${activeSize})` : ''} added!`, { duration: 1500, icon: '🛒' });
    // flash the button green briefly
    setJustAdded((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => setJustAdded((prev) => ({ ...prev, [item._id]: false })), 1200);
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
          <Search size={16} />
          <input placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button className={`tab-btn ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`tab-btn ${selectedCategory === cat._id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="results-count">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          {search && ` for "${search}"`}
          {selectedCategory && ` in ${categories.find(c => c._id === selectedCategory)?.name}`}
        </p>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map((item) => {
            const availableSizes = [];
            if (item.sizes?.small !== null && item.sizes?.small !== undefined) availableSizes.push('small');
            if (item.sizes?.regular !== null && item.sizes?.regular !== undefined) availableSizes.push('regular');
            if (item.sizes?.large !== null && item.sizes?.large !== undefined) availableSizes.push('large');

            const activeSize = selectedSizes[item._id] || (availableSizes.includes('regular') ? 'regular' : availableSizes[0]);
            const displayedPrice = item.hasSizes && activeSize ? item.sizes[activeSize] : item.price;

            return (
              <div key={item._id} className="menu-card">
                <div className="menu-card-image">
                  {item.image
                    ? <img 
                        src={item.image} 
                        alt={item.name} 
                        loading="lazy" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'menu-card-placeholder';
                          placeholder.innerText = '🍽️';
                          e.target.parentNode.appendChild(placeholder);
                        }}
                      />
                    : <div className="menu-card-placeholder">🍽️</div>
                  }
                  {item.isFeatured && <span className="badge badge-featured">Chef's Pick</span>}
                  {!item.isAvailable && <div className="unavailable-overlay">Unavailable</div>}
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-top">
                    <h3>{item.name}</h3>
                    <span className="price">${displayedPrice.toFixed(2)}</span>
                  </div>
                  <p className="menu-card-desc">{item.description}</p>

                  {item.hasSizes && (
                    <div className="size-selector" style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
                      {['small', 'regular', 'large'].map((sz) => {
                        const sizePrice = item.sizes?.[sz];
                        if (sizePrice === null || sizePrice === undefined) return null;
                        const isActive = activeSize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            className={`size-select-btn ${isActive ? 'active' : ''}`}
                            style={{
                              padding: '6px 8px',
                              fontSize: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                              background: isActive ? 'var(--accent-glow)' : 'none',
                              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                              cursor: 'pointer',
                              textTransform: 'capitalize',
                              flex: 1,
                              textAlign: 'center',
                              fontWeight: isActive ? '600' : '400',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => setSelectedSizes(prev => ({ ...prev, [item._id]: sz }))}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  )}

                <div className="menu-card-meta">
                  <div className="dietary-tags">
                    {item.dietaryTags?.map((tag) => DIETARY_ICONS[tag] && (
                      <span key={tag} className="dietary-tag" style={{ background: DIETARY_ICONS[tag].color + '22', color: DIETARY_ICONS[tag].color }}>
                        {DIETARY_ICONS[tag].icon} {DIETARY_ICONS[tag].label}
                      </span>
                    ))}
                  </div>
                  {item.averageRating > 0 && (
                    <div className="rating">
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span>{item.averageRating.toFixed(1)}</span>
                      <span className="review-count">({item.reviewCount})</span>
                    </div>
                  )}
                </div>

                {item.preparationTime && (
                  <p className="prep-time">⏱ ~{item.preparationTime} min</p>
                )}

                <button
                  className={`btn btn-sm add-btn ${justAdded[item._id] ? 'added' : 'btn-primary'}`}
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.isAvailable}
                >
                  {justAdded[item._id]
                    ? <><Check size={14} /> Added!</>
                    : <><Plus size={14} /> Add to Order</>
                  }
                </button>
              </div>
            </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
              <p>No items found{search ? ` for "${search}"` : ''}.</p>
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSelectedCategory(''); }}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
