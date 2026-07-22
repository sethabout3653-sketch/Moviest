import React from 'react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  title: string;
  icon?: React.ReactNode;
  items: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  watchlistIds: number[];
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  icon,
  items,
  onSelectMedia,
  watchlistIds,
  onToggleWatchlist,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="h-6 w-48 bg-[#181822] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] w-full bg-[#16161d] rounded-2xl animate-pulse border border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-[#e50914]">{icon}</div>}
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
            {title}
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
            {items.length} Titles
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {items.map((item) => (
          <MediaCard
            key={`${item.media_type}-${item.id}`}
            item={item}
            onSelect={onSelectMedia}
            isWatchlisted={watchlistIds.includes(item.id)}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </section>
  );
};
