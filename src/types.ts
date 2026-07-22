export type MediaType = 'movie' | 'tv' | 'anime';

export interface MediaItem {
  id: number;
  title: string;
  original_title?: string;
  name?: string; // For TV
  original_name?: string;
  media_type: MediaType;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity: number;
  adult?: boolean;
  certification?: string; // e.g. "PG-13", "TV-MA", "R", "G", "PG"
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  origin_country?: string[];
  tagline?: string;
}

export interface StreamingProvider {
  id: number;
  name: string;
  logo: string; // URL or icon key
  provider_id?: number; // TMDB watch provider ID
  network_id?: number;  // TMDB network ID for TV/Anime
  company_id?: number;  // TMDB production company ID for Studios
  color: string;
  type: 'provider' | 'studio';
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  overview: string;
  air_date?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  vote_average: number;
  runtime?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export type ServerId = 'zxcstream' | '2embed' | 'vidsrc' | 'autoembed';

export interface ServerSource {
  id: ServerId;
  name: string;
  badge: string;
  isRecommended?: boolean;
  getUrl: (tmdbId: number, mediaType: MediaType, season?: number, episode?: number) => string;
}

export interface WatchHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: MediaType;
  timestamp: number;
  season?: number;
  episode?: number;
}
