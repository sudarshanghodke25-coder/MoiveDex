import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import AuthVisual from '../../components/auth/AuthVisual';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-elem', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2
      });
    }, formRef);
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
    } catch (err) {
      setError('Failed to reset password. ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#050508' }}>
      {/* Left: 3D Visual */}
      <div style={{ flex: 1, position: 'relative', display: 'none' }} className="auth-visual-container">
        <AuthVisual />
        <div style={{
          position: 'absolute', bottom: '10%', left: '10%', zIndex: 10,
          color: '#fff', maxWidth: '400px'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Regain <br/>Access.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Securely reset your password and continue your journey.
          </p>
        </div>
      </div>

      {/* Right: Form Area */}
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', 
        padding: 'clamp(2rem, 8vw, 6rem)', position: 'relative', zIndex: 10,
        background: '#0a0a0c', borderLeft: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div ref={formRef} style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
          
          <Link to="/login" className="auth-elem" style={{ display: 'inline-block', marginBottom: '3rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ← Back to Login
          </Link>

          <div className="auth-elem" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Reset Password</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="auth-elem" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="auth-elem" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.9rem' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="auth-elem">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                style={{
                  width: '100%', padding: '1rem 1.25rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', outline: 'none', transition: 'all 0.3s ease', fontSize: '1rem'
                }}
                onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            <button disabled={loading} type="submit" className="auth-elem" style={{ 
              width: '100%', padding: '1.125rem', marginTop: '1rem', borderRadius: '8px',
              background: '#fff', color: '#000', fontWeight: 700, fontSize: '1rem',
              border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 25px rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-visual-container { display: block !important; }
        }
      `}</style>
    </div>
  );
}
