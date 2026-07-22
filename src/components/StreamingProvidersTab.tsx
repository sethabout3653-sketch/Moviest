import React from 'react';
import { STREAMING_PROVIDERS } from '../constants/providers';
import { StreamingProvider } from '../types';
import { Tv2, Building2, Check, Sparkles } from 'lucide-react';

interface StreamingProvidersTabProps {
  selectedProvider: StreamingProvider | null;
  onSelectProvider: (provider: StreamingProvider | null) => void;
}

export const StreamingProvidersTab: React.FC<StreamingProvidersTabProps> = ({
  selectedProvider,
  onSelectProvider
}) => {
  return (
    <div className="w-full my-8 py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#121218] via-[#181822] to-[#121218] border-y border-white/10 relative overflow-hidden">
      {/* Background Subtle Red Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-[#e50914]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-4 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#e50914]/20 border border-[#e50914]/40 text-[#ff4b55]">
              <Tv2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Streaming Networks & Studios
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e50914]/20 text-[#ff4b55] border border-[#e50914]/30">
                  Filter Hub
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Click any provider or studio below to filter movies and TV shows from their official library
              </p>
            </div>
          </div>

          {selectedProvider && (
            <button
              onClick={() => onSelectProvider(null)}
              className="text-xs font-bold text-[#ff4b55] hover:text-white bg-[#e50914]/20 border border-[#e50914]/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Showing {selectedProvider.name} (Click to reset)
            </button>
          )}
        </div>

        {/* Scrollable Horizontal Pill Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {/* "All Providers" Option */}
          <button
            onClick={() => onSelectProvider(null)}
            className={`shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 border transition-all duration-300 cursor-pointer ${
              selectedProvider === null
                ? 'bg-[#e50914] text-white border-[#e50914] shadow-[0_0_20px_rgba(229,9,20,0.6)] scale-105'
                : 'bg-[#181820] text-gray-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            All Libraries
          </button>

          {/* Provider & Studio Pills */}
          {STREAMING_PROVIDERS.map((provider) => {
            const isSelected = selectedProvider?.id === provider.id;
            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(provider)}
                style={{
                  borderColor: isSelected ? provider.color : undefined
                }}
                className={`shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1f1f2a] text-white shadow-lg scale-105 ring-2 ring-[#e50914]/60'
                    : 'bg-[#16161d] text-gray-300 border-white/10 hover:border-white/30 hover:bg-[#1a1a24] hover:text-white'
                }`}
              >
                {/* Visual Icon / Color Dot */}
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: provider.color }}
                />
                <span>{provider.name}</span>
                {provider.type === 'studio' && (
                  <Building2 className="w-3 h-3 text-gray-400 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
