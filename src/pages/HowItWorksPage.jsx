import { Link } from 'react-router-dom';

const STEPS = [
  {
    number: '01',
    icon: '🔭',
    title: 'Discover',
    description:
      'Browse curated rows of trending movies, popular TV shows, and anime on the Home screen. Filter by genre, explore Movies, TV, and Anime sections separately.',
    action: { label: 'Browse Home', to: '/home' },
  },
  {
    number: '02',
    icon: '🔍',
    title: 'Search',
    description:
      'Looking for something specific? Use the search bar to find any title, actor, director, or character across the entire TMDB catalogue instantly.',
    action: { label: 'Open Search', to: '/search' },
  },
  {
    number: '03',
    icon: '📋',
    title: 'Explore Details',
    description:
      'Click any title to open its detail page — full cast & crew, ratings, genre tags, runtime, overview, similar recommendations, and more.',
  },
  {
    number: '04',
    icon: '▶️',
    title: 'Watch Trailers',
    description:
      'Play official trailers directly inside MovieDex. No redirects — watch in-app with a single click.',
  },
  {
    number: '05',
    icon: '🔖',
    title: 'Add to My List',
    description:
      'Seen something you want to watch later? Hit the bookmark icon to add any title to your personal My List. It\'s private and tied to your account.',
    action: { label: 'My List', to: '/mylist' },
  },
  {
    number: '06',
    icon: '🗂️',
    title: 'Track Your Collection',
    description:
      'Revisit My List anytime to see everything you\'ve saved. Remove titles you\'ve already watched or no longer want. Your list grows with you.',
    action: { label: 'View My List', to: '/mylist' },
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <section style={{ textAlign: 'center', paddingBottom: '3rem' }}>
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
          Guide
        </span>
        <h1 className="text-hero" style={{ marginBottom: '1rem' }}>
          How It{' '}
          <span className="gradient-text-luxe">Works</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
          MovieDex is designed to be effortless. Here&apos;s how to get the most
          out of it — from discovery to your personal collection.
        </p>
      </section>

      {/* Steps Timeline */}
      <section style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              style={{
                display: 'flex',
                gap: '2rem',
                position: 'relative',
              }}
            >
              {/* Left: number + connector line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '56px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--brand-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                    boxShadow: 'var(--glow-primary)',
                    zIndex: 1,
                  }}
                >
                  {step.number}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '2rem',
                      background: 'linear-gradient(to bottom, rgba(225,29,72,0.4), rgba(245,158,11,0.15))',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  />
                )}
              </div>

              {/* Right: content card */}
              <div
                className="glass-card"
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  marginBottom: idx < STEPS.length - 1 ? '1rem' : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{step.icon}</span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {step.title}
                  </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.925rem', margin: 0 }}>
                  {step.description}
                </p>
                {step.action && (
                  <Link
                    to={step.action.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--brand-secondary)',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {step.action.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TMDB note */}
      <section
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          All movie, TV, and anime metadata is sourced from{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand-secondary)' }}
          >
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </section>
    </div>
  );
}
