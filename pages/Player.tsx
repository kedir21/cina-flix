import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Server } from 'lucide-react';
import { NavigationDirection } from '../types';
import { handleSpatialNavigation } from '../utils/spatialNavigation';

const Player: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showControls, setShowControls] = useState(true);
  const [source, setSource] = useState<'vidsrc' | 'rivestream'>('vidsrc');
  const controlsTimeout = useRef<number | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Parse Query Params
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  // Spatial Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Refresh controls visibility on any key
      resetControls();

      // Handle Back Navigation
      if (e.key === NavigationDirection.ESCAPE || e.key === NavigationDirection.BACK) {
        e.preventDefault();
        navigate(-1);
        return;
      }

      // Handle Spatial Navigation
      if (
        [NavigationDirection.UP, NavigationDirection.DOWN, NavigationDirection.LEFT, NavigationDirection.RIGHT].includes(e.key as NavigationDirection)
      ) {
        // If controls are hidden, show them and focus the back button or current generic focus
        if (!showControls) {
          setShowControls(true);
          // If we were deep in the video 'focus', try to recover focus to UI
          if (document.activeElement === iframeRef.current) {
            e.preventDefault();
            document.getElementById('player-back-btn')?.focus();
          }
          return;
        }

        // If focus is currently on the iframe, and we press UP, move to UI
        if (document.activeElement === iframeRef.current && e.key === NavigationDirection.UP) {
          e.preventDefault();
          document.getElementById('player-controls-container')?.focus();
          // Find a focusable inside controls?
          const firstBtn = document.querySelector('.focusable') as HTMLElement;
          if (firstBtn) firstBtn.focus();
          return;
        }

        // Use utility for navigation between buttons
        // Only if we aren't focused on the iframe (which eats events usually, but if we are in overlay...)
        if (document.activeElement !== iframeRef.current) {
          const result = handleSpatialNavigation(e, 'focusable');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, showControls]);

  // Auto-hide controls logic
  const resetControls = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => {
      // Only hide if focus is NOT on a UI element (optional, or just hide and let user wake it up)
      setShowControls(false);
      // When hiding, we can shift focus to iframe to ensure playback controls work?
      // But purely hiding UI is safer visually. 
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 4000);
  };

  useEffect(() => {
    resetControls();
    window.addEventListener('mousemove', resetControls);
    return () => {
      window.removeEventListener('mousemove', resetControls);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  // Initial Focus
  useEffect(() => {
    // Focus back button on mount
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

    // Vidsrc fallback logic - v3 API supports autoPlay=true
    if (type === 'tv') {
      return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=true`;
    }
    return `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=true`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden" ref={playerContainerRef}>
      {/* Iframe Layer */}
      <iframe
        ref={iframeRef}
        key={`${source}-${id}-${type}-${season}-${episode}`}
        src={getEmbedUrl()}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="origin"
        className="focusable" // Allow it to be a candidate for focus logic if needed manually
        title="Content Player"
      />

      {/* Overlay UI Layer */}
      <div
        id="player-ui-overlay"
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Gradient for visibility */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent" />

        {/* Header Controls Container */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between pointer-events-auto" id="player-controls-container">

          {/* Left: Back & Info */}
          <div className="flex items-center gap-4">
            <button
              id="player-back-btn"
              onClick={() => navigate(-1)}
              className="focusable tv-focus flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md"
              title="Back"
            >
              <ArrowLeft size={24} />
            </button>

            {type === 'tv' && (
              <div className="flex flex-col">
                <span className="text-white font-bold text-shadow-lg text-lg">S{season}:E{episode}</span>
              </div>
            )}
          </div>

          {/* Right: Server Selection (Explicit Buttons for TV) */}
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-2 mr-2 text-gray-400 text-sm font-medium px-2">
              <Server size={14} />
              <span>Source:</span>
            </div>

            <button
              onClick={() => setSource('vidsrc')}
              className={`focusable tv-focus px-4 py-2 rounded-lg text-sm font-bold transition-all ${source === 'vidsrc'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-transparent text-gray-300 hover:bg-white/10'
                }`}
            >
              VidSrc
            </button>

            <button
              onClick={() => setSource('rivestream')}
              className={`focusable tv-focus px-4 py-2 rounded-lg text-sm font-bold transition-all ${source === 'rivestream'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-transparent text-gray-300 hover:bg-white/10'
                }`}
            >
              RiveStream
            </button>
          </div>
        </div>

        {/* Center Hint (Only shows when UI is visible) */}
        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/50 text-sm font-medium">Press BACK to exit • Using {source === 'vidsrc' ? 'VidSrc' : 'RiveStream'} Server</p>
        </div>
      </div>
    </div>
  );
};

export default Player;