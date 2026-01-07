import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { Movie } from '../types';
import Row from '../components/Row';
import TvButton from '../components/TvButton';
import { Play, Info } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trend, pop, top] = await Promise.all([
        api.getTrending(),
        api.getPopular(),
        api.getTopRated()
      ]);
      
      setTrending(trend);
      setPopular(pop);
      setTopRated(top);
      setHeroMovie(trend[0]); // Pick first trending as hero
      setWatchlist(watchlistService.getWatchlist());
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for watchlist updates
    const handleWatchlistUpdate = () => {
      setWatchlist(watchlistService.getWatchlist());
    };
    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, []);

  // Auto focus the Play button on load
  useEffect(() => {
    if (!loading && heroMovie) {
        const timer = setTimeout(() => {
            const playBtn = document.getElementById('hero-play-btn');
            if (playBtn) playBtn.focus();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [loading, heroMovie]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper for navigation
  const goToDetails = (id: number) => navigate(`/details/movie/${id}`);

  return (
    <div className="min-h-screen pb-20 pl-20 bg-slate-950">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative h-[85vh] w-full mb-8">
          {/* Backdrop */}
          <div className="absolute inset-0">
            <img 
              src={getImageUrl(heroMovie.backdrop_path)} 
              alt={heroMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-12 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
              {heroMovie.title}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl line-clamp-3 mb-8 max-w-2xl drop-shadow-md">
              {heroMovie.overview}
            </p>
            
            <div className="flex gap-4">
              <TvButton 
                id="hero-play-btn"
                variant="primary" 
                icon={<Play fill="currentColor" />}
                onClick={() => goToDetails(heroMovie.id)}
              >
                Details
              </TvButton>
              <TvButton 
                variant="glass" 
                icon={<Info />}
                onClick={() => goToDetails(heroMovie.id)}
              >
                More Info
              </TvButton>
            </div>
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="space-y-4 -mt-16 relative z-20">
        {watchlist.length > 0 && (
          <Row title="My Watchlist" movies={watchlist} onMovieSelect={(id) => {
             // Check if stored item has media_type, default to movie if not (legacy)
             const item = watchlist.find(m => m.id === id);
             const type = item?.media_type || 'movie';
             navigate(`/details/${type}/${id}`);
          }} />
        )}
        <Row title="Trending Now" movies={trending} onMovieSelect={goToDetails} />
        <Row title="Popular Movies" movies={popular} onMovieSelect={goToDetails} />
        <Row title="Top Rated" movies={topRated} onMovieSelect={goToDetails} />
      </div>
    </div>
  );
};

export default Home;