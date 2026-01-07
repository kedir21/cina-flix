import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Server } from 'lucide-react';
import { NavigationDirection } from '../types';

const Player: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showControls, setShowControls] = useState(true);
  const [source, setSource] = useState<'vidsrc' | 'rivestream'>('vidsrc');
  const controlsTimeout = useRef<number | null>(null);

  // Parse Query Params
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  // Auto-hide controls
  useEffect(() => {
    const resetControls = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4000);
    };

    resetControls();
    window.addEventListener('mousemove', resetControls);
    window.addEventListener('keydown', resetControls);

    return () => {
      window.removeEventListener('mousemove', resetControls);
      window.removeEventListener('keydown', resetControls);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  // Handle Back button to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === NavigationDirection.ESCAPE || e.key === NavigationDirection.BACK) {
        e.preventDefault();
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Focus the back button initially so keyboard user can exit if needed
  useEffect(() => {
    document.getElementById('player-back-btn')?.focus();
  }, []);

  if (!id) return null;

  // Construct URL based on selected source and type
  const getEmbedUrl = () => {
    if (source === 'rivestream') {
      if (type === 'tv') {
        return `https://rivestream.org/embed?type=tv&id=${id}&season=${season}&episode=${episode}&autoplay=1`;
      }
      return `https://rivestream.org/embed?type=movie&id=${id}&autoplay=1`;
    }

    // Vidsrc fallback logic
    if (type === 'tv') {
      return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=true`;
    }
    return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Iframe Layer with Sandbox for Ad Blocking */}
      <iframe
        key={`${source}-${id}-${type}-${season}-${episode}`} // Unique key to force reload
        src={getEmbedUrl()}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="origin"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        title="Content Player"
      />

      {/* Overlay UI */}
      {/* Persistent UI (Back Button & Info) */}
      <div className="absolute top-0 left-0 p-4 md:p-8 z-20 pointer-events-auto flex items-center gap-2 md:gap-4">
        <button
          id="player-back-btn"
          onClick={() => navigate(-1)}
          className="focusable tv-focus flex items-center gap-2 md:gap-3 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg bg-black/60 hover:bg-white/20 transition-all focus:ring-2 focus:ring-white focus:outline-none text-sm md:text-base"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold tracking-wide hidden md:inline">Back</span>
        </button>

        {type === 'tv' && (
          <div className="px-3 py-2 md:px-6 md:py-3 rounded-lg bg-black/80 text-white font-mono border border-white/10 text-xs md:text-base">
            S{season} : E{episode}
          </div>
        )}
      </div>

      {/* Auto-hiding Controls (Source Selector & Gradient) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-transparent to-transparent" />

        {/* Source Selector (Top Right) */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 pointer-events-auto flex gap-2">
          <button
            onClick={() => setSource('vidsrc')}
            className={`focusable tv-focus flex items-center gap-2 px-3 py-2 md:px-4 md:rounded-lg rounded transition-all text-xs md:text-sm ${source === 'vidsrc' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            <Server size={14} className="md:w-4 md:h-4" />
            <span>VidSrc</span>
          </button>
          <button
            onClick={() => setSource('rivestream')}
            className={`focusable tv-focus flex items-center gap-2 px-3 py-2 md:px-4 md:rounded-lg rounded transition-all text-xs md:text-sm ${source === 'rivestream' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            <Server size={14} className="md:w-4 md:h-4" />
            <span>RiveStream</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;