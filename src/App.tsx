import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StreamingProvidersTab } from './components/StreamingProvidersTab';
import { GenrePillBar } from './components/GenrePillBar';
import { MediaGrid } from './components/MediaGrid';
import { MediaDetailModal } from './components/MediaDetailModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MediaItem, StreamingProvider, WatchHistoryItem } from './types';
import { tmdbService } from './services/tmdb';
import { Flame, Film, Tv, Sparkles, Star, Clapperboard, Filter } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'anime' | 'watchlist' | 'history'>('home');
  const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [animeList, setAnimeList] = useState<MediaItem[]>([]);
  const [providerItems, setProviderItems] = useState<MediaItem[]>([]);

  const [selectedProvider, setSelectedProvider] = useState<StreamingProvider | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProviderLoading, setIsProviderLoading] = useState<boolean>(false);

  // Watchlist Local Storage
  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinered_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Watch History Local Storage
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinered_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync Watchlist
  useEffect(() => {
    localStorage.setItem('cinered_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Sync History
  useEffect(() => {
    localStorage.setItem('cinered_history', JSON.stringify(history));
  }, [history]);

  // Initial Content Load
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadInitialData = async () => {
      try {
        const [trendData, popMovies, popTV, popAnime] = await Promise.all([
          tmdbService.getTrending('all', 'week'),
          tmdbService.getPopularMovies(1, selectedGenreId || undefined),
          tmdbService.getPopularTVShows(1, selectedGenreId || undefined),
          tmdbService.getPopularAnime(1)
        ]);

        if (!isMounted) return;

        setTrending(trendData);
        if (trendData.length > 0) {
          setHeroItem(trendData[0]);
        }
        setMovies(popMovies);
        setTvShows(popTV);
        setAnimeList(popAnime);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [selectedGenreId]);

  // Provider Filter Effect
  useEffect(() => {
    if (!selectedProvider) {
      setProviderItems([]);
      return;
    }

    let isMounted = true;
    setIsProviderLoading(true);

    tmdbService
      .getByProviderOrStudio(
        selectedProvider.provider_id,
        selectedProvider.network_id,
        selectedProvider.company_id,
        'movie',
        1
      )
      .then((items) => {
        if (isMounted) {
          setProviderItems(items);
          setIsProviderLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching provider items:', err);
        if (isMounted) setIsProviderLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProvider]);

  // Watchlist Handlers
  const handleToggleWatchlist = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlist((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  const handleClearWatchlist = () => {
    setWatchlist([]);
  };

  // Record History Handler
  const handleRecordHistory = (item: MediaItem, season?: number, episode?: number) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const newItem: WatchHistoryItem = {
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        media_type: item.media_type,
        timestamp: Date.now(),
        season,
        episode
      };
      return [newItem, ...filtered].slice(0, 30);
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const watchlistIds = watchlist.map((w) => w.id);
  const isSelectedWatchlisted = selectedMedia ? watchlistIds.includes(selectedMedia.id) : false;

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-gray-100 flex flex-col font-sans selection:bg-[#e50914] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectMedia={(item) => setSelectedMedia(item)}
        watchlistCount={watchlist.length}
      />

      {/* Main View Area */}
      <main className="flex-1 pt-16 pb-20 md:pb-10">
        {/* Watchlist Drawer Overlay */}
        <WatchlistDrawer
          isOpen={activeTab === 'watchlist'}
          onClose={() => setActiveTab('home')}
          watchlist={watchlist}
          onSelectMedia={(item) => setSelectedMedia(item)}
          onRemoveFromWatchlist={handleToggleWatchlist}
          onClearWatchlist={handleClearWatchlist}
        />

        {/* History Drawer Overlay */}
        <HistoryDrawer
          isOpen={activeTab === 'history'}
          onClose={() => setActiveTab('home')}
          history={history}
          onSelectMedia={(item) => setSelectedMedia(item)}
          onClearHistory={handleClearHistory}
        />

        {/* Home / Movies / TV / Anime Views */}
        <div className="space-y-4">
            {/* Featured Hero Banner */}
            {activeTab === 'home' && (
              <HeroBanner
                item={heroItem}
                onPlay={(item) => setSelectedMedia(item)}
                onMoreInfo={(item) => setSelectedMedia(item)}
                isWatchlisted={heroItem ? watchlistIds.includes(heroItem.id) : false}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* STREAMING PROVIDERS & STUDIOS TAB (Prominent middle of Home screen) */}
            {activeTab === 'home' && (
              <StreamingProvidersTab
                selectedProvider={selectedProvider}
                onSelectProvider={(prov) => setSelectedProvider(prov)}
              />
            )}

            {/* Provider Filter Results Grid if active */}
            {selectedProvider && (
              <MediaGrid
                title={`${selectedProvider.name} Official Collection`}
                icon={<Filter className="w-5 h-5 text-[#e50914]" />}
                items={providerItems}
                onSelectMedia={(item) => setSelectedMedia(item)}
                watchlistIds={watchlistIds}
                onToggleWatchlist={handleToggleWatchlist}
                isLoading={isProviderLoading}
              />
            )}

            {/* Genre Filter Pill Bar */}
            <GenrePillBar
              selectedGenreId={selectedGenreId}
              onSelectGenre={(gId) => setSelectedGenreId(gId)}
            />

            {/* TAB: HOME */}
            {activeTab === 'home' && (
              <>
                <MediaGrid
                  title="Trending & Hot Right Now"
                  icon={<Flame className="w-5 h-5 text-[#e50914]" />}
                  items={trending}
                  onSelectMedia={(item) => setSelectedMedia(item)}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  isLoading={isLoading}
                />

                <MediaGrid
                  title="Popular Movies"
                  icon={<Film className="w-5 h-5 text-[#e50914]" />}
                  items={movies}
                  onSelectMedia={(item) => setSelectedMedia(item)}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  isLoading={isLoading}
                />

                <MediaGrid
                  title="Top TV Shows & Series"
                  icon={<Tv className="w-5 h-5 text-[#e50914]" />}
                  items={tvShows}
                  onSelectMedia={(item) => setSelectedMedia(item)}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  isLoading={isLoading}
                />

                <MediaGrid
                  title="Top Anime Series & Movies"
                  icon={<Sparkles className="w-5 h-5 text-[#e50914]" />}
                  items={animeList}
                  onSelectMedia={(item) => setSelectedMedia(item)}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  isLoading={isLoading}
                />
              </>
            )}

            {/* TAB: MOVIES */}
            {activeTab === 'movies' && (
              <MediaGrid
                title="Explore Movies"
                icon={<Film className="w-5 h-5 text-[#e50914]" />}
                items={movies}
                onSelectMedia={(item) => setSelectedMedia(item)}
                watchlistIds={watchlistIds}
                onToggleWatchlist={handleToggleWatchlist}
                isLoading={isLoading}
              />
            )}

            {/* TAB: TV SHOWS */}
            {activeTab === 'tv' && (
              <MediaGrid
                title="Explore TV Series"
                icon={<Tv className="w-5 h-5 text-[#e50914]" />}
                items={tvShows}
                onSelectMedia={(item) => setSelectedMedia(item)}
                watchlistIds={watchlistIds}
                onToggleWatchlist={handleToggleWatchlist}
                isLoading={isLoading}
              />
            )}

            {/* TAB: ANIME */}
            {activeTab === 'anime' && (
              <MediaGrid
                title="Anime World (JP Series & Movies)"
                icon={<Sparkles className="w-5 h-5 text-[#e50914]" />}
                items={animeList}
                onSelectMedia={(item) => setSelectedMedia(item)}
                watchlistIds={watchlistIds}
                onToggleWatchlist={handleToggleWatchlist}
                isLoading={isLoading}
              />
            )}
          </div>
      </main>

      {/* Media Detail & Embedded Video Player Modal */}
      {selectedMedia && (
        <MediaDetailModal
          item={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onSelectMedia={(item) => setSelectedMedia(item)}
          isWatchlisted={isSelectedWatchlisted}
          onToggleWatchlist={handleToggleWatchlist}
          onRecordHistory={handleRecordHistory}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#08080b] border-t border-white/5 py-8 px-4 text-center text-xs text-gray-500 space-y-2">
        <p className="font-bold text-gray-400">
          CineStream Free Movies, TV Shows & Anime Engine
        </p>
        <p className="max-w-xl mx-auto text-[11px] text-gray-600">
          Powered by TMDB API. Streams provided via ZXCStream, 2Embed, VidSrc, and AutoEmbed servers.
        </p>
      </footer>
    </div>
  );
}
