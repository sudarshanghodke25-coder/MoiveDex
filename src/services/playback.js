/**
 * services/playback.js
 *
 * Single source of truth for MovieHub authorized video playback streams.
 * Decouples video rendering and playback from metadata sources (TMDB).
 * Uses legal, open-source test content (Creative Commons CC BY) for streaming POC.
 */

// Legal, public-domain / Creative Commons test video streams
const SAMPLE_VIDEOS = {
  default: {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    qualities: [
      { label: 'Auto', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { label: '1080p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { label: '720p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { label: '480p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    ],
  },
  action: {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    qualities: [
      { label: 'Auto', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { label: '1080p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { label: '720p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    ],
  },
  animation: {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    qualities: [
      { label: 'Auto', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { label: '1080p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { label: '720p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2012.mp4' },
    ],
  }
};

/**
 * Normalized playback source provider.
 *
 * @param {Object} params
 * @param {number|string} params.contentId
 * @param {'movie'|'tv'|'anime'} [params.mediaType='movie']
 * @param {number} [params.seasonNumber]
 * @param {number} [params.episodeNumber]
 * @param {string} [params.title]
 * @param {string} [params.posterPath]
 *
 * @returns {Promise<Object>} PlaybackSource
 */
export async function getPlaybackSource({
  contentId,
  mediaType = 'movie',
  seasonNumber = 1,
  episodeNumber = 1,
  title = 'Untitled',
  posterPath = null,
} = {}) {
  // Simulate network delay for real stream resolution
  await new Promise(res => setTimeout(res, 200));

  if (!contentId) {
    return {
      playable: false,
      reason: 'No content ID provided.',
    };
  }

  // Select test video based on media type / episode to demonstrate true streaming
  const sampleKey = mediaType === 'tv' ? 'action' : (mediaType === 'anime' ? 'animation' : 'default');
  const sample = SAMPLE_VIDEOS[sampleKey] || SAMPLE_VIDEOS.default;

  const displayTitle = mediaType === 'tv' || mediaType === 'anime'
    ? `${title} — S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`
    : title;

  return {
    playable: true,
    contentId,
    mediaType,
    seasonNumber,
    episodeNumber,
    title: displayTitle,
    rawTitle: title,
    videoUrl: sample.videoUrl,
    posterUrl: posterPath ? `https://image.tmdb.org/t/p/w780${posterPath}` : null,
    qualities: sample.qualities,
    audioTracks: [
      { label: 'Original Audio', code: 'orig' },
      { label: 'Japanese', code: 'ja' },
      { label: 'English', code: 'en' },
      { label: 'Hindi', code: 'hi' },
    ],
    subtitleTracks: [
      { label: 'Off', code: 'off' },
      { label: 'English', code: 'en' },
      { label: 'Hindi', code: 'hi' },
      { label: 'Japanese', code: 'ja' },
    ],
  };
}
