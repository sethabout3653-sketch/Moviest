import React from 'react';

interface GenrePillBarProps {
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

export const GenrePillBar: React.FC<GenrePillBarProps> = ({
  selectedGenreId,
  onSelectGenre
}) => {
  const genres = [
    { id: null, name: '🔥 All Genres' },
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation / Anime' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {genres.map((g) => {
          const isSelected = selectedGenreId === g.id;
          return (
            <button
              key={g.id ?? 'all'}
              onClick={() => onSelectGenre(g.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? 'bg-[#e50914] text-white border-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105'
                  : 'bg-[#14141c] text-gray-400 border-white/10 hover:text-white hover:border-white/30 hover:bg-[#181822]'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
