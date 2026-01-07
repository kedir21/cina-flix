import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Movie, Genre } from '../types';
import MovieCard from '../components/MovieCard';

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Initial Genre Fetch
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const g = await api.getGenres('movie');
        setGenres([{ id: 0, name: 'All Movies' }, ...g]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchGenres();
  }, []);

  // Reset when genre changes
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre]);

  // Fetch Movies
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const newMovies = await api.discoverMovies(page, selectedGenre);
        if (newMovies.length === 0) {
          setHasMore(false);
        } else {
          setMovies(prev => [...prev, ...newMovies]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, selectedGenre]);

  return (
    <div className="min-h-screen bg-slate-950 pl-24 pt-8 pr-8 pb-12">
      <h1 className="text-4xl font-bold mb-6 text-white">Movies</h1>
      
      {/* Genre Filter */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 py-2">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`focusable tv-focus whitespace-nowrap px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedGenre === genre.id 
                ? 'bg-red-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie, index) => {
          if (movies.length === index + 1) {
            return (
              <div ref={lastElementRef} key={`${movie.id}-${index}`}>
                <MovieCard 
                  movie={movie} 
                  onClick={() => navigate(`/details/movie/${movie.id}`)} 
                  className="w-full h-full"
                />
              </div>
            );
          } else {
            return (
              <MovieCard 
                key={`${movie.id}-${index}`} 
                movie={movie} 
                onClick={() => navigate(`/details/movie/${movie.id}`)} 
                className="w-full h-full"
              />
            );
          }
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-10 w-full">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Movies;