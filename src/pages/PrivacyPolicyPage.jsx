import usePageTitle from '../hooks/usePageTitle';

const LAST_UPDATED = 'August 2026';

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy | MovieDex');

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
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Review notice */}
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
        ⚠️&nbsp; <strong style={{ color: 'var(--brand-secondary)' }}>Note:</strong> This is a general-purpose privacy policy for the current MovieDex application. It should be reviewed by a qualified legal professional before any public commercial deployment.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <Section title="1. Overview">
          MovieDex (&quot;we&quot;, &quot;our&quot;, or &quot;the application&quot;) is a personal movie, TV show, and anime discovery platform. This Privacy Policy describes how we collect, use, and handle information when you use MovieDex.
        </Section>

        <Section title="2. Information We Collect">
          <SubSection label="2.1 Account Information (Firebase Authentication)">
            When you create an account or sign in with Google, we collect:
            <ul>
              <li>Email address</li>
              <li>Display name (if provided or from Google)</li>
              <li>Profile photo URL (if signed in with Google)</li>
              <li>Account creation date and unique user ID (UID) assigned by Firebase</li>
            </ul>
            We do not collect passwords directly — authentication is handled securely by Firebase Authentication (Google).
          </SubSection>
          <SubSection label="2.2 User-Generated Data (My List)">
            When you add titles to My List, we store the following in Firebase Firestore:
            <ul>
              <li>Your user UID (to associate the list with your account)</li>
              <li>The TMDB ID and type of each title you save (movie, TV show, anime)</li>
            </ul>
            Your My List is private — it is only accessible by you when signed in to your account.
          </SubSection>
          <SubSection label="2.3 Preferences and Settings">
            Any settings you configure (such as display preferences) may be stored in Firestore associated with your user UID.
          </SubSection>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To authenticate you and maintain your session</li>
            <li>To provide your private My List and settings across sessions and devices</li>
            <li>To personalise your experience (e.g., displaying your name)</li>
          </ul>
          We do not sell your information. We do not use your data for advertising.
        </Section>

        <Section title="4. Third-Party Services">
          <SubSection label="4.1 Firebase (Google)">
            MovieDex uses Firebase Authentication and Cloud Firestore, both provided by Google. Your account data is subject to&nbsp;
            <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-secondary)' }}>
              Firebase&apos;s Privacy Policy
            </a>.
          </SubSection>
          <SubSection label="4.2 TMDB (The Movie Database)">
            All movie, TV show, and anime metadata, images, and trailer links are sourced from the&nbsp;
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-secondary)' }}>
              TMDB API
            </a>. MovieDex does not store TMDB metadata — it is fetched on demand. TMDB has its own privacy policy.
          </SubSection>
          <SubSection label="4.3 YouTube (Trailers)">
            Trailer playback may embed YouTube players. YouTube is governed by Google&apos;s Privacy Policy.
          </SubSection>
        </Section>

        <Section title="5. Data Retention">
          Your account data is retained for as long as your account exists. If you delete your account through the Settings page, your authentication record and associated Firestore data are removed.
        </Section>

        <Section title="6. Data Security">
          We use Firebase&apos;s built-in security features, including Firestore Security Rules that restrict all read and write operations to the authenticated user&apos;s own data. No user can access another user&apos;s My List or settings.
        </Section>

        <Section title="7. Children's Privacy">
          MovieDex is not directed at children under the age of 13. We do not knowingly collect personal information from children.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this policy as the application evolves. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision. Continued use of MovieDex after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="9. Contact">
          If you have questions about this privacy policy or your data, use the{' '}
          <a href="/contact" style={{ color: 'var(--brand-secondary)' }}>Contact page</a> to reach us.
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

function SubSection({ label, children }) {
  return (
    <div>
      <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
        {label}
      </strong>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {children}
      </div>
    </div>
  );
}
