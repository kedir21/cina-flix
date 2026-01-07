import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon } from 'lucide-react';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
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

  // Debounce query change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset when query changes
      if (query.trim()) {
        setResults([]);
        setPage(1);
        setHasMore(true);
        fetchResults(1, query); // Force fetch page 1
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle page increments for same query
  useEffect(() => {
    if (page > 1 && query.trim()) {
      fetchResults(page, query);
    }
  }, [page]);

  const fetchResults = async (pageNum: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await api.searchMulti(searchQuery, pageNum);
      if (res.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => pageNum === 1 ? res : [...prev, ...res]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Focus input on load
  useEffect(() => {
    document.getElementById('search-input')?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pl-24 pt-12 pr-12 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Search</h1>
        
        {/* Search Bar */}
        <div className="relative mb-12 max-w-2xl">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies & TV shows..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-5 pl-14 pr-6 text-xl text-white focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white transition-all focusable tv-focus"
            autoComplete="off"
          />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {results.map((item, index) => {
              const uniqueKey = `${item.id}-${item.media_type}-${index}`;
              const isLast = results.length === index + 1;
              const detailsPath = `/details/${item.media_type || 'movie'}/${item.id}`;
              
              if (isLast) {
                 return (
                  <div ref={lastElementRef} key={uniqueKey}>
                     <MovieCard movie={item} onClick={() => navigate(detailsPath)} className="w-full aspect-[2/3]" />
                  </div>
                 );
              }
              return (
                <MovieCard key={uniqueKey} movie={item} onClick={() => navigate(detailsPath)} className="w-full aspect-[2/3]" />
              );
            })}
        </div>
        
        {loading && (
           <div className="flex justify-center py-10 w-full">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
           </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-gray-500 text-2xl text-center mt-20">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;