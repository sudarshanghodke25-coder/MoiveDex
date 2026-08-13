import { useEffect, useMemo, useState } from 'react';
import { backdropUrl, posterUrl } from '../../services/tmdb';

/**
 * MediaGallery — cinematic image gallery (backdrops / posters / logos)
 * with filter tabs, lazy loading, hover effects, a "View All" toggle and
 * a full-screen lightbox (Escape / backdrop click / arrows to navigate).
 */

const TABS = [
  { id: 'all',      label: 'All' },
  { id: 'backdrops', label: 'Backdrops' },
  { id: 'posters',  label: 'Posters' },
  { id: 'logos',    label: 'Logos' },
];

const INITIAL_COUNT = 8;

export default function MediaGallery({ images = null, loading = false }) {
  const [tab, setTab] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const items = useMemo(() => {
    if (!images) return [];
    const list = [];
    (images.backdrops || []).slice(0, 20).forEach(img => list.push({ ...img, kind: 'backdrops' }));
    (images.posters || []).slice(0, 12).forEach(img => list.push({ ...img, kind: 'posters' }));
    (images.logos || []).slice(0, 10).forEach(img => list.push({ ...img, kind: 'logos' }));
    return list;
  }, [images]);

  // Only offer tabs that actually have items (never show an empty category)
  const availableTabs = TABS.filter(t => t.id === 'all' || items.some(i => i.kind === t.id));
  const effectiveTab = availableTabs.some(t => t.id === tab) ? tab : 'all';
  const filtered = effectiveTab === 'all' ? items : items.filter(i => i.kind === effectiveTab);
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  // ── Lightbox keyboard controls ──────────────────────────────────
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = e => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIdx, filtered.length]);

  if (loading) {
    return (
      <div className="detail-section" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
          <h2 className="text-section" style={{ margin: 0 }}>Gallery</h2>
        </div>
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '0.875rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '130px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) return null;

  const lightboxItem = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      {/* Header + tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
          <h2 className="text-section" style={{ margin: 0 }}>Gallery</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filtered.length} image{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {availableTabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setShowAll(false); }}
              style={{
                padding: '0.4rem 0.95rem', borderRadius: '999px',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                background: tab === t.id ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.05)',
                color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                border: tab === t.id ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '0.875rem' }}>
        {visible.map((img, i) => {
          const isBackdrop = img.kind === 'backdrops';
          const src = isBackdrop ? backdropUrl(img.file_path, 'md') : posterUrl(img.file_path, 'lg');
          return (
            <button
              key={`${img.kind}-${img.file_path}`}
              onClick={() => setLightboxIdx(filtered.indexOf(img))}
              aria-label={`Open image ${i + 1} of ${filtered.length} in full size`}
              style={{
                position: 'relative', aspectRatio: isBackdrop ? '16/9' : '2/3',
                borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in',
                border: '1px solid rgba(255,255,255,0.08)', padding: 0,
                background: 'var(--bg-elevated)', transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <img
                src={src}
                alt={`${img.kind} ${i + 1}`}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Hover zoom icon */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s ease',
              }} className="gallery-zoom">
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: 'rgba(245,158,11,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* View All toggle */}
      {filtered.length > INITIAL_COUNT && (
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button className="btn-ghost" onClick={() => setShowAll(s => !s)} style={{ borderRadius: '999px', fontWeight: 700 }}>
            {showAll ? 'Show Less' : `View All ${filtered.length} Images`}
          </button>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      {lightboxItem && (
        <div
          className="lightbox-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(2,2,4,0.94)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', animation: 'lightboxIn 0.25s ease',
          }}
        >
          {/* Close */}
          <button
            aria-label="Close preview"
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.5rem',
              width: '2.75rem', height: '2.75rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            ✕
          </button>

          {/* Prev / Next */}
          {filtered.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length); }}
                style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  width: '3rem', height: '3rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', cursor: 'pointer', fontSize: '1.1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ←
              </button>
              <button
                aria-label="Next image"
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % filtered.length); }}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  width: '3rem', height: '3rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', cursor: 'pointer', fontSize: '1.1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                →
              </button>
            </>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 'min(1100px, 92vw)', maxHeight: '86vh', textAlign: 'center' }}>
            <img
              src={lightboxItem.kind === 'backdrops' ? backdropUrl(lightboxItem.file_path, 'original') : posterUrl(lightboxItem.file_path, 'original')}
              alt={`${lightboxItem.kind} preview`}
              style={{
                maxWidth: '100%', maxHeight: '82vh', objectFit: 'contain',
                borderRadius: '12px', boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
              }}
            />
            <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {lightboxItem.kind} · {(lightboxIdx ?? 0) + 1} / {filtered.length}
              {lightboxItem.width ? ` · ${lightboxItem.width}×${lightboxItem.height}` : ''}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lightboxIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .gallery-grid:hover .gallery-zoom { opacity: 1; }
      `}</style>
    </div>
  );
}
