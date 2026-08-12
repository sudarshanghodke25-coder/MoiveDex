import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import AuthVisual from '../../components/auth/AuthVisual';

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, verifyEmail } = useAuth();
  const navigate = useNavigate();
  
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

  async function handleVerify(e) {
    e.preventDefault();
    if (!currentUser) return setError("No user is logged in.");
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await verifyEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send verification email. ' + err.message);
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
            Secure Your <br/>Account.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Verify your email to gain full access to MovieDex features.
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
          
          <Link to="/" className="auth-elem" style={{ display: 'inline-block', marginBottom: '3rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ← Back to Home
          </Link>

          <div className="auth-elem" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Verify Email</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>We need to verify your email address to secure your account.</p>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={handleVerify} disabled={loading} className="auth-elem" style={{ 
              width: '100%', padding: '1.125rem', borderRadius: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #d97706 100%)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#f8fafc', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', transition: 'all 0.25s ease',
              boxShadow: '0 0 20px rgba(225,29,72,0.35)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.55)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'linear-gradient(135deg, #e11d48 0%, #d97706 100%)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(225,29,72,0.35)'; }}
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>

            <button onClick={() => navigate('/')} className="auth-elem" style={{ 
              width: '100%', padding: '1.125rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600, fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              Skip for now
            </button>
          </div>
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
