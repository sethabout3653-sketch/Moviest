import { ServerSource } from '../types';

export const SERVER_SOURCES: ServerSource[] = [
  {
    id: 'zxcstream',
    name: 'ZXCStream',
    badge: '🚀 FAST & HD',
    isRecommended: true,
    getUrl: (tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'movie') {
        return `https://zxcstream.xyz/player/movie/${tmdbId}`;
      }
      return `https://zxcstream.xyz/player/tv/${tmdbId}/${season}/${episode}`;
    }
  },
  {
    id: '2embed',
    name: '2Embed',
    badge: '🎬 MULTI-LANG',
    getUrl: (tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'movie') {
        return `https://www.2embed.cc/embed/${tmdbId}`;
      }
      return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
    }
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    badge: '⚡ ULTRA',
    getUrl: (tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'movie') {
        return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
      }
      return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    }
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    badge: '4K PRO',
    getUrl: (tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'movie') {
        return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
      }
      return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
    }
  }
];
