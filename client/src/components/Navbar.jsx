import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/reservations', label: 'Reservations' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <UtensilsCrossed size={20} />
          <span>Ceylon Bar</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`nav-link ${location.pathname === link.to ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <LayoutDashboard size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name"><User size={14} /> {user.name}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
