import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [profileOpen,   setProfileOpen]   = useState(false);

  const searchContainerRef = useRef(null);

  const { currentUser, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Collapse search when route changes
  useEffect(() => {
    setSearchFocused(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Search input expand/collapse animation
  useEffect(() => {
    if (!searchContainerRef.current) return;
    if (searchFocused || searchQuery) {
      gsap.to(searchContainerRef.current, {
        width: 280, duration: 0.4, ease: 'power3.out',
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(255,255,255,0.08)',
      });
    } else {
      gsap.to(searchContainerRef.current, {
        width: 40, duration: 0.35, ease: 'power3.out',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
      });
    }
  }, [searchFocused, searchQuery]);

  const handleLogout = async () => {
    try { await logout(); navigate('/'); }
    catch (e) { console.error('Logout failed', e); }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userInitial = currentUser?.displayName?.charAt(0).toUpperCase()
    || currentUser?.email?.charAt(0).toUpperCase()
    || 'U';

  return (
    <header className="auth-topbar">
      <div className="topbar-left" />

      <div className="topbar-right">
        {/* Expandable Search */}
        <form
          ref={searchContainerRef}
          className={`topbar-search ${searchFocused || searchQuery ? 'active' : ''}`}
          onSubmit={handleSearchSubmit}
          style={{ width: 40 }}
        >
          <button
            type="button"
            className="search-icon-btn"
            aria-label="Open search"
            onClick={() => setSearchFocused(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search movies, shows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => { if (!searchQuery) setSearchFocused(false); }}
            aria-label="Search"
          />
        </form>

        {/* Notifications (decorative for now) */}
        <button className="btn-icon" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </button>

        {/* User Profile Dropdown */}
        <div
          className="profile-container"
          onMouseEnter={() => setProfileOpen(true)}
          onMouseLeave={() => setProfileOpen(false)}
        >
          <button className="profile-btn" aria-label="User menu" aria-expanded={profileOpen}>
            <div className="profile-avatar">{userInitial}</div>
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`profile-chevron ${profileOpen ? 'open' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {profileOpen && (
            <div className="profile-dropdown glass-card">
              <div className="dropdown-header">
                <span className="dropdown-name">{currentUser?.displayName || 'User'}</span>
                <span className="dropdown-email">{currentUser?.email}</span>
              </div>
              <div className="divider" style={{ margin: '0.5rem 0' }} />
              <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate('/profile'); }}>
                👤 Profile
              </button>
              <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate('/mylist'); }}>
                🔖 My List
              </button>
              <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                ⚙️ Settings
              </button>
              <div className="divider" style={{ margin: '0.5rem 0' }} />
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                🚪 Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
