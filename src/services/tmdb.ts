import { MediaItem, MediaType, Season, Episode, CastMember, VideoTrailer } from '../types';

const BASE_URL = '/api/tmdb'; // Express server proxy route
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// In-memory certification cache to minimize redundant calls
const certificationCache: Record<string, string> = {};

export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'w1280' | 'original' = 'w500'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80'; // Sleek dark film backdrop placeholder
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const fetchTMDB = async <T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.set(key, String(val));
    }
  });

  const url = `${BASE_URL}/${endpoint}?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch from TMDB: ${res.statusText}`);
  }
  return res.json();
};

// Fetch certification (e.g. PG-13, R, TV-MA, PG) for a single item
export const fetchCertification = async (id: number, mediaType: MediaType): Promise<string> => {
  const cacheKey = `${mediaType}_${id}`;
  if (certificationCache[cacheKey]) {
    return certificationCache[cacheKey];
  }

  try {
    if (mediaType === 'movie') {
      const data = await fetchTMDB<{ results: { iso_3166_1: string; release_dates: { certification: string }[] }[] }>(
        `movie/${id}/release_dates`
      );
      const usRelease = data.results?.find((r) => r.iso_3166_1 === 'US');
      let cert = usRelease?.release_dates?.find((rd) => rd.certification && rd.certification.trim() !== '')?.certification;

      if (!cert) {
        // Fallback to any non-empty certification in other countries
        for (const country of data.results || []) {
          const found = country.release_dates?.find((rd) => rd.certification && rd.certification.trim() !== '')?.certification;
          if (found) {
            cert = found;
            break;
          }
        }
      }

      const finalCert = cert || 'PG-13';
      certificationCache[cacheKey] = finalCert;
      return finalCert;
    } else {
      // TV Show or Anime
      const data = await fetchTMDB<{ results: { iso_3166_1: string; rating: string }[] }>(
        `tv/${id}/content_ratings`
      );
      const usRating = data.results?.find((r) => r.iso_3166_1 === 'US')?.rating;
      let cert = usRating;

      if (!cert && data.results?.length) {
        cert = data.results.find((r) => r.rating && r.rating.trim() !== '')?.rating;
      }

      const finalCert = cert || 'TV-14';
      certificationCache[cacheKey] = finalCert;
      return finalCert;
    }
  } catch {
    const fallback = mediaType === 'movie' ? 'PG-13' : 'TV-14';
    certificationCache[cacheKey] = fallback;
    return fallback;
  }
};

// Helper to batch format media items with clean default certifications if needed
const processMediaResults = (results: any[], defaultType: MediaType): MediaItem[] => {
  if (!Array.isArray(results)) return [];

  return results
    .filter((item) => item.poster_path || item.backdrop_path)
    .map((item) => {
      const isTV = defaultType === 'tv' || item.media_type === 'tv' || !!item.first_air_date;
      const isAnime =
        defaultType === 'anime' ||
        (item.genre_ids && item.genre_ids.includes(16) && item.origin_country?.includes('JP')) ||
        item.original_language === 'ja';

      const mediaType: MediaType = isAnime ? 'anime' : isTV ? 'tv' : 'movie';

      // Estimate initial certification for fast rendering, will be enriched via cache or fetch
      let estCert = 'PG-13';
      if (item.adult) estCert = 'NC-17';
      else if (mediaType === 'tv' || mediaType === 'anime') estCert = 'TV-14';
      else if (item.vote_average > 8.0) estCert = 'PG-13';

      return {
        id: item.id,
        title: item.title || item.name || item.original_title || item.original_name || 'Untitled',
        original_title: item.original_title || item.original_name,
        name: item.name || item.title,
        media_type: mediaType,
        overview: item.overview || 'No description available for this title.',
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: Math.round((item.vote_average || 7.0) * 10) / 10,
        vote_count: item.vote_count || 0,
        release_date: item.release_date || item.first_air_date || '',
        first_air_date: item.first_air_date,
        genre_ids: item.genre_ids || [],
        popularity: item.popularity || 0,
        adult: item.adult,
        certification: estCert
      };
    });
};

// Main TMDB Service Functions
export const tmdbService = {
  // Trending content
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<MediaItem[]> => {
    const data = await fetchTMDB<{ results: any[] }>(`trending/${type}/${timeWindow}`, { language: 'en-US' });
    return processMediaResults(data.results, type === 'tv' ? 'tv' : 'movie');
  },

  // Popular Movies
  getPopularMovies: async (page = 1, genreId?: number): Promise<MediaItem[]> => {
    const params: Record<string, any> = {
      language: 'en-US',
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 50
    };
    if (genreId) params.with_genres = genreId;

    const data = await fetchTMDB<{ results: any[] }>('discover/movie', params);
    return processMediaResults(data.results, 'movie');
  },

  // Popular TV Shows
  getPopularTVShows: async (page = 1, genreId?: number): Promise<MediaItem[]> => {
    const params: Record<string, any> = {
      language: 'en-US',
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 30
    };
    if (genreId) params.with_genres = genreId;

    const data = await fetchTMDB<{ results: any[] }>('discover/tv', params);
    return processMediaResults(data.results, 'tv');
  },

  // Anime (Animation genre 16 + Origin JP or Keyword 210024)
  getPopularAnime: async (page = 1): Promise<MediaItem[]> => {
    const data = await fetchTMDB<{ results: any[] }>('discover/tv', {
      language: 'en-US',
      page,
      sort_by: 'popularity.desc',
      with_genres: 16,
      with_origin_country: 'JP'
    });
    return processMediaResults(data.results, 'anime');
  },

  // Anime Movies
  getAnimeMovies: async (page = 1): Promise<MediaItem[]> => {
    const data = await fetchTMDB<{ results: any[] }>('discover/movie', {
      language: 'en-US',
      page,
      sort_by: 'popularity.desc',
      with_genres: 16,
      with_origin_country: 'JP'
    });
    return processMediaResults(data.results, 'anime');
  },

  // Filter by Provider or Studio
  getByProviderOrStudio: async (
    providerId?: number,
    networkId?: number,
    companyId?: number,
    mediaType: MediaType = 'movie',
    page = 1
  ): Promise<MediaItem[]> => {
    const params: Record<string, any> = {
      language: 'en-US',
      page,
      sort_by: 'popularity.desc'
    };

    let endpoint = mediaType === 'movie' ? 'discover/movie' : 'discover/tv';

    if (providerId) {
      params.with_watch_providers = providerId;
      params.watch_region = 'US';
    }
    if (networkId && mediaType !== 'movie') {
      params.with_networks = networkId;
    }
    if (companyId) {
      params.with_companies = companyId;
    }

    const data = await fetchTMDB<{ results: any[] }>(endpoint, params);
    return processMediaResults(data.results, mediaType);
  },

  // Multi Search
  search: async (query: string, page = 1): Promise<MediaItem[]> => {
    if (!query.trim()) return [];
    const data = await fetchTMDB<{ results: any[] }>('search/multi', {
      query: query.trim(),
      language: 'en-US',
      page,
      include_adult: false
    });
    return processMediaResults(data.results, 'movie');
  },

  // Item Details
  getDetails: async (id: number, mediaType: MediaType): Promise<MediaItem> => {
    const endpoint = mediaType === 'movie' ? `movie/${id}` : `tv/${id}`;
    const data = await fetchTMDB<any>(endpoint, {
      language: 'en-US',
      append_to_response: 'videos,credits,recommendations,similar'
    });

    const cert = await fetchCertification(id, mediaType);

    return {
      id: data.id,
      title: data.title || data.name || 'Untitled',
      original_title: data.original_title || data.original_name,
      name: data.name || data.title,
      media_type: mediaType,
      overview: data.overview || 'No synopsis available.',
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      vote_average: Math.round((data.vote_average || 7.0) * 10) / 10,
      vote_count: data.vote_count || 0,
      release_date: data.release_date || data.first_air_date || '',
      genres: data.genres || [],
      popularity: data.popularity || 0,
      adult: data.adult,
      certification: cert,
      runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : 45),
      number_of_seasons: data.number_of_seasons || 1,
      number_of_episodes: data.number_of_episodes || 1,
      tagline: data.tagline
    };
  },

  // TV / Anime Season Details
  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<{ season: Season; episodes: Episode[] }> => {
    const data = await fetchTMDB<any>(`tv/${tvId}/season/${seasonNumber}`, { language: 'en-US' });
    const episodes: Episode[] = (data.episodes || []).map((ep: any) => ({
      id: ep.id,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || 'No episode details available.',
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      still_path: ep.still_path,
      air_date: ep.air_date,
      vote_average: Math.round((ep.vote_average || 7.0) * 10) / 10,
      runtime: ep.runtime || 24
    }));

    return {
      season: {
        id: data.id,
        name: data.name || `Season ${seasonNumber}`,
        season_number: data.season_number,
        episode_count: episodes.length,
        poster_path: data.poster_path,
        overview: data.overview || ''
      },
      episodes
    };
  },

  // Trailers
  getTrailers: async (id: number, mediaType: MediaType): Promise<VideoTrailer[]> => {
    const endpoint = mediaType === 'movie' ? `movie/${id}/videos` : `tv/${id}/videos`;
    try {
      const data = await fetchTMDB<{ results: any[] }>(endpoint, { language: 'en-US' });
      return (data.results || []).filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    } catch {
      return [];
    }
  },

  // Cast
  getCast: async (id: number, mediaType: MediaType): Promise<CastMember[]> => {
    const endpoint = mediaType === 'movie' ? `movie/${id}/credits` : `tv/${id}/credits`;
    try {
      const data = await fetchTMDB<{ cast: any[] }>(endpoint, { language: 'en-US' });
      return (data.cast || []).slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path
      }));
    } catch {
      return [];
    }
  }
};
