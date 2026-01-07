import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on Player as it has its own controls and immersive mode.
  // We strictly check for '/watch/' to avoid matching '/watchlist'.
  if (location.pathname.startsWith('/watch/')) {
    return null;
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-6 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-200 focusable tv-focus shadow-lg group"
      aria-label="Go Back"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
      <span className="font-medium text-sm hidden md:inline">Back</span>
    </button>
  );
};

export default BackButton;