import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import AuthVisual from '../../components/auth/AuthVisual';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-elem', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/home');
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/home');
    } catch {
      setError('Failed to log in with Google.');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--bg-deepspace)' }}>
      {/* Left: 3D Visual */}
      <div style={{ flex: 1, position: 'relative', display: 'none' }} className="auth-visual-container">
        <AuthVisual />
        <div style={{
          position: 'absolute', bottom: '10%', left: '10%', zIndex: 10,
          color: '#fff', maxWidth: '400px'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Your Journey <br/>Starts Here.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Join millions discovering their next favorite movie or TV show.
          </p>
        </div>
      </div>

      {/* Right: Form Area */}
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', 
        padding: 'clamp(1.5rem, 5vw, 4rem)', position: 'relative', zIndex: 10,
        background: 'var(--bg-dark)', borderLeft: '1px solid var(--border-subtle)',
        overflowY: 'auto'
      }}>
        <div ref={formRef} style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
          
          <Link to="/" className="auth-elem" style={{ display: 'inline-block', marginBottom: '2rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ← Back to Home
          </Link>

          <div className="auth-elem" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Create Account</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Sign up to unlock premium features and lists.
            </p>
          </div>

          {error && (
            <div className="auth-elem" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* EMAIL FORM */}
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="auth-elem">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email Address</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', outline: 'none', transition: 'all 0.3s ease', fontSize: '0.9rem'
                    }}
                    onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
                
                <div className="auth-elem">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Password</label>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', outline: 'none', transition: 'all 0.3s ease', fontSize: '0.9rem'
                    }}
                    onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>

                <div className="auth-elem">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Confirm Password</label>
                  <input 
                    type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="auth-input"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', outline: 'none', transition: 'all 0.3s ease', fontSize: '0.9rem'
                    }}
                    onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>

                <button disabled={loading} type="submit" className="auth-elem" style={{ 
                  width: '100%', padding: '0.875rem 1rem', marginTop: '0.5rem', borderRadius: '8px',
                  background: 'var(--brand-gradient)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: '0 0 20px rgba(225,29,72,0.35)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.55)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--brand-gradient)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(225,29,72,0.35)'; }}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <div className="auth-elem" style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>Or continue with</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div className="auth-elem" style={{ display: 'flex', gap: '1rem' }}>
                <button disabled={loading} onClick={handleGoogleLogin} style={{ 
                  flex: 1, padding: '0.75rem 1rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
              </div>

              <div className="auth-elem" style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                Already have an account? <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', marginLeft: '0.25rem', borderBottom: '1px solid #fff' }}>Log In</Link>
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
