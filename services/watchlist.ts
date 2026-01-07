import { Movie } from '../types';

const WATCHLIST_KEY = 'cinestream_watchlist';

export const watchlistService = {
  getWatchlist: (): Movie[] => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse watchlist", e);
      return [];
    }
  },
  
  isInWatchlist: (id: number): boolean => {
    const list = watchlistService.getWatchlist();
    return list.some(m => m.id === id);
  },

  addToWatchlist: (movie: Movie) => {
    const list = watchlistService.getWatchlist();
    if (!list.some(m => m.id === movie.id)) {
      // Store minimal data to save space, or full movie object
      list.push(movie);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
      // Dispatch custom event for reactivity across components
      window.dispatchEvent(new Event('watchlist-updated'));
    }
  },

  removeFromWatchlist: (id: number) => {
    let list = watchlistService.getWatchlist();
    list = list.filter(m => m.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('watchlist-updated'));
  },

  toggleWatchlist: (movie: Movie) => {
    if (watchlistService.isInWatchlist(movie.id)) {
      watchlistService.removeFromWatchlist(movie.id);
    } else {
      watchlistService.addToWatchlist(movie);
    }
  }
};
