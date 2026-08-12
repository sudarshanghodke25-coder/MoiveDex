import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  seedInitialNotifications,
} from '../../services/notifications';
import gsap from 'gsap';

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const searchContainerRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapse search & popovers when route changes
  useEffect(() => {
    setSearchFocused(false);
    setSearchQuery('');
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Click outside listener for popovers
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscribe to notifications & seed initial notifications
  useEffect(() => {
    if (!currentUser?.uid) return;

    seedInitialNotifications(currentUser.uid);

    const unsubscribe = subscribeToNotifications(currentUser.uid, (data) => {
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Search input expand/collapse animation
  useEffect(() => {
    if (!searchContainerRef.current) return;
    if (searchFocused || searchQuery) {
      gsap.to(searchContainerRef.current, {
        width: 280,
        duration: 0.4,
        ease: 'power3.out',
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(255,255,255,0.08)',
      });
    } else {
      gsap.to(searchContainerRef.current, {
        width: 40,
        duration: 0.35,
        ease: 'power3.out',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
      });
    }
  }, [searchFocused, searchQuery]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markNotificationAsRead(currentUser.uid, notif.id);
    }
    setNotifOpen(false);
    if (notif.route) {
      navigate(notif.route);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(currentUser.uid, notifications);
  };

  const getNotificationImageUrl = (notif) => {
    const raw = notif.imageUrl || notif.posterPath;
    if (!raw) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `https://image.tmdb.org/t/p/w185${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const userInitial =
    currentUser?.displayName?.charAt(0).toUpperCase() ||
    currentUser?.email?.charAt(0).toUpperCase() ||
    'U';

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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search movies, shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              if (!searchQuery) setSearchFocused(false);
            }}
            aria-label="Search"
          />
        </form>

        {/* Notification Bell & Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            aria-label="Notifications"
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(225,29,72,0.6)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                right: 0,
                width: 'min(360px, 90vw)',
                padding: '0',
                zIndex: 100,
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#0e0e12',
              }}
            >
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(18,18,22,0.95)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(245,158,11,0.2)',
                        color: '#fbbf24',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div
                style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                }}
              >
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔔</span>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const imgUrl = getNotificationImageUrl(notif);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                          padding: '0.875rem 1.25rem',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: notif.isRead ? 'transparent' : 'rgba(245,158,11,0.06)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '0.875rem',
                          alignItems: 'center',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = notif.isRead
                            ? 'transparent'
                            : 'rgba(245,158,11,0.06)';
                        }}
                      >
                        {/* Real Poster Thumbnail */}
                        <div
                          style={{
                            width: '42px',
                            height: '56px',
                            borderRadius: '8px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            background: '#181820',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          }}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={notif.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerHTML = '🎬';
                              }}
                            />
                          ) : (
                            <span>
                              {notif.type === 'new_movie'
                                ? '🎬'
                                : notif.type === 'new_tv'
                                ? '📺'
                                : notif.type === 'new_anime'
                                ? '⚡'
                                : '🔔'}
                            </span>
                          )}
                        </div>

                        {/* Content text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              gap: '0.5rem',
                              marginBottom: '0.2rem',
                            }}
                          >
                            <h4
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: notif.isRead ? 600 : 800,
                                color: notif.isRead ? 'var(--text-secondary)' : '#f8fafc',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  background: 'var(--brand-primary)',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              margin: 0,
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div
          ref={profileRef}
          className="profile-container"
          onMouseEnter={() => setProfileOpen(true)}
          onMouseLeave={() => setProfileOpen(false)}
          style={{ position: 'relative', paddingBottom: '1rem', marginBottom: '-1rem' }}
        >
          <button
            className="profile-btn"
            aria-label="User menu"
            aria-expanded={profileOpen}
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <div
              className="profile-avatar"
              style={{
                overflow: 'hidden',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
              }}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                userInitial
              )}
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`profile-chevron ${profileOpen ? 'open' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div
              className="profile-dropdown glass-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                right: 0,
                minWidth: '230px',
                zIndex: 100,
                background: '#0e0e12',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}
            >
              <div className="dropdown-header" style={{ padding: '1rem' }}>
                <span className="dropdown-name" style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>
                  {currentUser?.displayName || 'MovieHub Fan'}
                </span>
                <span className="dropdown-email" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', wordBreak: 'break-all' }}>
                  {currentUser?.email}
                </span>
                <div style={{ marginTop: '0.5rem' }}>
                  {currentUser?.emailVerified ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#10b981',
                        background: 'rgba(16,185,129,0.12)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}
                    >
                      ✓ Verified
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.12)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      ⚠️ Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="divider" style={{ margin: '0', borderColor: 'rgba(255,255,255,0.08)' }} />

              <button
                className="dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile');
                }}
              >
                👤 Profile
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/mylist');
                }}
              >
                🔖 My List
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
              >
                ⚙️ Settings
              </button>

              <div className="divider" style={{ margin: '0', borderColor: 'rgba(255,255,255,0.08)' }} />

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
