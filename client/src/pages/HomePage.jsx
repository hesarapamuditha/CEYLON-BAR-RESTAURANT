import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, Award } from 'lucide-react';

const FEATURES = [
  { icon: '🍵', title: 'Authentic Ceylon Tea', desc: 'Single-origin high-grown Ceylon teas from the highlands' },
  { icon: '🍛', title: 'Traditional Cuisine', desc: 'Recipes passed down through generations of Sri Lankan families' },
  { icon: '🍹', title: 'Signature Cocktails', desc: 'Creative cocktails with a unique Ceylon arrack twist' },
  { icon: '🎭', title: 'Vibrant Ambiance', desc: 'Modern décor inspired by Sri Lanka\'s rich cultural heritage' },
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌿 Authentic Sri Lankan Experience</div>
          <h1 className="hero-title">
            Ceylon Bar<br />
            <span className="hero-accent">Restaurant</span>
          </h1>
          <p className="hero-subtitle">
            A celebration of Sri Lankan flavours, cocktails, and culture in the heart of the city. 
            From traditional rice & curry to handcrafted cocktails — every dish tells a story.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-primary btn-lg">
              View Our Menu <ArrowRight size={18} />
            </Link>
            <Link to="/reservations" className="btn btn-outline btn-lg">
              Book a Table
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span><strong>4.8</strong> Rating</span>
            </div>
            <div className="stat">
              <Clock size={16} />
              <span>Open Daily</span>
            </div>
            <div className="stat">
              <MapPin size={16} />
              <span>Colombo 03</span>
            </div>
            <div className="stat">
              <Award size={16} />
              <span>Est. 2018</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-placeholder">
            <div className="food-emoji-grid">
              <span>🍛</span><span>🍵</span><span>🦐</span>
              <span>🥘</span><span>🍹</span><span>🫕</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Ceylon Bar?</h2>
          <p>An unforgettable dining experience</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Experience Ceylon?</h2>
        <p>Join us for an unforgettable dining experience. Reserve your table today.</p>
        <div className="cta-actions">
          <Link to="/reservations" className="btn btn-primary btn-lg">Reserve a Table</Link>
          <Link to="/contact" className="btn btn-outline btn-lg">Get in Touch</Link>
        </div>
      </section>
    </div>
  );
}
