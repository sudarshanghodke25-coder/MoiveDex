import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import logoImg from '../../assets/MovieDex.jpg';
import { getDefaultAvatarUrl, getUserInitial } from '../../utils/userAvatar';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  seedInitialNotifications,
} from '../../services/notifications';

function NotifThumb({ notif, imgUrl }) {
  const [imgFailed, setImgFailed] = useState(false);
  const fallback = notif.type === 'new_movie' ? '🎬' : notif.type === 'new_tv' ? '📺' : notif.type === 'new_anime' ? '⚡' : '🔔';

  return (
    <div className="navbar-notif-thumb">
      {imgUrl && !imgFailed ? (
        <img
          src={imgUrl}
          alt={notif.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

const NAV_LINKS = [
  {
    label: 'Home',
    to: '/home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Movies',
    to: '/movies',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 3v18" />
        <path d="M3 7.5h4" />
        <path d="M3 12h18" />
        <path d="M3 16.5h4" />
        <path d="M17 3v18" />
        <path d="M17 7.5h4" />
        <path d="M17 16.5h4" />
      </svg>
    ),
  },
  {
    label: 'TV Shows',
    to: '/tv',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    ),
  },
  {
    label: 'Anime',
    to: '/anime',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m12 8-2.5 4-2.5-1 2.5 5h5l2.5-5-2.5 1Z" />
      </svg>
    ),
  },
  {
    label: 'Discover',
    to: '/discover',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </svg>
    ),
  },
  {
    label: 'Trending',
    to: '/trending',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    label: 'My List',
    to: '/mylist',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const navRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  const [canHover, setCanHover] = useState(true);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setMobileOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function isActive(to) {
    return location.pathname.startsWith(to);
  }

  // Detect hover capability (skip hover-open profile menu on touch)
  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches);
  }, []);

  // Close overlays whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Click outside — close popovers
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications — subscribe & seed
  useEffect(() => {
    if (!currentUser?.uid) return;
    seedInitialNotifications(currentUser.uid);
    const unsubscribe = subscribeToNotifications(currentUser.uid, (data) => setNotifications(data));
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Entrance animation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, { y: -70, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
    });
    return () => ctx.revert();
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollY = e.target.scrollTop || window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    
    // We attach this to .auth-content (inner app) or window (landing page)
    const authContent = document.querySelector('.auth-content');
    const target = authContent || window;
    
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  const rawAvatarUrl = getDefaultAvatarUrl(currentUser);
  const avatarUrl = avatarFailed ? '' : rawAvatarUrl;
  const userInitial = getUserInitial(currentUser);

  useEffect(() => {
    setAvatarFailed(false);
  }, [rawAvatarUrl]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  function getNotificationImageUrl(notif) {
    const raw = notif.imageUrl || notif.posterPath;
    if (!raw) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `https://image.tmdb.org/t/p/w185${raw.startsWith('/') ? '' : '/'}${raw}`;
  }

  function handleNotificationClick(notif) {
    if (!notif.isRead) markNotificationAsRead(currentUser.uid, notif.id);
    setNotifOpen(false);
    if (notif.route) navigate(notif.route);
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead(currentUser.uid, notifications);
  }

  return (
    <header
      ref={navRef}
      role="banner"
      className="navbar-header"
      style={{
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        opacity: showNavbar ? 1 : 0,
        pointerEvents: showNavbar ? 'auto' : 'none',
      }}
    >
      <nav
        aria-label="Main navigation"
        className="navbar-inner"
      >
        {/* Logo */}
        <Link
          to="/home"
          aria-label="MovieDex home"
          className="navbar-logo"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src={logoImg}
            alt="MovieDex logo"
            style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 0 15px rgba(225,29,72,0.4)' }}
          />
          <span className="navbar-logo-text">MovieDex</span>
        </Link>

        {/* Centered pill navigation (desktop) */}
        <ul className="navbar-center" role="list" aria-label="Primary navigation">
          {NAV_LINKS.map(({ label, to, icon }) => {
            const active = isActive(to);
            return (
              <li key={to} role="listitem">
                <Link
                  to={to}
                  className={`navbar-link ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="navbar-link-icon" aria-hidden="true">{icon}</span>
                  <span className="navbar-link-label">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right cluster: search + auth/avatar + burger */}
        <div className="navbar-right">
          <button
            type="button"
            className="navbar-search-compact"
            aria-label="Search"
            onClick={() => navigate('/search')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Search (desktop) */}
          <form className="navbar-search" role="search" onSubmit={handleSearchSubmit} aria-label="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search movies, shows, anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search movies, shows, anime"
            />
          </form>

          {/* Notifications bell & dropdown */}
          <div className="navbar-notif" ref={notifRef}>
            <button
              type="button"
              className="navbar-notif-btn"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setProfileOpen(false); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="navbar-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="navbar-notif-dropdown">
                <div className="navbar-notif-header">
                  <div className="navbar-notif-title-row">
                    <span className="navbar-notif-title">Notifications</span>
                    {unreadCount > 0 && <span className="navbar-notif-count">{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button type="button" className="navbar-notif-markall" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="navbar-notif-list">
                  {notifications.length === 0 ? (
                    <div className="navbar-notif-empty">
                      <span>🔔</span>
                      <p>No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const imgUrl = getNotificationImageUrl(notif);
                      return (
                        <div
                          key={notif.id}
                          className={`navbar-notif-item ${notif.isRead ? '' : 'unread'}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <NotifThumb notif={notif} imgUrl={imgUrl} />
                          <div className="navbar-notif-body">
                            <div className="navbar-notif-item-top">
                              <h4 className="navbar-notif-item-title">{notif.title}</h4>
                              {!notif.isRead && <span className="navbar-notif-dot" />}
                            </div>
                            <p className="navbar-notif-item-msg">{notif.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {currentUser ? (
            /* Authenticated: avatar + dropdown */
            <div
              className="navbar-profile"
              ref={profileRef}
              onMouseEnter={canHover ? () => setProfileOpen(true) : undefined}
              onMouseLeave={canHover ? () => setProfileOpen(false) : undefined}
            >
              <button
                type="button"
                className="navbar-profile-btn"
                aria-label="User menu"
                aria-expanded={profileOpen}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
              >
                <span className="navbar-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" onError={() => setAvatarFailed(true)} />
                  ) : (
                    userInitial
                  )}
                </span>
                <svg
                  className={`navbar-chevron ${profileOpen ? 'open' : ''}`}
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <div className="navbar-profile-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">{currentUser?.displayName || 'MovieDex Member'}</span>
                    <span className="navbar-dropdown-email">{currentUser?.email}</span>
                  </div>
                  <button type="button" onClick={() => { setProfileOpen(false); navigate('/profile'); }}>
                    👤 Profile
                  </button>
                  <button type="button" onClick={() => { setProfileOpen(false); navigate('/mylist'); }}>
                    🔖 My List
                  </button>
                  <button type="button" onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                    ⚙️ Settings
                  </button>
                  <div className="navbar-dropdown-divider" />
                  <button type="button" className="navbar-dropdown-logout" onClick={handleLogout}>
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                id="landing-nav-login"
                className="navbar-auth-btn navbar-auth-ghost navbar-auth-desktop"
              >
                Log In
              </Link>
              <Link
                to="/register"
                id="landing-nav-register"
                className="navbar-auth-btn navbar-auth-primary navbar-auth-desktop"
              >
                Register
              </Link>
            </>
          )}

          {/* Mobile burger */}
          <button
            type="button"
            className={`navbar-burger ${mobileOpen ? 'open' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu backdrop + drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="navbar-mobile-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="navbar-mobile">
          {/* Search */}
          <form className="navbar-mobile-search" role="search" onSubmit={handleSearchSubmit}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search movies, shows, anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search movies, shows, anime"
            />
          </form>

          <nav className="navbar-mobile-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ label, to, icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`navbar-mobile-link ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="navbar-link-icon" aria-hidden="true">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth actions inside the drawer */}
          <div className="navbar-mobile-auth">
            {currentUser ? (
              <button type="button" className="navbar-mobile-logout" onClick={handleLogout}>
                🚪 Log Out
              </button>
            ) : (
              <>
                <Link to="/login" className="navbar-auth-btn navbar-auth-ghost navbar-mobile-auth-btn">Log In</Link>
                <Link to="/register" className="navbar-auth-btn navbar-auth-primary navbar-mobile-auth-btn">Register</Link>
              </>
            )}
          </div>
        </div>
        </>
      )}
    </header>
  );
}
