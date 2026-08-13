import ContactForm from '../components/common/ContactForm';

export default function FeedbackPage() {
  return (
    <div className="page-content" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--brand-secondary)',
            marginBottom: '0.75rem',
          }}
        >
          Share Your Thoughts
        </span>
        <h1 className="text-hero" style={{ marginBottom: '0.75rem' }}>
          Feedback
        </h1>
      </div>

      <ContactForm
        defaultSubject="Feedback"
        description="Your feedback helps us improve MovieDex. Share a feature request, report a bug, or just tell us what you think."
      />
    </div>
  );
}
