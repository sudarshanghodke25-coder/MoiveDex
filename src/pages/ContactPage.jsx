import ContactForm from '../components/common/ContactForm';

export default function ContactPage() {
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
          Get in Touch
        </span>
        <h1 className="text-hero" style={{ marginBottom: '0.75rem' }}>
          Contact MovieDex
        </h1>
      </div>

      <ContactForm
        defaultSubject="General Question"
        description="Have a question, suggestion, or found something that needs attention? We'd love to hear from you."
      />
    </div>
  );
}
