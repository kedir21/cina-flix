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
        return `https://rivestream.org/embed?type=tv&id=${id}&season=${season}&episode=${episode}`;
      }
      return `https://rivestream.org/embed?type=movie&id=${id}`;
    }
    
    // Vidsrc fallback logic
    if (type === 'tv') {
        return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    }
    return `https://vidsrc.cc/v2/embed/movie/${id}`;
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
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-b from-black/80 via-transparent to-transparent h-40 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="p-8 pointer-events-auto flex items-start justify-between">
          <div className="flex gap-4">
              <button 
                id="player-back-btn"
                onClick={() => navigate(-1)}
                className="focusable tv-focus flex items-center gap-3 text-white px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all focus:ring-2 focus:ring-white focus:outline-none"
              >
                <ArrowLeft />
                <span className="font-semibold tracking-wide">Back</span>
              </button>
              
              {type === 'tv' && (
                  <div className="px-6 py-3 rounded-lg bg-black/50 text-white font-mono backdrop-blur-md border border-white/10">
                    S{season} : E{episode}
                  </div>
              )}
          </div>

          {/* Source Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSource('vidsrc')}
              className={`focusable tv-focus flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${source === 'vidsrc' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
              <Server size={16} />
              <span>VidSrc</span>
            </button>
            <button
              onClick={() => setSource('rivestream')}
              className={`focusable tv-focus flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${source === 'rivestream' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
              <Server size={16} />
              <span>RiveStream</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;