import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'all',    label: 'All Saved' },
  { id: 'movie',  label: 'Movies' },
  { id: 'tv',     label: 'TV Shows' },
];

export default function MyListPage() {
  const { watchlist, clearWatchlist } = useWatchlist();
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = watchlist.filter(item => {
    if (activeTab === 'all') return true;
    return (item.mediaType || 'movie') === activeTab;
  });

  const movieCount = watchlist.filter(i => (i.mediaType || 'movie') === 'movie').length;
  const tvCount    = watchlist.filter(i => (i.mediaType || 'movie') === 'tv').length;

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-hero page-title">
            <span className="gradient-text">My List</span>
          </h1>
          <p className="page-subtitle">Your saved collection of movies, TV series, and anime.</p>
        </div>
        {watchlist.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your watchlist?')) {
                clearWatchlist();
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          >
            Clear All ({watchlist.length})
          </button>
        )}
      </div>

      {watchlist.length > 0 && (
        <div className="tab-bar">
          {TABS.map(tab => {
            const count = tab.id === 'all' ? watchlist.length : tab.id === 'movie' ? movieCount : tvCount;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.25rem', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🔖</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>Your list is empty</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6 }}>
            Save movies and TV shows to your personal watchlist to easily track and watch them later.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Link
              to="/movies"
              className="btn-primary"
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #e11d48 0%, #d97706 100%)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#f8fafc',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(225,29,72,0.35)',
              }}
            >
              Explore Movies
            </Link>
            <Link
              to="/tv"
              className="btn-ghost"
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore TV Shows
            </Link>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No items found in this filter category.</p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredItems.map(item => (
            <MovieCard key={`${item.mediaType}-${item.id}`} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
}
