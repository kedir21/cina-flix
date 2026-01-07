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
      {/* Overlay UI */}
      {/* Persistent UI (Back Button & Info) */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 pointer-events-auto flex flex-col gap-4">
        <button
          id="player-back-btn"
          onClick={() => navigate(-1)}
          className="focusable tv-focus flex flex-col items-center justify-center gap-2 text-white w-16 h-16 rounded-full bg-black/60 hover:bg-white/20 transition-all focus:ring-2 focus:ring-white focus:outline-none backdrop-blur-sm"
          title="Back"
        >
          <ArrowLeft size={24} />
        </button>

        {type === 'tv' && (
          <div className="px-3 py-2 rounded-lg bg-black/80 text-white font-mono border border-white/10 text-xs text-center backdrop-blur-sm">
            S{season}<br />E{episode}
          </div>
        )}
      </div>

      {/* Auto-hiding Controls (Source Selector & Gradient) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-transparent to-transparent" />

        {/* Source Selector (Dropdown) */}
        <div className="absolute top-8 right-8 pointer-events-auto">
          <div className="relative group">
            <button
              className="focusable tv-focus flex items-center gap-2 px-6 py-3 rounded-xl bg-black/60 border border-white/10 text-white hover:bg-white/10 transition-all backdrop-blur-md"
            >
              <Server size={18} />
              <span className="font-medium">{source === 'vidsrc' ? 'VidSrc' : 'RiveStream'}</span>
            </button>

            {/* Dropdown Menu - Appears on hover/focus-within */}
            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-black/90 border border-white/10 rounded-xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all transform origin-top-right">
              <button
                onClick={() => setSource('vidsrc')}
                className={`focusable tv-focus w-full text-left px-4 py-3 text-sm transition-colors ${source === 'vidsrc' ? 'text-red-500 bg-white/5' : 'text-gray-300 hover:bg-white/10'
                  }`}
              >
                VidSrc
              </button>
              <button
                onClick={() => setSource('rivestream')}
                className={`focusable tv-focus w-full text-left px-4 py-3 text-sm transition-colors ${source === 'rivestream' ? 'text-red-500 bg-white/5' : 'text-gray-300 hover:bg-white/10'
                  }`}
              >
                RiveStream
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;