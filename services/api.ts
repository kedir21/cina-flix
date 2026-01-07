import { Movie, TvShow, MovieDetails, TvDetails, Genre, ContentItem, SeasonDetails } from '../types';

const API_KEY: string = '5e6a638a16f35974c254b7e6da34619d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getImageUrl = (path: string | null | undefined) => 
  path ? `${IMAGE_BASE_URL}${path}` : 'https://picsum.photos/1920/1080';

export const getPosterUrl = (path: string | null | undefined) => 
  path ? `${POSTER_BASE_URL}${path}` : 'https://picsum.photos/500/750';

export const getStillUrl = (path: string | null | undefined) => 
  path ? `${IMAGE_BASE_URL}${path}` : 'https://picsum.photos/300/169';

interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> => {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }
  
  return response.json();
};

export const api = {
  getTrending: async (): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/trending/movie/week');
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },
  
  getPopular: async (): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/popular');
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },
  
  getTopRated: async (): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/top_rated');
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },

  // Details
  getDetails: async (id: string, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails | TvDetails> => {
    const endpoint = `/${type}/${id}`;
    return await fetchFromTMDB<MovieDetails | TvDetails>(endpoint, { append_to_response: 'videos,credits' });
  },
  
  // Season Details (Episodes)
  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<SeasonDetails> => {
    return await fetchFromTMDB<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
  },

  // Genres
  getGenres: async (type: 'movie' | 'tv'): Promise<Genre[]> => {
    const res = await fetchFromTMDB<{ genres: Genre[] }>(`/genre/${type}/list`);
    return res.genres;
  },

  // Discovery (Infinite Scroll)
  discoverMovies: async (page: number, genreId?: number): Promise<Movie[]> => {
    const params: Record<string, string | number> = { page, sort_by: 'popularity.desc' };
    if (genreId && genreId !== 0) params.with_genres = genreId;
    
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/discover/movie', params);
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },

  discoverTvShows: async (page: number, genreId?: number): Promise<TvShow[]> => {
    const params: Record<string, string | number> = { page, sort_by: 'popularity.desc' };
    if (genreId && genreId !== 0) params.with_genres = genreId;
    
    const res = await fetchFromTMDB<PaginatedResponse<TvShow>>('/discover/tv', params);
    return res.results.map(s => ({ ...s, media_type: 'tv' }));
  },

  // Search (Infinite Scroll)
  searchMulti: async (query: string, page: number = 1): Promise<ContentItem[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<ContentItem>>('/search/multi', { query, page });
    // Filter out people, only keep movie and tv
    return res.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  },

  // Fallback old search method if needed
  search: async (query: string): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/search/movie', { query });
    return res.results;
  }
};