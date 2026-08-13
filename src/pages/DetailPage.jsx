import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieDetails,
  getTVDetails,
  getTVSeasonDetails,
  getVideos,
  backdropUrl,
  posterUrl,
  normalise,
  pickTrailer,
  pickWatchRegion,
  getTopStreamingProvider,
  buildProviderWatchUrl,
} from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useAuth } from '../contexts/AuthContext';
import { getPlaybackSource } from '../services/playback';
import { saveWatchProgress, getWatchProgress, getContentId } from '../services/history';
import VideoPlayer from '../components/player/VideoPlayer';
import WatchProviders from '../components/detail/WatchProviders';
import CastRow from '../components/detail/CastRow';

// ── Helpers ───────────────────────────────────────────────────────────────

function formatMoney(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function formatRuntime(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Extract director, writers, creators from credits.crew */
function extractKeyCrewRoles(crew = []) {
  if (!crew?.length) return { director: null, writers: [], creators: [] };

  const director = crew.find(p => p.job === 'Director') || null;
  const writers  = crew
    .filter(p => ['Writer', 'Screenplay', 'Story'].includes(p.job))
    .reduce((acc, p) => {
      if (!acc.some(x => x.id === p.id)) acc.push(p);
      return acc;
    }, [])
    .slice(0, 3);

  const creators = crew
    .filter(p => p.job === 'Series Director' || p.department === 'Directing')
    .slice(0, 2);

  return { director, writers, creators };
}

/** Safely normalise a raw TMDB similar/recommendation item for MovieCard */
function toCardItem(raw, mediaType) {
  try {
    return normalise(raw, mediaType);
  } catch {
    return {
      id:          raw.id,
      title:       raw.title || raw.name || 'Unknown',
      posterPath:  raw.poster_path || null,
      backdropPath: raw.backdrop_path || null,
      rating:      typeof raw.vote_average === 'number' ? raw.vote_average : null,
      releaseDate: raw.release_date || raw.first_air_date || null,
      mediaType,
      overview:    raw.overview || '',
      genreNames:  [],
    };
  }
}

/** Select prioritised videos: Official Trailer → Trailer → Teaser → Featurettes (max 8 total) */
function prioritiseVideos(videos = []) {
  const yt = (videos.results || videos).filter(v => v.site === 'YouTube');
  const trailer  = yt.filter(v => v.type === 'Trailer' && v.official);
  const trailers = yt.filter(v => v.type === 'Trailer' && !v.official);
  const teasers  = yt.filter(v => v.type === 'Teaser');
  const other    = yt.filter(v => !['Trailer', 'Teaser'].includes(v.type));
  const ordered  = [...trailer, ...trailers, ...teasers, ...other];
  // Deduplicate by key
  const seen = new Set();
  return ordered.filter(v => { if (seen.has(v.key)) return false; seen.add(v.key); return true; }).slice(0, 8);
}

// ── Skeleton components ───────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="detail-loading" style={{ padding: '2rem' }}>
      <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '300px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: '3rem', width: '60%', borderRadius: '8px', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '35%', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '4px', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '6rem', borderRadius: '8px', marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="skeleton" style={{ height: '2.75rem', width: '140px', borderRadius: '999px' }} />
            <div className="skeleton" style={{ height: '2.75rem', width: '140px', borderRadius: '999px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section header helper ─────────────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
      <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
      <h2 className="text-section" style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}

// ── Metadata row helper ───────────────────────────────────────────────────

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', minWidth: '130px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function DetailPage({ mediaType = 'movie' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [detail, setDetail]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [allVideos, setAllVideos]     = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerVideo, setTrailerVideo] = useState(null);

  // TV / Anime Season & Episode states
  const [selectedSeasonNum, setSelectedSeasonNum] = useState(null); // null until we know the first real season
  const [seasonData, setSeasonData]   = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  // Selected episode detail panel
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const selectedEpisodeRef = useRef(null);

  // Playback state
  const [activePlayback, setActivePlayback] = useState(null);
  const [resumeTime, setResumeTime]   = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(null);

  const saveTimerRef = useRef(null);

  const inList = detail ? isInWatchlist(detail.id, mediaType) : false;

  // 1. Fetch main detail
  useEffect(() => {
    setLoading(true);
    setDetail(null);
    setError(null);
    setSeasonData(null);
    setSelectedSeasonNum(null);
    setAllVideos([]);

    const fetcher = (mediaType === 'tv' || mediaType === 'anime') ? getTVDetails : getMovieDetails;
    fetcher(id)
      .then(data => {
        setDetail(data);
        setLoading(false);

        // Videos come appended in the detail response; also fetch separately as fallback
        const embedded = data.videos?.results || [];
        if (embedded.length > 0) {
          setAllVideos(prioritiseVideos(embedded));
        } else {
          getVideos(id, mediaType === 'anime' ? 'tv' : mediaType)
            .then(vids => setAllVideos(prioritiseVideos(vids)))
            .catch(() => setAllVideos([]));
        }

        // For TV/anime, default to the first real (non-specials) season
        if (mediaType === 'tv' || mediaType === 'anime') {
          const seasons = data.seasonsList || [];
          const firstReal = seasons.find(s => s.season_number > 0) || seasons[0];
          setSelectedSeasonNum(firstReal ? firstReal.season_number : 1);
        }
      })
      .catch(e => {
        setError(e.message || 'Unable to load this title. Please try again.');
        setLoading(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, mediaType]);

  // 2. Fetch Season details for TV/Anime when season selection changes
  useEffect(() => {
    if (!detail || (mediaType !== 'tv' && mediaType !== 'anime') || selectedSeasonNum === null) return;

    setSeasonLoading(true);
    setSeasonData(null);
    setSelectedEpisode(null); // clear selected episode when season changes
    getTVSeasonDetails(id, selectedSeasonNum)
      .then(data => {
        setSeasonData(data);
        setSeasonLoading(false);
      })
      .catch(err => {
        console.error('Failed to load season details:', err);
        setSeasonData(null);
        setSeasonLoading(false);
      });
  }, [detail, id, mediaType, selectedSeasonNum]);

  // 3. Launch Video Player for movie or episode
  const handleStartPlayback = async (ep = null) => {
    if (!detail) return;
    const seasonNum = ep ? ep.seasonNumber : 1;
    const epNum     = ep ? ep.episodeNumber : 1;

    try {
      const playback = await getPlaybackSource({
        contentId:     detail.id,
        mediaType,
        seasonNumber:  seasonNum,
        episodeNumber: epNum,
        title:         ep ? `${detail.title}: ${ep.name}` : detail.title,
        posterPath:    ep?.stillPath || detail.posterPath,
      });

      if (playback.playable) {
        const contentId = getContentId(detail.id, mediaType, seasonNum, epNum);
        const history   = await getWatchProgress(currentUser?.uid, contentId);
        setResumeTime(history?.progressSeconds || 0);
        setActiveEpisode(ep);
        setActivePlayback(playback);
      } else {
        alert(playback.reason || 'No authorized playback source is currently connected.');
      }
    } catch (e) {
      console.error('Playback error:', e);
      alert('Could not start playback. Please try again.');
    }
  };

  // 4. Debounced Watch Progress Saver
  const handlePlayerProgress = useCallback((currentTime, duration) => {
    if (!detail) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const seasonNum = activeEpisode ? activeEpisode.seasonNumber : 1;
      const epNum     = activeEpisode ? activeEpisode.episodeNumber : 1;
      saveWatchProgress(currentUser?.uid, {
        tmdbId:          detail.id,
        mediaType,
        seasonNumber:    seasonNum,
        episodeNumber:   epNum,
        title:           activeEpisode ? `${detail.title}: ${activeEpisode.name}` : detail.title,
        posterPath:      activeEpisode?.stillPath || detail.posterPath,
        progressSeconds: currentTime,
        durationSeconds: duration,
      });
    }, 2000);
  }, [detail, mediaType, activeEpisode, currentUser]);

  // Open trailer in modal
  function openTrailer(video) {
    setTrailerVideo(video);
    setShowTrailer(true);
  }

  // Handle episode card click: select the episode and scroll to detail panel
  function handleEpisodeSelect(ep) {
    setSelectedEpisode(ep);
    // Scroll to the detail panel after state updates
    setTimeout(() => {
      selectedEpisodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  // ── Loading / Error states ──────────────────────────────────────────────

  if (loading) return <HeroSkeleton />;

  if (error) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h2 className="text-title" style={{ color: 'var(--danger)' }}>Unable to Load Title</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}>{error}</p>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ borderRadius: '999px', marginTop: '0.5rem' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  if (!detail) return null;

  // ── Derived values ──────────────────────────────────────────────────────

  const backdrop = detail.backdropPath ? backdropUrl(detail.backdropPath, 'original') : null;
  const poster   = detail.posterPath   ? posterUrl(detail.posterPath, 'lg') : null;
  const year     = detail.releaseDate  ? new Date(detail.releaseDate).getFullYear() : '';

  const mainTrailer    = pickTrailer(allVideos);

  const isTV           = mediaType === 'tv' || mediaType === 'anime';
  const typeLabel      = mediaType === 'tv' ? '📺 TV Show' : (mediaType === 'anime' ? '⚡ Anime' : '🎬 Movie');

  // Cast & Crew
  const cast = detail.credits?.cast || [];
  const crew = detail.credits?.crew || [];
  const { director, writers, creators } = extractKeyCrewRoles(crew);

  // Recommendations & Similar — normalised for MovieCard
  const recommendations = (detail.recommendations?.results || [])
    .slice(0, 12)
    .map(item => toCardItem(item, mediaType));

  const similar = (detail.similar?.results || [])
    .slice(0, 12)
    .map(item => toCardItem(item, mediaType));

  // Avoid duplicate sections: show recommendations if available, similar only if no/few recommendations
  const showBothSections = recommendations.length >= 4 && similar.length >= 4;

  // Watch providers — real streaming happens outbound via TMDB per-provider links;
  // the in-app player is always a clearly-labeled preview.
  const providers = detail.providers || {};
  const { countryCode: regionCode } = pickWatchRegion(providers);
  const topProvider = getTopStreamingProvider(providers);
  const providerWatchUrl = topProvider && detail.id
    ? buildProviderWatchUrl({ mediaType, id: detail.id, countryCode: regionCode || 'US', providerId: topProvider.provider_id })
    : null;

  // Season list for dropdown — use real TMDB season objects if available
  const seasonsList = detail.seasonsList?.filter(s => s.season_number >= 0) || [];
  // If no seasonsList, fall back to generating 1-N
  const seasonsForDropdown = seasonsList.length > 0
    ? seasonsList
    : Array.from({ length: Math.max(1, detail.numberOfSeasons || 1) }, (_, i) => ({
        season_number: i + 1,
        name: `Season ${i + 1}`,
      }));

  // Budget / Revenue
  const budgetFmt  = formatMoney(detail.budget);
  const revenueFmt = formatMoney(detail.revenue);

  // Production companies / networks
  const companies = detail.productionCompanies?.slice(0, 4).map(c => c.name).join(', ') || null;
  const networks  = detail.networks?.slice(0, 3).map(n => n.name).join(', ') || null;

  // Spoken languages
  const langs = detail.spokenLanguages?.slice(0, 4).join(', ') || null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="detail-page">

      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt={detail.title} className="detail-backdrop-img" />}
        <div className="detail-backdrop-overlay" />
      </div>

      {/* ── Back Button ──────────────────────────────────────────── */}
      <button className="detail-back-btn" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* ── Hero: Poster + Info ───────────────────────────────────── */}
      <div className="detail-main">
        {/* Poster */}
        <div className="detail-poster">
          {poster ? (
            <img src={poster} alt={detail.title} />
          ) : (
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
          )}
        </div>

        {/* Info Panel */}
        <div className="detail-info">
          {/* Badges */}
          <div className="detail-badges">
            <span className="pill">{typeLabel}</span>
            {year && <span className="pill">{year}</span>}
            {detail.status && <span className="pill">{detail.status}</span>}
          </div>

          {/* Title */}
          <h1 className="detail-title">{detail.title}</h1>

          {/* Original title (when different) */}
          {detail.originalTitle && detail.originalTitle !== detail.title && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
              Original: {detail.originalTitle}
            </p>
          )}

          {/* Tagline */}
          {detail.tagline && (
            <p className="detail-tagline">"{detail.tagline}"</p>
          )}

          {/* Stats row */}
          <div className="detail-stats">
            {detail.rating > 0 && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <strong>{detail.rating.toFixed(1)}</strong>
                <span>/ 10</span>
                {detail.voteCount > 0 && (
                  <span className="detail-stat-sub">({detail.voteCount.toLocaleString()} votes)</span>
                )}
              </div>
            )}
            {detail.runtime && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{formatRuntime(detail.runtime)}</span>
              </div>
            )}
            {isTV && detail.numberOfSeasons && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                </svg>
                <span>{detail.numberOfSeasons} Season{detail.numberOfSeasons !== 1 ? 's' : ''}</span>
              </div>
            )}
            {isTV && detail.numberOfEpisodes && (
              <div className="detail-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.899L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>
                </svg>
                <span>{detail.numberOfEpisodes} Episodes</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {detail.genreNames?.length > 0 && (
            <div className="detail-genres">
              {detail.genreNames.map(g => (
                <span key={g} className="pill">{g}</span>
              ))}
            </div>
          )}

          {/* Overview */}
          {detail.overview && (
            <div className="detail-overview">
              <h3>Overview</h3>
              <p>{detail.overview}</p>
            </div>
          )}

          {/* Key Crew (Director / Writers / Creator) */}
          {(director || writers.length > 0 || creators.length > 0) && (
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              {director && (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Director
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {director.name}
                  </span>
                </div>
              )}
              {writers.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    {writers.length === 1 ? 'Writer' : 'Writers'}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {writers.map(w => w.name).join(', ')}
                  </span>
                </div>
              )}
              {!director && creators.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    {creators.length === 1 ? 'Creator' : 'Creators'}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {creators.map(c => c.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Primary Action Buttons — real provider link + in-app preview */}
          <div className="detail-actions" style={{ flexWrap: 'wrap', gap: '0.875rem', marginTop: '1.5rem' }}>
            {providerWatchUrl && topProvider && (
              <a
                href={providerWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  background: 'var(--brand-gradient)',
                  color: '#fff',
                  padding: '0.875rem 2rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 0 25px rgba(245,158,11,0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  textDecoration: 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Watch on {topProvider.provider_name}
              </a>
            )}

            <button
              className={providerWatchUrl ? 'btn-ghost' : 'btn-primary'}
              onClick={() => handleStartPlayback(seasonData?.episodes?.[0] || null)}
              style={{
                ...(providerWatchUrl ? {} : {
                  background: 'var(--brand-gradient)',
                  boxShadow: '0 0 25px rgba(245,158,11,0.45)',
                }),
                color: '#fff',
                padding: '0.875rem 2rem',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {isTV ? 'Preview Episode 1' : 'Preview Movie'}
            </button>

            {mainTrailer && (
              <button
                className="btn-ghost"
                onClick={() => openTrailer(mainTrailer)}
                style={{ borderRadius: '999px', padding: '0.875rem 1.75rem', fontWeight: 600 }}
              >
                🎬 Watch Trailer
              </button>
            )}

            <button
              className="btn-ghost"
              onClick={() => detail && toggleWatchlist({ ...detail, mediaType })}
              style={{
                borderRadius: '999px',
                padding: '0.875rem 1.75rem',
                fontWeight: 600,
                borderColor: inList ? 'var(--brand-secondary)' : undefined,
                background: inList ? 'rgba(245, 158, 11, 0.15)' : undefined,
                color: inList ? 'var(--brand-accent)' : undefined,
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={inList ? 'var(--brand-accent)' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              {inList ? 'In My List' : 'Add to List'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Metadata Block ────────────────────────────────────────── */}
      {(detail.originalLanguage || langs || companies || networks || budgetFmt || revenueFmt || detail.productionCountries?.length > 0) && (
        <div className="detail-section" style={{ marginTop: '2.5rem' }}>
          <SectionHeader title="Details" />
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
          }}>
            {detail.originalLanguage && (
              <MetaRow label="Original Language" value={detail.originalLanguage.toUpperCase()} />
            )}
            {langs && (
              <MetaRow label="Languages" value={langs} />
            )}
            {detail.productionCountries?.length > 0 && (
              <MetaRow label="Country" value={detail.productionCountries.join(', ')} />
            )}
            {/* Movie-only */}
            {!isTV && companies && (
              <MetaRow label="Production" value={companies} />
            )}
            {!isTV && budgetFmt && (
              <MetaRow label="Budget" value={budgetFmt} />
            )}
            {!isTV && revenueFmt && (
              <MetaRow label="Revenue" value={revenueFmt} />
            )}
            {/* TV-only */}
            {isTV && networks && (
              <MetaRow label="Network" value={networks} />
            )}
            {isTV && detail.firstAirDate && (
              <MetaRow label="First Aired" value={detail.firstAirDate} />
            )}
            {isTV && detail.lastAirDate && detail.lastAirDate !== detail.firstAirDate && (
              <MetaRow label="Last Aired" value={detail.lastAirDate} />
            )}
          </div>
        </div>
      )}

      {/* ── TV / Anime Seasons & Episodes ─────────────────────────── */}
      {isTV && (
        <div className="detail-section" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
              <h2 className="text-section" style={{ margin: 0 }}>Seasons & Episodes</h2>
            </div>

            {/* Season Selector — uses real TMDB season objects */}
            {seasonsForDropdown.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label htmlFor="season-select" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Season:
                </label>
                <select
                  id="season-select"
                  value={selectedSeasonNum ?? ''}
                  onChange={e => setSelectedSeasonNum(Number(e.target.value))}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {seasonsForDropdown.map(s => (
                    <option key={s.season_number} value={s.season_number} style={{ background: '#0f172a', color: '#fff' }}>
                      {s.name || `Season ${s.season_number}`}
                      {s.episode_count ? ` (${s.episode_count} eps)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Episode Grid */}
          {seasonLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : seasonData?.episodes?.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {seasonData.episodes.map(ep => {
                const stillUrl = ep.stillPath ? `https://image.tmdb.org/t/p/w300${ep.stillPath}` : null;
                const isSelected = selectedEpisode?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeSelect(ep)}
                    style={{
                      background: isSelected ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                      border: isSelected
                        ? '1.5px solid rgba(245,158,11,0.7)'
                        : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isSelected ? '0 0 20px rgba(245,158,11,0.3)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Still image */}
                    <div style={{ height: '150px', position: 'relative', background: '#09090b' }}>
                      {stillUrl ? (
                        <img src={stillUrl} alt={ep.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>🎬</div>
                      )}
                      {/* Dark overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(3,3,4,0.85) 0%, transparent 55%)',
                      }} />
                      {/* Selected checkmark OR play icon */}
                      <div style={{
                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                        width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                        background: isSelected ? 'rgba(245,158,11,1)' : 'rgba(5,5,7,0.6)',
                        border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(4px)',
                      }}>
                        {isSelected ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        )}
                      </div>
                      {/* Episode code badge */}
                      <span style={{
                        position: 'absolute', bottom: '0.5rem', left: '0.625rem',
                        background: 'rgba(5,5,7,0.85)', color: isSelected ? '#fbbf24' : 'var(--brand-primary)',
                        fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem',
                        borderRadius: '4px', border: `1px solid ${isSelected ? 'rgba(245,158,11,0.6)' : 'rgba(245,158,11,0.3)'}`,
                      }}>
                        {ep.episodeCode}
                      </span>
                      {/* Episode rating badge */}
                      {ep.voteAverage > 0 && (
                        <span style={{
                          position: 'absolute', bottom: '0.5rem', right: '0.625rem',
                          background: 'rgba(6,6,13,0.85)', color: '#fbbf24',
                          fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                          borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem',
                        }}>
                          ★ {ep.voteAverage.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Episode text */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: isSelected ? '#fbbf24' : '#f8fafc', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                        {ep.name}
                      </h3>
                      {ep.overview && (
                        <p style={{ fontSize: '0.82rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                          {ep.overview}
                        </p>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)', fontWeight: 600 }}>
                        {ep.airDate && <span>📅 {ep.airDate}</span>}
                        {ep.runtime && <span>⏱️ {ep.runtime} min</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
              Unable to load season information. Please try again.
            </div>
          )}

          {/* ── Selected Episode Detail Panel ── */}
          {selectedEpisode && (() => {
            const ep = selectedEpisode;
            const stillLg = ep.stillPath ? `https://image.tmdb.org/t/p/w780${ep.stillPath}` : null;
            const episodes = seasonData?.episodes || [];
            const currentIdx = episodes.findIndex(e => e.id === ep.id);
            const hasPrev = currentIdx > 0;
            const hasNext = currentIdx !== -1 && currentIdx < episodes.length - 1;

            return (
              <div
                ref={selectedEpisodeRef}
                style={{
                  marginTop: '2rem',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(245,158,11,0.35)',
                  background: 'rgba(10,10,14,0.92)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 0 40px rgba(225,29,72,0.15)',
                }}
              >
                {/* Header bar */}
                <div style={{
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(245,158,11,0.08)',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-accent)' }}>
                    Selected Episode
                  </span>
                  <button
                    onClick={() => setSelectedEpisode(null)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
                      padding: '0.25rem', borderRadius: '4px',
                    }}
                    aria-label="Close episode detail"
                  >
                    ✕
                  </button>
                </div>

                {/* Content: still image + info side by side on larger screens */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 0,
                }}>
                  {/* Still image */}
                  {stillLg && (
                    <div style={{ flex: '0 0 auto', width: 'min(320px, 100%)', position: 'relative' }}>
                      <img
                        src={stillLg}
                        alt={ep.name}
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                      />
                      {/* Gradient fade to info panel */}
                      <div style={{
                        position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%',
                        background: 'linear-gradient(to right, transparent, rgba(10,10,14,0.92))',
                        pointerEvents: 'none',
                      }} />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: '1 1 260px', padding: '1.5rem 1.5rem 1.25rem' }}>
                    {/* Episode code */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.72rem', fontWeight: 800,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--brand-primary)',
                      background: 'rgba(245,158,11,0.12)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '4px', padding: '0.2rem 0.55rem',
                      marginBottom: '0.625rem',
                    }}>
                      {ep.episodeCode}
                    </span>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25, marginBottom: '0.75rem' }}>
                      {ep.name}
                    </h3>

                    {/* Stats chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1rem' }}>
                      {ep.voteAverage > 0 ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24',
                          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                          borderRadius: '999px', padding: '0.25rem 0.7rem',
                        }}>
                          ⭐ {ep.voteAverage.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Rating unavailable</span>
                      )}
                      {ep.airDate ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '999px', padding: '0.25rem 0.7rem',
                        }}>
                          📅 {ep.airDate}
                        </span>
                      ) : null}
                      {ep.runtime ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '999px', padding: '0.25rem 0.7rem',
                        }}>
                          ⏱️ {ep.runtime} min
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Runtime unavailable</span>
                      )}
                    </div>

                    {/* Overview — always ep.overview, never detail.overview */}
                    <p style={{
                      fontSize: '0.9rem', color: 'var(--text-secondary)',
                      lineHeight: 1.65, marginBottom: '1.25rem',
                    }}>
                      {ep.overview || 'No description is available for this episode.'}
                    </p>

                    {/* Actions: Watch + Prev/Next */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        className="btn-primary"
                        onClick={() => handleStartPlayback(ep)}
                        style={{
                          background: 'var(--brand-gradient)',
                          color: '#fff',
                          padding: '0.7rem 1.5rem',
                          borderRadius: '999px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          boxShadow: '0 0 20px rgba(225,29,72,0.45)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Preview Episode
                      </button>

                      {hasPrev && (
                        <button
                          className="btn-ghost"
                          onClick={() => handleEpisodeSelect(episodes[currentIdx - 1])}
                          style={{ borderRadius: '999px', padding: '0.65rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                          Prev
                        </button>
                      )}

                      {hasNext && (
                        <button
                          className="btn-ghost"
                          onClick={() => handleEpisodeSelect(episodes[currentIdx + 1])}
                          style={{ borderRadius: '999px', padding: '0.65rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          Next
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Cast & Crew ───────────────────────────────────────────── */}
      {cast.length > 0 && (
        <CastRow cast={cast} />
      )}

      {/* ── Trailers / Videos ─────────────────────────────────────── */}
      {allVideos.length > 0 && (
        <div className="detail-section" style={{ marginTop: '2.5rem' }}>
          <SectionHeader title="Trailers & Videos" />
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.75rem', scrollbarWidth: 'thin' }}>
            {allVideos.map(video => (
              <div
                key={video.key}
                onClick={() => openTrailer(video)}
                style={{
                  flexShrink: 0,
                  width: 'min(280px, 80vw)',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'var(--bg-elevated)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; }}
              >
                {/* YouTube thumbnail */}
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#030304' }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                    alt={video.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '3rem', height: '3rem', borderRadius: '50%',
                      background: 'rgba(255,0,0,0.85)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.625rem 0.875rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {video.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {video.type}{video.official ? ' · Official' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Where to Watch ─────────────────────────────────────────── */}
      <WatchProviders providers={providers} mediaType={mediaType} id={detail.id} />

      {/* ── Recommendations ────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="detail-section" style={{ marginTop: '2.5rem' }}>
          <SectionHeader title="Recommended For You" />
          <div className="media-grid">
            {recommendations.map(m => <MovieCard key={`rec-${m.id}`} movie={m} />)}
          </div>
        </div>
      )}

      {/* ── Similar Titles (only show if recommendations are sparse) ── */}
      {similar.length > 0 && (!showBothSections ? true : true) && (
        <div className="detail-section" style={{ marginTop: '2.5rem' }}>
          <SectionHeader title={showBothSections ? 'More Like This' : (recommendations.length > 0 ? 'More Like This' : 'Similar Titles')} />
          <div className="media-grid">
            {similar.map(m => <MovieCard key={`sim-${m.id}`} movie={m} />)}
          </div>
        </div>
      )}

      {/* ── Video Player Modal ─────────────────────────────────────── */}
      {activePlayback && (
        <VideoPlayer
          playbackSource={activePlayback}
          initialTime={resumeTime}
          onProgress={handlePlayerProgress}
          onClose={() => setActivePlayback(null)}
          onNextEpisode={
            activeEpisode && seasonData?.episodes
              ? () => {
                  const idx = seasonData.episodes.findIndex(e => e.id === activeEpisode.id);
                  if (idx !== -1 && idx < seasonData.episodes.length - 1) {
                    handleStartPlayback(seasonData.episodes[idx + 1]);
                  }
                }
              : null
          }
          onPrevEpisode={
            activeEpisode && seasonData?.episodes
              ? () => {
                  const idx = seasonData.episodes.findIndex(e => e.id === activeEpisode.id);
                  if (idx > 0) {
                    handleStartPlayback(seasonData.episodes[idx - 1]);
                  }
                }
              : null
          }
        />
      )}

      {/* ── Trailer Modal ──────────────────────────────────────────── */}
      {showTrailer && trailerVideo && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-inner" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1`}
              title={trailerVideo.name || 'Trailer'}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
}
