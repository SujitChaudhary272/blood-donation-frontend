import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplets, Menu, X, LogOut, User, Trash2, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showSignupMenu, setShowSignupMenu] = useState(false);
  const [mobileAuthMenu, setMobileAuthMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const loginMenuRef = useRef(null);
  const signupMenuRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
    setShowUserMenu(false);
    setShowLoginMenu(false);
    setShowSignupMenu(false);
    setMobileAuthMenu(null);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target)) {
        setShowLoginMenu(false);
      }
      if (signupMenuRef.current && !signupMenuRef.current.contains(event.target)) {
        setShowSignupMenu(false);
      }
    };

    if (showUserMenu || showLoginMenu || showSignupMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginMenu, showSignupMenu, showUserMenu]);

  const handleNavClick = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
    setShowUserMenu(false);
    setShowLoginMenu(false);
    setShowSignupMenu(false);
    setMobileAuthMenu(null);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowLoginMenu(false);
    setShowSignupMenu(false);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      const confirmName = window.prompt('Enter your first name to confirm account deletion:');

      if (confirmName === null) {
        setShowUserMenu(false);
        return;
      }

      if (!confirmName.trim()) {
        alert('Incorrect username.');
        setShowUserMenu(false);
        return;
      }

      try {
        // Try passwordless deletion first so Google accounts can delete immediately
        // even if the local user object is stale or missing provider metadata.
        await authAPI.deleteAccount({ confirmName });
        logout();
        setShowUserMenu(false);
        setShowLoginMenu(false);
        setShowSignupMenu(false);
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/');
        alert('Your account has been deleted successfully.');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete account. Please try again.';
        const invalidName = message.toLowerCase().includes('incorrect username');
        const requiresPassword = message.toLowerCase().includes('please enter your password');

        if (invalidName) {
          alert('Incorrect username.');
          setShowUserMenu(false);
          return;
        }

        if (!requiresPassword) {
          alert(message);
          console.error('Delete account error:', error);
          setShowUserMenu(false);
          return;
        }

        const password = window.prompt('Please enter your password to confirm account deletion:');

        if (password === null) {
          setShowUserMenu(false);
          return;
        }

        if (!password.trim()) {
          alert('Password is required to delete your account.');
          setShowUserMenu(false);
          return;
        }

        try {
          await authAPI.deleteAccount({ password, confirmName });
          logout();
          setShowUserMenu(false);
          setShowLoginMenu(false);
          setShowSignupMenu(false);
          setIsOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          navigate('/');
          alert('Your account has been deleted successfully.');
        } catch (retryError) {
          alert(retryError.response?.data?.message || 'Failed to delete account. Please try again.');
          console.error('Delete account error:', retryError);
        }
      }
    }
    setShowUserMenu(false);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowLoginMenu(false);
    setShowSignupMenu(false);
    setShowUserMenu(prev => !prev);
  };

  const toggleLoginMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(false);
    setShowSignupMenu(false);
    setShowLoginMenu(prev => !prev);
  };

  const toggleSignupMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(false);
    setShowLoginMenu(false);
    setShowSignupMenu(prev => !prev);
  };

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    if (user?.role === 'donor') return '/donor-dashboard';
    if (user?.role === 'receiver') return '/receiver-dashboard';
    return '/';
  };

  const renderUserAvatar = (size = 36) => {
    if (user?.profilePhoto) {
      return (
        <img
          src={user.profilePhoto}
          alt={user?.name || 'User'}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            flexShrink: 0
          }}
        />
      );
    }

    return <User className="user-icon" />;
  };

  return (
    <nav className="navbar">
      {/* Animated Background Elements */}
      <div className="navbar-bg-animation">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="star star-5"></div>
        <div className="pulse-circle pulse-1"></div>
        <div className="pulse-circle pulse-2"></div>
      </div>

      <div className="navbar-container">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="navbar-brand"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setShowUserMenu(false);
          }}
        >
          <div className="blood-drop-wrapper">
            <Droplets className="brand-icon" />
            <div className="drop-ripple"></div>
          </div>
          <span className="brand-text">BloodLife</span>
          <div className="brand-shine"></div>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="navbar-menu">
            <Link 
              to="/" 
              className="nav-link"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span>Home</span>
              <div className="link-underline"></div>
            </Link>
            <Link 
              to="/search" 
              className="nav-link"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span>Search Blood</span>
              <div className="link-underline"></div>
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardPath()}
                  className="nav-link"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <User className="nav-icon" />
                  <span>Dashboard</span>
                  <div className="link-underline"></div>
                </Link>
                
                {/* User Menu Dropdown */}
                <div className="user-menu-wrapper" ref={menuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="user-menu-button"
                    type="button"
                  >
                    {renderUserAvatar()}
                    <span className="user-name-text">{user?.name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className={`chevron-icon ${showUserMenu ? 'rotated' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar-shell">
                          {renderUserAvatar(64)}
                        </div>
                        <p className="dropdown-user-name">{user?.name || 'User'}</p>
                        <p className="dropdown-user-email">{user?.email || ''}</p>
                        <p className="dropdown-user-role">
                          {user?.role || 'User'}
                        </p>
                      </div>

                      <div className="dropdown-actions">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => {
                            setShowUserMenu(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="dropdown-item dropdown-action-card"
                        >
                          <User className="dropdown-icon" />
                          <span>My Dashboard</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="dropdown-item dropdown-btn dropdown-action-card"
                          type="button"
                        >
                          <LogOut className="dropdown-icon" />
                          <span>Logout</span>
                        </button>

                        <button
                          onClick={handleDeleteAccount}
                          className="dropdown-item dropdown-btn dropdown-action-card delete-btn"
                          type="button"
                          title={user?.authProvider === 'google' || user?.provider === 'google' ? 'Google account deletion does not require a password.' : 'Password confirmation required before deletion.'}
                        >
                          <Trash2 className="dropdown-icon" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="auth-menu-wrapper" ref={loginMenuRef}>
                  <button
                    onClick={toggleLoginMenu}
                    className={`auth-trigger auth-trigger-login ${showLoginMenu ? 'auth-trigger-active' : ''}`}
                    type="button"
                  >
                    <span>Login</span>
                    <ChevronDown className={`chevron-icon ${showLoginMenu ? 'rotated' : ''}`} />
                  </button>

                  {showLoginMenu && (
                    <div className="auth-dropdown-menu">
                      <button
                        type="button"
                        className="auth-dropdown-item"
                        onClick={() => handleNavClick('/login?role=donor')}
                      >
                        <span className="auth-dropdown-title">Login as Donor</span>
                        <span className="auth-dropdown-subtitle">Access donation requests and certificates</span>
                      </button>
                      <button
                        type="button"
                        className="auth-dropdown-item"
                        onClick={() => handleNavClick('/login?role=receiver')}
                      >
                        <span className="auth-dropdown-title">Login as Receiver</span>
                        <span className="auth-dropdown-subtitle">Manage requests and donation progress</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="auth-menu-wrapper" ref={signupMenuRef}>
                  <button
                    onClick={toggleSignupMenu}
                    className={`auth-trigger auth-trigger-signup ${showSignupMenu ? 'auth-trigger-active' : ''}`}
                    type="button"
                  >
                    <span>Signup</span>
                    <ChevronDown className={`chevron-icon ${showSignupMenu ? 'rotated' : ''}`} />
                    <div className="btn-glow"></div>
                  </button>

                  {showSignupMenu && (
                    <div className="auth-dropdown-menu auth-dropdown-menu-signup">
                      <button
                        type="button"
                        className="auth-dropdown-item"
                        onClick={() => handleNavClick('/receiver-signup')}
                      >
                        <span className="auth-dropdown-title">Signup as Receiver</span>
                        <span className="auth-dropdown-subtitle">Find donors and request blood quickly</span>
                      </button>
                      <button
                        type="button"
                        className="auth-dropdown-item"
                        onClick={() => handleNavClick('/donor-signup')}
                      >
                        <span className="auth-dropdown-title">Signup as Donor</span>
                        <span className="auth-dropdown-subtitle">Create your donor profile and help patients</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <Sun className="theme-toggle-icon" /> : <Moon className="theme-toggle-icon" />}
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="mobile-controls">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn mobile-theme-toggle"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="theme-toggle-icon" /> : <Moon className="theme-toggle-icon" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-toggle"
              aria-label="Toggle menu"
              type="button"
            >
              {isOpen ? <X className="toggle-icon" /> : <Menu className="toggle-icon" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMobile && isOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            <Link
              to="/"
              className="mobile-nav-link"
              onClick={() => handleNavClick('/')}
            >
              Home
            </Link>
            <Link
              to="/search"
              className="mobile-nav-link"
              onClick={() => handleNavClick('/search')}
            >
              Search Blood
            </Link>
            <button
              type="button"
              className="mobile-nav-link mobile-action-btn mobile-theme-row"
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun className="mobile-icon" /> : <Moon className="mobile-icon" />}
              <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
           
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="mobile-nav-link"
                  onClick={() => handleNavClick(getDashboardPath())}
                >
                  <User className="mobile-icon" />
                  Dashboard
                </Link>
                
                <div className="mobile-user-info">
                  <div className="mobile-user-details">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      {renderUserAvatar(64)}
                    </div>
                    <p className="mobile-username">{user?.name || 'User'}</p>
                    <p className="mobile-useremail">{user?.email || ''}</p>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#dc2626', 
                      fontWeight: 600, 
                      textTransform: 'uppercase',
                      marginTop: '0.25rem'
                    }}>
                      {user?.role || 'User'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="mobile-nav-link mobile-action-btn"
                    type="button"
                  >
                    <LogOut className="mobile-icon" />
                    Logout
                  </button>

                  <button
                    onClick={() => {
                      handleDeleteAccount();
                      setIsOpen(false);
                    }}
                    className="mobile-nav-link mobile-action-btn mobile-delete-btn"
                    type="button"
                  >
                    <Trash2 className="mobile-icon" />
                    Delete Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`mobile-auth-group ${mobileAuthMenu === 'login' ? 'mobile-auth-group-open' : ''}`}>
                  <button
                    type="button"
                    className="mobile-nav-link mobile-auth-trigger"
                    onClick={() => setMobileAuthMenu(prev => (prev === 'login' ? null : 'login'))}
                  >
                    <span>Login</span>
                    <ChevronDown className={`chevron-icon ${mobileAuthMenu === 'login' ? 'rotated' : ''}`} />
                  </button>
                  {mobileAuthMenu === 'login' && (
                    <div className="mobile-auth-options">
                      <button
                        type="button"
                        className="mobile-auth-option"
                        onClick={() => handleNavClick('/login?role=donor')}
                      >
                        Login as Donor
                      </button>
                      <button
                        type="button"
                        className="mobile-auth-option"
                        onClick={() => handleNavClick('/login?role=receiver')}
                      >
                        Login as Receiver
                      </button>
                    </div>
                  )}
                </div>

                <div className={`mobile-auth-group ${mobileAuthMenu === 'signup' ? 'mobile-auth-group-open' : ''}`}>
                  <button
                    type="button"
                    className="mobile-nav-link mobile-auth-trigger mobile-signup-btn"
                    onClick={() => setMobileAuthMenu(prev => (prev === 'signup' ? null : 'signup'))}
                  >
                    <span>Signup</span>
                    <ChevronDown className={`chevron-icon ${mobileAuthMenu === 'signup' ? 'rotated' : ''}`} />
                  </button>
                  {mobileAuthMenu === 'signup' && (
                    <div className="mobile-auth-options mobile-auth-options-signup">
                      <button
                        type="button"
                        className="mobile-auth-option"
                        onClick={() => handleNavClick('/receiver-signup')}
                      >
                        Signup as Receiver
                      </button>
                      <button
                        type="button"
                        className="mobile-auth-option"
                        onClick={() => handleNavClick('/donor-signup')}
                      >
                        Signup as Donor
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
