import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BackButton from './components/BackButton';
import Home from './pages/Home';
import Details from './pages/Details';
import Player from './pages/Player';
import Search from './pages/Search';
import Movies from './pages/Movies';
import TvShows from './pages/TvShows';
import Watchlist from './pages/Watchlist';
import { handleSpatialNavigation } from './utils/spatialNavigation';

// Component to handle global keydown events for navigation
const TvNavigationController: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pass the event to our spatial navigation utility
      handleSpatialNavigation(e, 'focusable');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname]); // Re-bind on route change if necessary

  return null;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Strictly check for /watch/ to avoid hiding sidebar on /watchlist
  const isPlayer = location.pathname.startsWith('/watch/');

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white overflow-hidden font-sans antialiased selection:bg-red-500 selection:text-white">
      <TvNavigationController />
      {!isPlayer && <Sidebar />}
      <BackButton />
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TvShows />} />
          <Route path="/watchlist" element={<Watchlist />} />
          {/* Support legacy /movie/:id route if needed, or redirect */}
          <Route path="/movie/:id" element={<Details />} /> 
          {/* New Unified Details Route */}
          <Route path="/details/:type/:id" element={<Details />} />
          
          <Route path="/watch/:id" element={<Player />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};

export default App;