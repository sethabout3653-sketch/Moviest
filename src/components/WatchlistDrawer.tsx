import React from 'react';
import { X, Trash2, Play, Bookmark } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageUrl } from '../services/tmdb';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onClearWatchlist: () => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  onSelectMedia,
  onRemoveFromWatchlist,
  onClearWatchlist
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e0e13] border-l border-white/10 shadow-2xl flex flex-col divide-y divide-white/10">
          {/* Header */}
          <div className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#e50914]/20 border border-[#e50914]/40 text-[#ff4b55]">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">My Watchlist</h2>
                <p className="text-xs text-gray-400">{watchlist.length} saved titles</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
            {watchlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 text-gray-500">
                <Bookmark className="w-12 h-12 opacity-30" />
                <p className="text-sm font-bold text-gray-400">Your Watchlist is Empty</p>
                <p className="text-xs max-w-xs">
                  Bookmark movies, TV shows, and anime to save them for later!
                </p>
              </div>
            ) : (
              watchlist.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-3 p-2.5 rounded-2xl bg-[#14141c] border border-white/5 hover:border-[#e50914]/50 transition-all cursor-pointer"
                  onClick={() => {
                    onSelectMedia(item);
                    onClose();
                  }}
                >
                  <img
                    src={getImageUrl(item.poster_path, 'w300')}
                    alt={item.title}
                    className="w-16 aspect-[2/3] object-cover rounded-xl border border-white/10 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-[#ff4b55] truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="uppercase font-bold text-[#e50914]">{item.media_type}</span>
                      <span>•</span>
                      <span>⭐ {item.vote_average}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMedia(item);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-[#e50914] text-white hover:bg-[#ff1e27] cursor-pointer"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(item);
                      }}
                      className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Clear All */}
          {watchlist.length > 0 && (
            <div className="p-4 bg-[#09090d]">
              <button
                onClick={onClearWatchlist}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Watchlist Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
