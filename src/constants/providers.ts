import { StreamingProvider } from '../types';

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    id: 1,
    name: 'Netflix',
    logo: 'https://image.tmdb.org/t/p/w200/9A1JSVmSxsA34C3z82A4335056.jpg', // or custom stylized SVG/badge
    provider_id: 8,
    network_id: 213,
    color: '#E50914',
    type: 'provider'
  },
  {
    id: 2,
    name: 'Disney+',
    logo: 'https://image.tmdb.org/t/p/w200/7qe13L8B5R3A12A4335056.jpg',
    provider_id: 337,
    network_id: 2739,
    color: '#0063E5',
    type: 'provider'
  },
  {
    id: 3,
    name: 'Max / HBO',
    logo: 'https://image.tmdb.org/t/p/w200/433056_hbo.jpg',
    provider_id: 1899,
    network_id: 49,
    color: '#7014F4',
    type: 'provider'
  },
  {
    id: 4,
    name: 'Prime Video',
    logo: 'https://image.tmdb.org/t/p/w200/prime.jpg',
    provider_id: 119,
    network_id: 1024,
    color: '#00A8E1',
    type: 'provider'
  },
  {
    id: 5,
    name: 'Apple TV+',
    logo: 'https://image.tmdb.org/t/p/w200/apple.jpg',
    provider_id: 350,
    network_id: 2552,
    color: '#2d3748',
    type: 'provider'
  },
  {
    id: 6,
    name: 'Crunchyroll',
    logo: 'https://image.tmdb.org/t/p/w200/crunchyroll.jpg',
    provider_id: 283,
    network_id: 1112,
    color: '#FF6B00',
    type: 'provider'
  },
  {
    id: 7,
    name: 'Paramount+',
    logo: 'https://image.tmdb.org/t/p/w200/paramount.jpg',
    provider_id: 531,
    network_id: 4330,
    color: '#0064FF',
    type: 'provider'
  },
  {
    id: 8,
    name: 'Hulu',
    logo: 'https://image.tmdb.org/t/p/w200/hulu.jpg',
    provider_id: 15,
    network_id: 453,
    color: '#1CE783',
    type: 'provider'
  },
  {
    id: 9,
    name: 'Marvel Studios',
    logo: 'https://image.tmdb.org/t/p/w200/marvel.jpg',
    company_id: 420,
    color: '#ED1D24',
    type: 'studio'
  },
  {
    id: 10,
    name: 'Warner Bros.',
    logo: 'https://image.tmdb.org/t/p/w200/warner.jpg',
    company_id: 174,
    color: '#003366',
    type: 'studio'
  },
  {
    id: 11,
    name: 'Sony Pictures',
    logo: 'https://image.tmdb.org/t/p/w200/sony.jpg',
    company_id: 34,
    color: '#1a1a2e',
    type: 'studio'
  },
  {
    id: 12,
    name: 'Studio Ghibli',
    logo: 'https://image.tmdb.org/t/p/w200/ghibli.jpg',
    company_id: 10342,
    color: '#3498db',
    type: 'studio'
  }
];

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};
