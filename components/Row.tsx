import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface RowProps {
  title: string;
  movies: Movie[];
  onMovieSelect: (id: number) => void;
}

const Row: React.FC<RowProps> = ({ title, movies, onMovieSelect }) => {
  return (
    <div className="mb-12 pl-12">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 tracking-wide pl-1">{title}</h2>
      <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={() => onMovieSelect(movie.id)} 
          />
        ))}
        {/* Spacer for end of row */}
        <div className="w-12 flex-shrink-0" />
      </div>
    </div>
  );
};

export default Row;
