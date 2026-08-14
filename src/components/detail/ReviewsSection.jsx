import { useState } from 'react';

const PREVIEW_LENGTH = 320;

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const avatar = review.authorDetails?.avatar_path
    ? `https://image.tmdb.org/t/p/w45${review.authorDetails.avatar_path}`
    : null;
  const rating = review.authorDetails?.rating;
  const isLong = review.content.length > PREVIEW_LENGTH;
  const text = isLong && !expanded ? review.content.slice(0, PREVIEW_LENGTH) + '…' : review.content;

  return (
    <article style={{
      padding: '1.25rem 1.5rem',
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
          background: 'rgba(15,23,42,0.8)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)',
        }}>
          {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✍️'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>{review.author}</p>
          {review.createdAt && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {typeof rating === 'number' && rating > 0 && (
          <span className="pill" style={{ fontSize: '0.75rem' }}>★ {rating.toFixed(1)}</span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
        {text}
      </p>
      {isLong && (
        <button type="button" className="btn-ghost" style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </article>
  );
}

export default function ReviewsSection({ reviews = [], loading = false }) {
  if (loading) {
    return (
      <div className="detail-section" style={{ marginTop: '2.5rem' }}>
        <SectionHeader title="Reviews" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />)}
        </div>
      </div>
    );
  }

  if (!reviews.length) return null;

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <SectionHeader title="Reviews" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.slice(0, 6).map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
      <h2 className="text-section" style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}
