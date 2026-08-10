/** Shimmer skeleton matching MovieCard dimensions */
export default function MovieCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      aria-busy="true"
      style={{
        width: 'clamp(160px, 18vw, 220px)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--bg-surface)',
      }}
    >
      {/* Poster placeholder */}
      <div
        className="skeleton"
        style={{ aspectRatio: '2/3', width: '100%' }}
      />
      {/* Info lines */}
      <div style={{ padding: '0.625rem 0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton" style={{ height: '14px', width: '80%' }} />
        <div className="skeleton" style={{ height: '11px', width: '50%' }} />
      </div>
    </div>
  );
}
