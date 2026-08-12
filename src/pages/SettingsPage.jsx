import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { getUserSettings, updateUserSettings } from '../services/settings';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: 'Japanese' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'hi', label: 'Hindi' },
];

const SUBTITLES = [
  { code: 'off', label: 'Off' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: 'Japanese' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
];

export default function SettingsPage() {
  const { currentUser, resetPassword, updateUserPassword, logout, deleteAccount } = useAuth();
  const { clearWatchlist } = useWatchlist();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    preferredLanguage: 'en',
    preferredContentLanguage: 'en',
    preferredSubtitleLanguage: 'en',
    autoplay: true,
    notificationsEnabled: true,
    newMoviesNotifications: true,
    newTVNotifications: true,
    newAnimeNotifications: true,
    upcomingNotifications: true,
    newEpisodesNotifications: true,
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showClearListModal, setShowClearListModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;
    getUserSettings(currentUser.uid).then(data => {
      setSettings(prev => ({ ...prev, ...data }));
      setLoading(false);
    });
  }, [currentUser]);

  const handleSettingChange = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await updateUserSettings(currentUser.uid, { [key]: value });
      setMsg({ type: 'success', text: 'Settings saved automatically.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update setting:', err);
      setMsg({ type: 'error', text: 'Failed to save setting.' });
    }
  };

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      setMsg({ type: 'success', text: `Password reset link sent to ${currentUser.email}` });
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to send password reset link.' });
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    try {
      await updateUserPassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setMsg({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to update password. Try logging in again first.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('moviedex_watch_history');
    setShowClearHistoryModal(false);
    setMsg({ type: 'success', text: 'Watch history cleared successfully.' });
  };

  const handleClearMyList = () => {
    clearWatchlist();
    setShowClearListModal(false);
    setMsg({ type: 'success', text: 'My List cleared successfully.' });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to delete account. Re-authentication required.' });
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '4rem', borderRadius: '16px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="text-hero page-title">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="page-subtitle">Manage your profile, preferences, notifications, and account security.</p>
      </div>

      {/* Message Toast */}
      {msg && (
        <div style={{
          padding: '0.875rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem',
          background: msg.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '2rem' }}>
        {[
          { id: 'profile', label: '👤 Profile' },
          { id: 'account', label: '🔒 Account' },
          { id: 'preferences', label: '⚙️ Preferences' },
          { id: 'notifications', label: '🔔 Notifications' },
          { id: 'privacy', label: '🛡️ Privacy' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: PROFILE ── */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Profile Overview
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
              color: '#fff', fontSize: '2rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.3rem' }}>
                {currentUser?.displayName || 'MovieHub User'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>
                {currentUser?.email}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {currentUser?.emailVerified ? (
                  <span className="pill" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.75rem' }}>
                    ✓ Email Verified
                  </span>
                ) : (
                  <span className="pill" style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.75rem' }}>
                    ⚠️ Email Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate('/profile')}
            style={{ borderRadius: '999px', padding: '0.75rem 1.75rem' }}
          >
            ✏️ Go to Full Profile Page
          </button>
        </div>
      )}

      {/* ── TAB 2: ACCOUNT ── */}
      {activeTab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
              Security & Credentials
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                className="btn-primary"
                onClick={() => setShowPasswordModal(true)}
                style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}
              >
                🔑 Change Password
              </button>

              <button
                className="btn-ghost"
                onClick={handleSendResetEmail}
                style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}
              >
                ✉️ Send Password Reset Email
              </button>
            </div>

            <div className="divider" style={{ margin: '1.5rem 0' }} />

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Account Metadata
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span>User ID: <code style={{ color: '#a5b4fc' }}>{currentUser?.uid}</code></span>
              <span>Authentication Provider: <strong style={{ color: '#fff' }}>{currentUser?.providerData?.[0]?.providerId || 'password'}</strong></span>
              <span>Account Created: <strong style={{ color: '#fff' }}>{currentUser?.metadata?.creationTime || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.2rem' }}>Log Out</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>End your current viewing session safely.</p>
            </div>
            <button
              className="btn-ghost"
              onClick={async () => { await logout(); navigate('/'); }}
              style={{ borderRadius: '999px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              🚪 Log Out
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: PREFERENCES ── */}
      {activeTab === 'preferences' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Playback & Localization
          </h3>

          {/* Interface Language */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Interface Language
              </label>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Select app UI display language.</span>
            </div>
            <select
              value={settings.preferredLanguage}
              onChange={e => handleSettingChange('preferredLanguage', e.target.value)}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '999px',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ background: '#0f172a', color: '#fff' }}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="divider" style={{ margin: '1rem 0' }} />

          {/* Subtitles Language */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Default Subtitle Track
              </label>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Preferred subtitles language in player.</span>
            </div>
            <select
              value={settings.preferredSubtitleLanguage}
              onChange={e => handleSettingChange('preferredSubtitleLanguage', e.target.value)}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '999px',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
              }}
            >
              {SUBTITLES.map(s => (
                <option key={s.code} value={s.code} style={{ background: '#0f172a', color: '#fff' }}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="divider" style={{ margin: '1rem 0' }} />

          {/* Autoplay Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Autoplay Next Episode
              </label>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Automatically start the next episode when current episode ends.</span>
            </div>
            <button
              onClick={() => handleSettingChange('autoplay', !settings.autoplay)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '999px',
                background: settings.autoplay ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${settings.autoplay ? 'var(--brand-primary)' : 'rgba(255,255,255,0.15)'}`,
                color: settings.autoplay ? '#a5b4fc' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              {settings.autoplay ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 4: NOTIFICATIONS ── */}
      {activeTab === 'notifications' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Notification Preferences
          </h3>

          {[
            { key: 'notificationsEnabled', label: 'Allow Notifications', desc: 'Enable or disable all in-app notifications.' },
            { key: 'newMoviesNotifications', label: 'New Movies', desc: 'Notify when major new movies are added.' },
            { key: 'newTVNotifications', label: 'New TV Shows', desc: 'Notify when new TV series become available.' },
            { key: 'newAnimeNotifications', label: 'New Anime', desc: 'Notify when new anime series or seasons release.' },
            { key: 'upcomingNotifications', label: 'Upcoming Releases', desc: 'Notify about upcoming release dates on MovieHub.' },
            { key: 'newEpisodesNotifications', label: 'New Episodes', desc: 'Notify when new episodes of your followed shows drop.' },
          ].map((item, idx) => (
            <div key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    {item.label}
                  </label>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                </div>
                <button
                  onClick={() => handleSettingChange(item.key, !settings[item.key])}
                  style={{
                    padding: '0.45rem 1.1rem', borderRadius: '999px',
                    background: settings[item.key] ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${settings[item.key] ? 'var(--brand-primary)' : 'rgba(255,255,255,0.15)'}`,
                    color: settings[item.key] ? '#a5b4fc' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  {settings[item.key] ? 'ON' : 'OFF'}
                </button>
              </div>
              {idx < 5 && <div className="divider" style={{ margin: '0.25rem 0' }} />}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 5: PRIVACY & DATA ── */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
              Data & Viewing History
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Clear Watch History</h4>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Remove all progress logs from Continue Watching.</span>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => setShowClearHistoryModal(true)}
                  style={{ borderRadius: '999px', fontSize: '0.85rem' }}
                >
                  Clear History
                </button>
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Clear My List</h4>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Remove all bookmarked items from your list.</span>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => setShowClearListModal(true)}
                  style={{ borderRadius: '999px', fontSize: '0.85rem' }}
                >
                  Clear My List
                </button>
              </div>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div style={{
            padding: '2rem', borderRadius: '16px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '0.5rem' }}>
              ⚠️ Danger Zone — Delete Account
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '600px' }}>
              Permanently delete your MovieHub account and all associated profile settings and history. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '0.75rem 1.75rem', borderRadius: '999px',
                background: 'var(--danger)', color: '#fff', fontWeight: 800,
                fontSize: '0.9rem', cursor: 'pointer', border: 'none',
                boxShadow: '0 0 20px rgba(239,68,68,0.4)',
              }}
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleChangePasswordSubmit} className="glass-card" style={{ width: 'min(420px, 100%)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
              Change Password
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={passwordLoading} style={{ borderRadius: '999px', padding: '0.65rem 1.5rem' }}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowPasswordModal(false)} style={{ borderRadius: '999px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clear Watch History Confirmation Modal */}
      {showClearHistoryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: 'min(400px, 100%)', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🗑️</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Clear Watch History?</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This will reset your watch progress for all titles.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handleClearHistory} className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: '999px' }}>
                Yes, Clear History
              </button>
              <button onClick={() => setShowClearHistoryModal(false)} className="btn-ghost" style={{ borderRadius: '999px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear My List Confirmation Modal */}
      {showClearListModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: 'min(400px, 100%)', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📑</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Clear My List?</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This will remove all saved movies and shows from your watchlist.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handleClearMyList} className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: '999px' }}>
                Yes, Clear My List
              </button>
              <button onClick={() => setShowClearListModal(false)} className="btn-ghost" style={{ borderRadius: '999px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: 'min(420px, 100%)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '0.5rem' }}>
              Confirm Account Deletion
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Type <strong style={{ color: '#fff' }}>DELETE</strong> below to confirm permanent deletion of your account.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                style={{
                  padding: '0.65rem 1.5rem', borderRadius: '999px', background: deleteConfirmText === 'DELETE' ? 'var(--danger)' : 'rgba(239,68,68,0.3)',
                  color: '#fff', fontWeight: 800, border: 'none', cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                }}
              >
                Delete Account
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-ghost" style={{ borderRadius: '999px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
