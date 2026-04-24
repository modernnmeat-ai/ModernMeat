import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Flame, Menu, X, User, LogOut, Shield, Moon, Sun } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <Flame color="#D4AF37" size={32} />
          MODERN MEAT
        </Link>
        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Asosiy</Link>
          <Link to="/market" onClick={() => setIsMobileMenuOpen(false)}>Market</Link>
          <a href="/#about" onClick={() => setIsMobileMenuOpen(false)}>Biz haqimizda</a>
          <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Aloqa</a>
          {isAdmin && (
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--gold)' }}>
              <Shield size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Admin
            </Link>
          )}
        </nav>
        <div className="nav-actions">
          <button
            className="add-to-cart cart-btn"
            onClick={() => setIsCartOpen(true)}
            style={{ width: 'auto', padding: '0 20px', borderRadius: '4px', gap: '8px' }}
          >
            <ShoppingCart size={18} />
            <span className="cart-text">Savat {totalItems > 0 && `(${totalItems})`}</span>
          </button>

          {isLoggedIn ? (
            <div className="user-menu-wrap">
              <button className="user-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <strong>{user?.firstName} {user?.lastName}</strong>
                    <span>{user?.phone}</span>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <LogOut size={16} /> Chiqish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn">
              <User size={18} />
              <span className="cart-text">Kirish</span>
            </Link>
          )}

          <button className="theme-toggle-btn" onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
