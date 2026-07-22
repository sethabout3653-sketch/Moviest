import React, { useState, useEffect, useRef } from 'react';
import { Film, Tv, Sparkles, Bookmark, History, Search, Play, X, Star, Flame } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { tmdbService, getImageUrl } from '../services/tmdb';

interface NavbarProps {
  activeTab: 'home' | 'movies' | 'tv' | 'anime' | 'watchlist' | 'history';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'anime' | 'watchlist' | 'history') => void;
  onSelectMedia: (item: MediaItem) => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectMedia,
  watchlistCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Detect scroll for navbar background blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await tmdbService.search(searchQuery);
        setSearchResults(results.slice(0, 8));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item: MediaItem) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    onSelectMedia(item);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0d]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#0a0a0d] via-[#0a0a0d]/70 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#990000] via-[#e50914] to-[#ff4b55] flex items-center justify-center red-glow group-hover:scale-105 transition-transform duration-300">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-1">
              CINE<span className="text-[#e50914] drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]">RED</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase -mt-1">
              STREAM FREE
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121217]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-inner">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-[#e50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'movies'
                ? 'bg-[#e50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Movies
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tv'
                ? 'bg-[#e50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            TV Shows
          </button>
          <button
            onClick={() => setActiveTab('anime')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'anime'
                ? 'bg-[#e50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Anime
          </button>
        </nav>

        {/* Search Bar & Watchlist Action */}
        <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-sm justify-end">
          {/* Instant Search Bar */}
          <div ref={searchRef} className="relative w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search movies, TV, anime..."
                className="w-full bg-[#16161d] border border-white/10 focus:border-[#e50914] text-white text-xs rounded-full pl-9 pr-8 py-2 outline-none transition-all focus:ring-2 focus:ring-[#e50914]/40 placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-[#121217] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-white/5">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                    Searching titles...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => handleSelectSearchResult(item)}
                      className="p-2.5 flex items-center gap-3 hover:bg-[#e50914]/15 cursor-pointer transition-colors group"
                    >
                      <img
                        src={getImageUrl(item.poster_path, 'w300')}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10 group-hover:border-[#e50914]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#ff4b55]">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span className="capitalize font-semibold text-[#e50914]">
                            {item.media_type}
                          </span>
                          <span>•</span>
                          <span>{item.release_date?.substring(0, 4) || 'N/A'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {item.vote_average}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Watchlist Quick Button */}
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`relative p-2.5 rounded-full border transition-all ${
              activeTab === 'watchlist'
                ? 'bg-[#e50914] text-white border-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.6)]'
                : 'bg-[#16161d] text-gray-300 border-white/10 hover:text-white hover:border-[#e50914]'
            }`}
            title="My Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e50914] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0a0a0d]">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* History Quick Button */}
          <button
            onClick={() => setActiveTab('history')}
            className={`p-2.5 rounded-full border transition-all ${
              activeTab === 'history'
                ? 'bg-[#e50914] text-white border-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.6)]'
                : 'bg-[#16161d] text-gray-300 border-white/10 hover:text-white hover:border-[#e50914]'
            }`}
            title="Watch History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0d]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'home' ? 'text-[#e50914]' : 'text-gray-400'
          }`}
        >
          <Flame className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'movies' ? 'text-[#e50914]' : 'text-gray-400'
          }`}
        >
          <Film className="w-5 h-5" />
          Movies
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'tv' ? 'text-[#e50914]' : 'text-gray-400'
          }`}
        >
          <Tv className="w-5 h-5" />
          TV Shows
        </button>
        <button
          onClick={() => setActiveTab('anime')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'anime' ? 'text-[#e50914]' : 'text-gray-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Anime
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold relative ${
            activeTab === 'watchlist' ? 'text-[#e50914]' : 'text-gray-400'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          Saved
          {watchlistCount > 0 && (
            <span className="absolute -top-1 right-1 bg-[#e50914] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {watchlistCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
