import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistService } from '../services/watchlist';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart } from 'lucide-react';

const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);

  useEffect(() => {
    const loadWatchlist = () => {
      // Cast to ContentItem[] as the service currently returns Movie[] but we are storing both types in practice
      setWatchlist(watchlistService.getWatchlist() as unknown as ContentItem[]);
    };

    loadWatchlist();

    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pl-24 pt-8 pr-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-white">My Watchlist</h1>
        <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
          {watchlist.length}
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
          <Heart size={64} className="mb-6 opacity-20" />
          <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
          <p>Movies and TV shows you add to your watchlist will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {watchlist.map((item, index) => {
             // Handle legacy items that might not have media_type set
             const type = item.media_type || 'movie';
             return (
              <MovieCard 
                key={`${item.id}-${index}`} 
                movie={{...item, media_type: type}} 
                onClick={() => navigate(`/details/${type}/${item.id}`)} 
                className="w-full h-full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;