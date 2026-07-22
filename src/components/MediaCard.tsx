import React, { useState, useEffect } from 'react';
import { Star, Play, Bookmark, Check } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageUrl, fetchCertification } from '../services/tmdb';

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (item: MediaItem, e: React.MouseEvent) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  isWatchlisted = false,
  onToggleWatchlist
}) => {
  const [certification, setCertification] = useState<string>(item.certification || 'PG-13');

  // Fetch rating certification
  useEffect(() => {
    let isMounted = true;
    if (!item.certification || item.certification === 'PG-13') {
      fetchCertification(item.id, item.media_type).then((cert) => {
        if (isMounted) setCertification(cert);
      });
    } else {
      setCertification(item.certification);
    }
    return () => {
      isMounted = false;
    };
  }, [item.id, item.media_type, item.certification]);

  // Color mapper for content rating badge
  const getCertBadgeColor = (certStr: string) => {
    const c = certStr.toUpperCase();
    if (['G', 'TV-Y', 'TV-G'].includes(c))
      return 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    if (['PG', 'TV-PG', 'TV-Y7'].includes(c))
      return 'bg-sky-950/90 text-sky-400 border-sky-500/60 shadow-[0_0_8px_rgba(14,165,233,0.4)]';
    if (['PG-13', 'TV-14'].includes(c))
      return 'bg-amber-950/90 text-amber-400 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    return 'bg-red-950/90 text-red-400 border-red-500/60 shadow-[0_0_10px_rgba(229,9,20,0.5)]'; // R, TV-MA, NC-17
  };

  const titleText = item.title || item.name || 'Untitled';
  const yearText = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2024';

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col bg-[#121217] rounded-2xl overflow-hidden border border-white/10 hover:border-[#e50914] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer shadow-lg hover:shadow-[0_12px_30px_rgba(229,9,20,0.35)]"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181822]">
        <img
          src={getImageUrl(item.poster_path, 'w500')}
          alt={titleText}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-black/60 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* TOP-LEFT: PG-13 / CONTENT RATING BADGE ON MOVIE POSTER */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-transform group-hover:scale-105 ${getCertBadgeColor(
              certification
            )}`}
          >
            {certification}
          </span>
        </div>

        {/* TOP-RIGHT: NUMERIC RATING BADGE */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 border border-amber-500/40 text-amber-400 text-[10px] font-black backdrop-blur-md shadow-md">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{item.vote_average || '7.5'}</span>
        </div>

        {/* HOVER PLAY OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-[2px] z-20">
          <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center red-glow transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* QUICK WATCHLIST BOOKMARK BUTTON */}
        {onToggleWatchlist && (
          <button
            onClick={(e) => onToggleWatchlist(item, e)}
            className={`absolute bottom-2.5 right-2.5 z-30 p-2 rounded-full border backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isWatchlisted
                ? 'bg-[#e50914] text-white border-[#e50914]'
                : 'bg-black/60 text-gray-300 border-white/20 hover:text-white hover:border-white/50 opacity-0 group-hover:opacity-100'
            }`}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {isWatchlisted ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* CARD METADATA FOOTER (NO OVERLAP GUARANTEE) */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-1.5 bg-gradient-to-b from-[#121217] to-[#0d0d12]">
        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ff4b55] transition-colors truncate leading-snug">
          {titleText}
        </h3>

        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span className="capitalize font-semibold text-[#e50914] px-1.5 py-0.5 rounded bg-[#e50914]/10 border border-[#e50914]/20">
            {item.media_type}
          </span>
          <span>{yearText}</span>
          <span className="text-gray-500 font-bold">HD</span>
        </div>
      </div>
    </div>
  );
};
