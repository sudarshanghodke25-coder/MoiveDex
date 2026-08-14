import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SUBJECTS = [
  'General Question',
  'Bug Report',
  'Feature Request',
  'Feedback',
  'Content Issue',
  'Other',
];

/**
 * Shared contact/feedback form.
 * @param {object} props
 * @param {string}  props.defaultSubject - Pre-selected subject option
 * @param {string}  props.title          - Form heading
 * @param {string}  props.description    - Subheading text
 */
export default function ContactForm({ defaultSubject = 'General Question', title, description }) {
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: SUBJECTS.includes(defaultSubject) ? defaultSubject : SUBJECTS[0],
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.';
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStatus('loading');

    await new Promise((res) => setTimeout(res, 1200));
    setStatus('success');
    setForm({ name: currentUser?.displayName || '', email: currentUser?.email || '', subject: SUBJECTS[0], message: '' });
  }

  function handleReset() {
    setStatus('idle');
    setErrors({});
  }

  if (status === 'success') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.25)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
          Message Sent!
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button className="btn-ghost" onClick={handleReset} style={{ padding: '0.65rem 1.75rem', fontSize: '0.9rem' }}>
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h2>
      )}
      {description && (
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2rem', fontSize: '0.95rem' }}>
          {description}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Name */}
        <div>
          <label
            htmlFor="contact-name"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.03em' }}
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            style={inputStyle(!!errors.name)}
          />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="contact-email"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.03em' }}
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            style={inputStyle(!!errors.email)}
          />
          {errors.email && <span style={errorStyle}>{errors.email}</span>}
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="contact-subject"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.03em' }}
          >
            Subject
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            style={{
              ...inputStyle(false),
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem',
            }}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.03em' }}
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us what's on your mind…"
            style={{ ...inputStyle(!!errors.message), resize: 'vertical', minHeight: '120px' }}
          />
          {errors.message && <span style={errorStyle}>{errors.message}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'loading'}
          style={{ alignSelf: 'flex-start', padding: '0.875rem 2.25rem' }}
        >
          {status === 'loading' ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
              Sending…
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'var(--border-glass)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  };
}

const errorStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--danger)',
  marginTop: '0.35rem',
};
