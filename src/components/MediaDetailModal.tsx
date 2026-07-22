import React, { useState, useEffect } from 'react';
import { X, Play, Star, Bookmark, Check, Tv, Server, Volume2 } from 'lucide-react';
import { MediaItem, Season, Episode, CastMember, VideoTrailer, ServerId } from '../types';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { SERVER_SOURCES } from '../constants/servers';

interface MediaDetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  onRecordHistory: (item: MediaItem, season?: number, episode?: number) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onSelectMedia,
  isWatchlisted,
  onToggleWatchlist,
  onRecordHistory
}) => {
  if (!item) return null;

  const [details, setDetails] = useState<MediaItem>(item);
  const [selectedServer, setSelectedServer] = useState<ServerId>('zxcstream');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<{ season: Season; episodes: Episode[] } | null>(null);
  const [loadingSeason, setLoadingSeason] = useState<boolean>(false);
  const [trailers, setTrailers] = useState<VideoTrailer[]>([]);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);

  // Load complete details, cast, trailers, recommendations
  useEffect(() => {
    let isMounted = true;
    setIsPlaying(false);
    setCurrentSeason(1);
    setCurrentEpisode(1);

    const loadData = async () => {
      try {
        const fullDetails = await tmdbService.getDetails(item.id, item.media_type);
        if (!isMounted) return;
        setDetails(fullDetails);

        const trailerList = await tmdbService.getTrailers(item.id, item.media_type);
        if (isMounted) setTrailers(trailerList);

        const castList = await tmdbService.getCast(item.id, item.media_type);
        if (isMounted) setCast(castList);

        if (item.media_type === 'movie') {
          const recs = await tmdbService.getPopularMovies(1, item.genre_ids?.[0]);
          if (isMounted) setSimilarItems(recs.filter((m) => m.id !== item.id).slice(0, 8));
        } else {
          const recs = await tmdbService.getPopularTVShows(1, item.genre_ids?.[0]);
          if (isMounted) setSimilarItems(recs.filter((m) => m.id !== item.id).slice(0, 8));
        }
      } catch (err) {
        console.error('Error loading detail data:', err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [item]);

  // Load season & episode info for TV / Anime
  useEffect(() => {
    if (item.media_type === 'movie') return;

    let isMounted = true;
    setLoadingSeason(true);

    tmdbService
      .getSeasonDetails(item.id, currentSeason)
      .then((data) => {
        if (isMounted) {
          setSeasonData(data);
          setLoadingSeason(false);
        }
      })
      .catch((err) => {
        console.error('Error loading season details:', err);
        if (isMounted) setLoadingSeason(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item.id, item.media_type, currentSeason]);

  // Record history when user starts streaming
  const handleStartPlay = (epNum = currentEpisode) => {
    setIsPlaying(true);
    setCurrentEpisode(epNum);
    onRecordHistory(item, currentSeason, epNum);

    // Smooth scroll to video embed player
    const playerEl = document.getElementById('embedded-player-container');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Get active embed URL based on server choice
  const activeServerObj = SERVER_SOURCES.find((s) => s.id === selectedServer) || SERVER_SOURCES[0];
  const streamUrl = activeServerObj.getUrl(item.id, item.media_type, currentSeason, currentEpisode);

  // Content Rating Badge style
  const getCertColorClass = (cert?: string) => {
    if (!cert) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    const c = cert.toUpperCase();
    if (['G', 'TV-Y', 'TV-G'].includes(c)) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (['PG', 'TV-PG', 'TV-Y7'].includes(c)) return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    if (['PG-13', 'TV-14'].includes(c)) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40'; // R, TV-MA, NC-17
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/90 backdrop-blur-xl animate-fade-in">
      {/* Main Modal Panel */}
      <div className="relative w-full max-w-5xl bg-[#0e0e13] border border-white/15 rounded-3xl shadow-[0_0_50px_rgba(229,9,20,0.3)] overflow-hidden my-auto max-h-[92vh] flex flex-col divide-y divide-white/10">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/70 hover:bg-[#e50914] text-gray-300 hover:text-white border border-white/20 transition-all duration-300 cursor-pointer shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {/* Top Cinematic Header with Backdrop */}
          <div className="relative w-full h-64 sm:h-96 overflow-hidden">
            <img
              src={getImageUrl(details.backdrop_path || details.poster_path, 'original')}
              alt={details.title}
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-[#0e0e13]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e13] via-[#0e0e13]/80 to-transparent" />

            {/* Poster + Header Metadata */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6 z-10">
              <img
                src={getImageUrl(details.poster_path, 'w500')}
                alt={details.title}
                className="w-28 sm:w-40 aspect-[2/3] object-cover rounded-2xl border-2 border-white/20 shadow-2xl shrink-0 hidden sm:block"
              />

              <div className="space-y-3 flex-1 min-w-0">
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  {/* PG Rating Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-md border text-[11px] font-black uppercase tracking-wider ${getCertColorClass(
                      details.certification
                    )}`}
                  >
                    {details.certification || 'PG-13'}
                  </span>

                  {/* Rating Score */}
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/80 border border-amber-500/30 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {details.vote_average} / 10
                  </span>

                  <span className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white text-[10px] font-black uppercase">
                    4K Ultra HD
                  </span>

                  <span className="text-gray-300">
                    {details.release_date?.substring(0, 4) || '2024'}
                  </span>

                  {details.runtime && (
                    <span className="text-gray-400">
                      {details.runtime} mins
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                  {details.title}
                </h1>

                {details.tagline && (
                  <p className="text-xs sm:text-sm text-[#ff4b55] italic font-medium">
                    "{details.tagline}"
                  </p>
                )}

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => handleStartPlay()}
                    className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1e27] text-white font-bold text-xs sm:text-sm flex items-center gap-2 red-glow transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {isPlaying ? 'Now Playing' : 'Start Streaming'}
                  </button>

                  {trailers.length > 0 && (
                    <button
                      onClick={() => setActiveTrailerKey(trailers[0].key)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      Watch Trailer
                    </button>
                  )}

                  <button
                    onClick={() => onToggleWatchlist(details)}
                    className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                      isWatchlisted
                        ? 'bg-[#e50914]/30 border-[#e50914] text-[#ff4b55]'
                        : 'bg-black/50 border-white/20 text-white hover:border-white/50'
                    }`}
                  >
                    {isWatchlisted ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STREAMING VIDEO EMBED PLAYER SECTION */}
          <div id="embedded-player-container" className="p-4 sm:p-6 bg-[#09090d] space-y-4 border-b border-white/10">
            {/* Server Selector Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#13131a] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#e50914]" />
                <span className="text-xs font-bold text-white">Streaming Server:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {SERVER_SOURCES.map((srv) => {
                  const isSel = selectedServer === srv.id;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => setSelectedServer(srv.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSel
                          ? 'bg-[#e50914] text-white border-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                          : 'bg-[#1a1a24] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {srv.name}
                      <span className="text-[9px] opacity-80">{srv.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Player Display Container */}
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
              {isPlaying ? (
                /* NO SANDBOX ATTRIBUTE ENTIRELY */
                <iframe
                  src={streamUrl}
                  className="w-full h-full border-0"
                  allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={details.title}
                />
              ) : (
                /* Pre-play Splash Banner */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <img
                    src={getImageUrl(details.backdrop_path || details.poster_path, 'original')}
                    alt={details.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 filter blur-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />

                  <div className="relative z-10 space-y-3 max-w-md">
                    <div
                      className="w-16 h-16 rounded-full bg-[#e50914] text-white flex items-center justify-center mx-auto red-glow cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => handleStartPlay()}
                    >
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Ready to Watch {details.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      High definition stream powered by <span className="text-[#ff4b55] font-bold">{activeServerObj.name}</span>
                    </p>
                    {item.media_type !== 'movie' && (
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-amber-400 font-bold border border-amber-500/30">
                        Season {currentSeason} • Episode {currentEpisode}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEASON & EPISODE PICKER (FOR TV SHOWS AND ANIME) */}
          {item.media_type !== 'movie' && (
            <div className="p-4 sm:p-6 space-y-4 border-b border-white/10 bg-[#0c0c10]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#e50914]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Seasons & Episodes
                  </h3>
                </div>

                {/* Season Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
                  {Array.from({ length: details.number_of_seasons || 1 }).map((_, idx) => {
                    const sNum = idx + 1;
                    const isSel = currentSeason === sNum;
                    return (
                      <button
                        key={sNum}
                        onClick={() => setCurrentSeason(sNum)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#e50914] text-white'
                            : 'bg-[#181822] text-gray-400 hover:text-white border border-white/10'
                        }`}
                      >
                        Season {sNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Episodes Grid */}
              {loadingSeason ? (
                <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                  Loading Season {currentSeason} episodes...
                </div>
              ) : seasonData && seasonData.episodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                  {seasonData.episodes.map((ep) => {
                    const isSelectedEp = currentEpisode === ep.episode_number;
                    return (
                      <div
                        key={ep.id}
                        onClick={() => handleStartPlay(ep.episode_number)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 group ${
                          isSelectedEp
                            ? 'bg-[#e50914]/20 border-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                            : 'bg-[#14141c] border-white/5 hover:border-white/20 hover:bg-[#1a1a24]'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/50">
                          <img
                            src={getImageUrl(ep.still_path || details.backdrop_path, 'w300')}
                            alt={ep.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-gray-300">
                            E{ep.episode_number}
                          </span>
                        </div>

                        {/* Title & Duration */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#ff4b55] truncate">
                            {ep.episode_number}. {ep.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                            {ep.overview || 'Episode details available on playback.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-500">
                  No episode list returned for Season {currentSeason}.
                </div>
              )}
            </div>
          )}

          {/* SYNOPSIS & CAST INFO */}
          <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Storyline Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                {details.overview}
              </p>
            </div>

            {/* Cast Row */}
            {cast.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Featured Cast
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {cast.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-[#14141c] border border-white/5 shrink-0"
                    >
                      <img
                        src={getImageUrl(c.profile_path, 'w300')}
                        alt={c.name}
                        className="w-10 h-10 object-cover rounded-full border border-white/10"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white leading-tight">{c.name}</p>
                        <p className="text-[10px] text-gray-400">{c.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Titles */}
            {similarItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  More Like This
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {similarItems.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectMedia(sim)}
                      className="group cursor-pointer space-y-1"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#181822] border border-white/5 group-hover:border-[#e50914] transition-all">
                        <img
                          src={getImageUrl(sim.poster_path, 'w300')}
                          alt={sim.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-white truncate group-hover:text-[#ff4b55]">
                        {sim.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YOUTUBE TRAILER MODAL OVERLAY */}
      {activeTrailerKey && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <button
              onClick={() => setActiveTrailerKey(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/80 text-white hover:bg-[#e50914] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=1`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Official Trailer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
