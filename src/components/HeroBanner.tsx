import React from 'react';
import { Play, Star, Plus, Check, Info } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageUrl } from '../services/tmdb';

interface HeroBannerProps {
  item: MediaItem | null;
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  onPlay,
  onMoreInfo,
  isWatchlisted,
  onToggleWatchlist
}) => {
  if (!item) {
    return (
      <div className="w-full h-[60vh] sm:h-[75vh] bg-[#121217] animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get certification badge color
  const getCertColorClass = (cert?: string) => {
    if (!cert) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    const c = cert.toUpperCase();
    if (['G', 'TV-Y', 'TV-G'].includes(c)) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (['PG', 'TV-PG', 'TV-Y7'].includes(c)) return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    if (['PG-13', 'TV-14'].includes(c)) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40'; // R, TV-MA, NC-17
  };

  return (
    <div className="relative w-full h-[65vh] sm:h-[80vh] overflow-hidden group">
      {/* Background Image & Ambient Gradient Overlays */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(item.backdrop_path || item.poster_path, 'original')}
          alt={item.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out group-hover:scale-100"
        />
        {/* Dark Red Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0d] via-[#0a0a0d]/70 to-transparent" />
        <div className="absolute inset-0 bg-[#e50914]/10 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Badges Bar: PG Rating + IMDb Rating + Year + Quality */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            {/* PG-13 / Content Rating Badge */}
            <span
              className={`px-2.5 py-1 rounded-md border text-[11px] font-black uppercase tracking-wider backdrop-blur-md ${getCertColorClass(
                item.certification
              )}`}
            >
              {item.certification || 'PG-13'}
            </span>

            {/* Numeric Rating */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 border border-amber-500/30 text-amber-400 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {item.vote_average} <span className="text-gray-400 font-medium">/ 10</span>
            </span>

            {/* Quality Tag */}
            <span className="px-2 py-0.5 rounded border border-white/20 text-white/90 bg-white/10 text-[10px] font-black tracking-widest uppercase">
              4K ULTRA HD
            </span>

            {/* Media Type Tag */}
            <span className="px-2.5 py-1 rounded-md bg-[#e50914]/20 border border-[#e50914]/40 text-[#ff4b55] uppercase tracking-wider">
              {item.media_type}
            </span>

            {/* Year */}
            <span className="text-gray-300 font-medium">
              {item.release_date?.substring(0, 4) || '2024'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
            {item.title}
          </h1>

          {/* Synopsis */}
          <p className="text-gray-300 text-xs sm:text-sm line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
            {item.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Watch Now Button */}
            <button
              onClick={() => onPlay(item)}
              className="px-6 py-3 rounded-xl bg-[#e50914] hover:bg-[#ff1e27] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 red-glow transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </button>

            {/* More Info / Details Button */}
            <button
              onClick={() => onMoreInfo(item)}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all duration-300 hover:border-white/40 cursor-pointer"
            >
              <Info className="w-5 h-5" />
              Details & Episodes
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={() => onToggleWatchlist(item)}
              className={`p-3 rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer ${
                isWatchlisted
                  ? 'bg-[#e50914]/30 border-[#e50914] text-[#ff4b55]'
                  : 'bg-black/40 border-white/20 text-white hover:border-white/50'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
