import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const FEATURES = [
  {
    icon: '🎬',
    title: 'Movies',
    description:
      'Browse an extensive library of films across every genre — from blockbusters to hidden indie gems — all powered by real-time TMDB metadata.',
  },
  {
    icon: '📺',
    title: 'TV Shows',
    description:
      'Discover television series from every network and streaming platform, with full season and episode breakdowns.',
  },
  {
    icon: '⚡',
    title: 'Anime',
    description:
      'Explore a dedicated anime catalogue, including classics and the latest seasonal releases.',
  },
  {
    icon: '🔍',
    title: 'Search',
    description:
      'Find any title, actor, or director instantly with full-text search across the entire TMDB catalogue.',
  },
  {
    icon: '🔖',
    title: 'My List',
    description:
      'Build a personal watchlist that syncs to your account. Your list is private and only visible to you.',
  },
  {
    icon: '▶️',
    title: 'Trailers',
    description:
      'Watch official trailers and clips directly inside MovieDex without leaving the page.',
  },
];

export default function AboutPage() {
  usePageTitle('About | MovieDex');

  return (
    <div className="page-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <section style={{ textAlign: 'center', paddingBottom: '3rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--brand-secondary)',
            marginBottom: '1rem',
          }}
        >
          About
        </span>
        <h1
          className="text-hero"
          style={{ marginBottom: '1.25rem' }}
        >
          Your Cinematic{' '}
          <span className="gradient-text-luxe">Gateway</span>
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto 2rem',
          }}
        >
          MovieDex is a personal movie, TV show, and anime discovery platform.
          Browse rich metadata, watch trailers, and curate your own private
          watchlist — all in one place.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Powered by</span>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand-secondary)', fontWeight: 700 }}
          >
            TMDB
          </a>
          <span>— not endorsed or certified by TMDB</span>
        </div>
      </section>

      {/* What is MovieDex */}
      <section style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <h2 className="text-title" style={{ marginBottom: '1rem' }}>
          What is MovieDex?
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem' }}>
          MovieDex is a discovery and cataloguing tool for cinephiles, TV
          enthusiasts, and anime fans. It aggregates publicly available metadata
          from{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand-secondary)' }}
          >
            The Movie Database (TMDB)
          </a>{' '}
          to provide rich detail pages — cast, crew, ratings, overviews,
          trailers, and more.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          MovieDex does <strong style={{ color: 'var(--text-primary)' }}>not</strong> host,
          distribute, or stream any commercial film or television content.
          All metadata and imagery is sourced from TMDB via their public API
          under TMDB&apos;s terms of service.
        </p>
      </section>

      {/* Feature Grid */}
      <section style={{ paddingBottom: '3rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="text-title" style={{ marginBottom: '2rem' }}>
          What You Can Do
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <span style={{ fontSize: '2rem' }}>{f.icon}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <h2 className="text-title" style={{ marginBottom: '0.75rem' }}>
          Ready to explore?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Head to the home screen and start discovering.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/home" className="btn-primary">
            Browse Movies
          </Link>
          <Link to="/how-it-works" className="btn-ghost">
            How It Works
          </Link>
        </div>
      </section>
    </div>
  );
}
