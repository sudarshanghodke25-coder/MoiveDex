import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { getUserProfile, updateUserProfile } from '../services/userProfile';
import { getContinueWatchingList } from '../services/history';
import { useNavigate } from 'react-router-dom';

const AVATAR_PRESETS = [
  { id: 'crimson', label: 'Cinema Crimson', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Crimson&backgroundColor=e11d48', gradient: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)', emoji: '🎬' },
  { id: 'gold', label: 'Radiant Gold', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gold&backgroundColor=f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', emoji: '🍿' },
  { id: 'rose', label: 'Velvet Rose', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rose&backgroundColor=f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)', emoji: '⚡' },
  { id: 'emerald', label: 'Matrix Emerald', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emerald&backgroundColor=10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', emoji: '🌌' },
  { id: 'slate', label: 'Obsidian Black', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Slate&backgroundColor=181820', gradient: 'linear-gradient(135deg, #181820 0%, #08080a 100%)', emoji: '🎭' },
];

export default function ProfilePage() {
  const { currentUser, updateProfileInfo, verifyEmail } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();

  const [_dbProfile, setDbProfile] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setDisplayNameInput(currentUser.displayName || '');
    setSelectedAvatarUrl(currentUser.photoURL || '');

    getUserProfile(currentUser.uid).then(prof => {
      if (prof) setDbProfile(prof);
    });

    getContinueWatchingList(currentUser.uid).then(list => {
      setHistoryCount(list.length);
    });
  }, [currentUser]);

  const handleSendVerification = async () => {
    try {
      await verifyEmail();
      setVerificationSent(true);
      setMsg({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to send verification email.' });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayNameInput.trim()) return;

    setSaving(true);
    setMsg(null);

    const finalPhoto = customAvatarInput.trim() || selectedAvatarUrl;

    try {
      // 1. Update Firebase Auth user
      await updateProfileInfo(displayNameInput.trim(), finalPhoto || null);

      // 2. Update Firestore users/{uid}
      await updateUserProfile(currentUser.uid, {
        displayName: displayNameInput.trim(),
        photoURL: finalPhoto || null,
      });

      setDbProfile(prev => ({
        ...prev,
        displayName: displayNameInput.trim(),
        photoURL: finalPhoto || null,
      }));

      setIsEditing(false);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Member';

  const userInitial = (currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase();
  const currentAvatar = isEditing ? (selectedAvatarUrl || currentUser?.photoURL) : (currentUser?.photoURL);

  return (
    <div className="page-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header Banner */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.8) 0%, rgba(15,23,42,0.95) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute', top: '-50%', left: '20%', width: '300px', height: '300px',
          borderRadius: '50%', background: 'rgba(225,29,72,0.15)', filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          {/* Large Avatar */}
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
            border: '3.5px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 30px rgba(225,29,72,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 800, color: '#fff',
            overflow: 'hidden',
          }}>
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>

          {/* Identity info */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 className="text-hero" style={{ margin: 0, fontSize: '2rem' }}>
                {currentUser?.displayName || 'MovieHub User'}
              </h1>
              {currentUser?.emailVerified ? (
                <span className="pill" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 700 }}>
                  ✓ Verified
                </span>
              ) : (
                <span className="pill" style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', fontWeight: 700 }}>
                  ⚠️ Unverified
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              {currentUser?.email}
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              📅 Member since {memberSince}
            </p>
          </div>

          {/* Edit toggle button */}
          <button
            className="btn-ghost"
            onClick={() => {
              if (isEditing) {
                setDisplayNameInput(currentUser?.displayName || '');
                setSelectedAvatarUrl(currentUser?.photoURL || '');
                setCustomAvatarInput('');
              }
              setIsEditing(!isEditing);
            }}
            style={{ borderRadius: '999px', padding: '0.65rem 1.4rem' }}
          >
            {isEditing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {msg && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem',
          background: msg.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Edit Profile Form Panel */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#f8fafc' }}>
            Edit Profile Details
          </h3>

          {/* Display Name Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayNameInput}
              onChange={e => setDisplayNameInput(e.target.value)}
              placeholder="Your name"
              required
              style={{
                width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '0.95rem', outline: 'none',
              }}
            />
          </div>

          {/* Verified Email Notice (read-only) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Email Address (Authentication Managed)
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              style={{
                width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-muted)', fontSize: '0.95rem', cursor: 'not-allowed',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Email address is locked for account security. To change account credentials, manage settings in Firebase.
            </p>
          </div>

          {/* Preset Avatars Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Choose Profile Avatar
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {AVATAR_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => { setSelectedAvatarUrl(preset.url); setCustomAvatarInput(''); }}
                  style={{
                    width: '54px', height: '54px', borderRadius: '50%', cursor: 'pointer',
                    background: preset.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', border: selectedAvatarUrl === preset.url ? '2.5px solid var(--brand-primary)' : '1px solid transparent',
                    transition: 'transform 0.2s',
                  }}
                  title={preset.label}
                >
                  {preset.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Avatar URL */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Or Custom Avatar Image URL
            </label>
            <input
              type="url"
              value={customAvatarInput}
              onChange={e => { setCustomAvatarInput(e.target.value); setSelectedAvatarUrl(e.target.value); }}
              placeholder="https://example.com/avatar.jpg"
              style={{
                width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '0.95rem', outline: 'none',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ borderRadius: '999px', padding: '0.75rem 2rem' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setDisplayNameInput(currentUser?.displayName || '');
                setSelectedAvatarUrl(currentUser?.photoURL || '');
                setCustomAvatarInput('');
                setIsEditing(false);
              }}
              style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* User Quick Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>🔖</span>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', display: 'block' }}>
            {watchlist.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Saved in My List
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>⏱️</span>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', display: 'block' }}>
            {historyCount}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Titles Watched
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>
            {currentUser?.emailVerified ? '🔒' : '✉️'}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: currentUser?.emailVerified ? '#10b981' : '#ef4444', display: 'block', marginTop: '0.5rem' }}>
            {currentUser?.emailVerified ? 'Verified Account' : 'Action Required'}
          </span>
          {!currentUser?.emailVerified && (
            <button
              onClick={handleSendVerification}
              disabled={verificationSent}
              style={{
                marginTop: '0.6rem', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--brand-primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {verificationSent ? 'Verification Sent' : 'Resend Verification Email'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div
          onClick={() => navigate('/mylist')}
          className="glass-card"
          style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
        >
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            📑
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.2rem' }}>My List</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>View all your bookmarked movies and shows.</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/settings')}
          className="glass-card"
          style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
        >
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            ⚙️
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.2rem' }}>Settings</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Manage playback, language, and notification preferences.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
