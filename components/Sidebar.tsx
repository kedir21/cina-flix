import React from 'react';
import { Home, Search, Film, Tv, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
    { icon: <Search size={24} />, label: "Search", path: "/search" },
    { icon: <Film size={24} />, label: "Movies", path: "/movies" },
    { icon: <Tv size={24} />, label: "TV Shows", path: "/tv" },
    { icon: <Heart size={24} />, label: "Watchlist", path: "/watchlist" },
  ];

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-20 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center py-10 gap-8 border-r border-white/10">
      <div className="mb-8 text-red-600">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10C2 6.68629 4.68629 4 8 4H16C19.3137 4 22 6.68629 22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10Z" />
          <path d="M7 4V2H17V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => handleNav(item.path)}
          className={`focusable tv-focus p-3 rounded-full transition-colors ${
            location.pathname === item.path 
              ? 'bg-white text-black' 
              : 'text-gray-400 hover:text-white'
          }`}
          aria-label={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;