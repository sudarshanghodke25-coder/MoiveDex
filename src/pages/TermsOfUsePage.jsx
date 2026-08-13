const LAST_UPDATED = 'August 2026';

export default function TermsOfUsePage() {
  return (
    <div className="page-content" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-subtle)' }}>
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
          Legal
        </span>
        <h1 className="text-hero" style={{ marginBottom: '0.75rem' }}>
          Terms of Use
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Notice */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          marginBottom: '2.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        ⚠️&nbsp; <strong style={{ color: 'var(--brand-secondary)' }}>Note:</strong> These terms are a general-purpose starting point. They should be reviewed by a qualified legal professional before public commercial deployment.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <Section title="1. Acceptance of Terms">
          By accessing or using MovieDex, you agree to be bound by these Terms of Use. If you do not agree, please do not use the application.
        </Section>

        <Section title="2. Acceptable Use">
          You agree to use MovieDex only for lawful personal purposes. You must not:
          <ul>
            <li>Attempt to circumvent any security measures</li>
            <li>Use automated tools to scrape or harvest data from the application</li>
            <li>Attempt to access another user&apos;s account or data</li>
            <li>Use the service in any way that violates applicable laws or regulations</li>
          </ul>
        </Section>

        <Section title="3. Account Responsibility">
          You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorised access.
        </Section>

        <Section title="4. User-Generated Content">
          MovieDex currently allows users to add titles to a personal My List. This list is private to your account. You do not submit public reviews, comments, or other user-generated content. Should such features be added in future, additional terms will apply.
        </Section>

        <Section title="5. Third-Party Services — TMDB">
          All movie, TV show, and anime metadata is provided by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-secondary)' }}>
            The Movie Database (TMDB)
          </a>{' '}
          via their public API. MovieDex is not affiliated with, endorsed by, or certified by TMDB. TMDB content is subject to TMDB&apos;s own terms of service.
        </Section>

        <Section title="6. External Links">
          MovieDex may contain links to external websites (e.g. TMDB, YouTube trailers). We are not responsible for the content, privacy practices, or terms of those external sites.
        </Section>

        <Section title="7. Content Availability">
          MovieDex is a discovery and metadata platform. It does not host, stream, distribute, or provide access to commercial film, television, or anime content. The availability of any title on a streaming service is determined solely by that service and is outside our control.
        </Section>

        <Section title="8. Intellectual Property">
          The MovieDex application, its design, and original code are the property of their respective creators. TMDB metadata, images, and data remain the property of TMDB and are used under their API terms. All trademarks belong to their respective owners.
        </Section>

        <Section title="9. Disclaimer of Warranties">
          MovieDex is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation. We are not liable for any loss or damage arising from your use of the application.
        </Section>

        <Section title="10. Changes to the Service">
          We may modify, suspend, or discontinue any part of MovieDex at any time without notice. We may also update these Terms of Use. Continued use after changes are posted constitutes acceptance of the revised terms.
        </Section>

        <Section title="11. Governing Law">
          These terms are governed by applicable law. Any disputes arising from use of MovieDex shall be subject to the jurisdiction of the applicable courts.
        </Section>

        <Section title="12. Contact">
          If you have questions about these Terms of Use, please use the{' '}
          <a href="/contact" style={{ color: 'var(--brand-secondary)' }}>Contact page</a>.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.875rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          fontSize: '0.925rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {children}
      </div>
    </section>
  );
}
