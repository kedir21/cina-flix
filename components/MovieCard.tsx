import React, { useState, useEffect } from 'react';
import { ContentItem } from '../types';
import { getPosterUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { Star, Heart, Check, Tv } from 'lucide-react';

interface MovieCardProps {
  movie: ContentItem;
  onClick: () => void;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, className = '' }) => {
  const [inWatchlist, setInWatchlist] = useState(false);

  // Normalize title/name
  const title = 'title' in movie ? movie.title : (movie as any).name;
  const date = 'release_date' in movie ? movie.release_date : (movie as any).first_air_date;

  useEffect(() => {
    const checkStatus = () => setInWatchlist(watchlistService.isInWatchlist(movie.id));
    
    checkStatus();
    window.addEventListener('watchlist-updated', checkStatus);
    return () => window.removeEventListener('watchlist-updated', checkStatus);
  }, [movie.id]);

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    watchlistService.toggleWatchlist(movie);
  };

  return (
    <div 
      className={`focusable tv-focus relative flex-shrink-0 w-48 md:w-56 aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group bg-gray-800 border-2 border-transparent focus:border-white focus:z-20 ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
    >
      <img 
        src={getPosterUrl(movie.poster_path)} 
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
      />
      
      {/* Type Badge */}
      {movie.media_type === 'tv' && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
          TV
        </div>
      )}

      {/* Watchlist Indicator */}
      <button
        onClick={handleToggleWatchlist}
        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 
          ${inWatchlist 
            ? 'bg-red-600/80 text-white opacity-100' 
            : 'bg-black/40 text-white opacity-0 group-focus:opacity-100 group-hover:opacity-100 hover:bg-red-600'
          }`}
        title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        {inWatchlist ? <Check size={16} /> : <Heart size={16} />}
      </button>

      {/* Overlay info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-focus:opacity-100 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
        <h3 className="text-white font-bold text-sm line-clamp-2">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-yellow-400 text-xs">
            <Star size={12} fill="currentColor" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <span className="text-xs text-gray-400">{date ? date.split('-')[0] : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;