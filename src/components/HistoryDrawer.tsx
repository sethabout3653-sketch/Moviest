import React from 'react';
import { X, History, Trash2, Play } from 'lucide-react';
import { WatchHistoryItem, MediaItem } from '../types';
import { getImageUrl } from '../services/tmdb';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: WatchHistoryItem[];
  onSelectMedia: (item: MediaItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectMedia,
  onClearHistory
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
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Watch History</h2>
                <p className="text-xs text-gray-400">{history.length} recently viewed</p>
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
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 text-gray-500">
                <History className="w-12 h-12 opacity-30" />
                <p className="text-sm font-bold text-gray-400">No Watch History Yet</p>
                <p className="text-xs max-w-xs">
                  Titles you watch will automatically be logged here so you never lose your progress!
                </p>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={`${h.mediaItem.id}-${h.timestamp}`}
                  className="group relative flex items-center gap-3 p-2.5 rounded-2xl bg-[#14141c] border border-white/5 hover:border-[#e50914]/50 transition-all cursor-pointer"
                  onClick={() => {
                    onSelectMedia(h.mediaItem);
                    onClose();
                  }}
                >
                  <img
                    src={getImageUrl(h.mediaItem.poster_path, 'w300')}
                    alt={h.mediaItem.title}
                    className="w-16 aspect-[2/3] object-cover rounded-xl border border-white/10 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-[#ff4b55] truncate">
                      {h.mediaItem.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="uppercase font-bold text-[#e50914]">
                        {h.mediaItem.media_type}
                      </span>
                      {h.season && h.episode && (
                        <span className="text-amber-400 font-bold">
                          S{h.season} E{h.episode}
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMedia(h.mediaItem);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-[#e50914] text-white hover:bg-[#ff1e27] cursor-pointer"
                    title="Resume Playing"
                  >
                    <Play className="w-4 h-4 fill-white" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Clear History */}
          {history.length > 0 && (
            <div className="p-4 bg-[#09090d]">
              <button
                onClick={onClearHistory}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Watch History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
