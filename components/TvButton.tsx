import React from 'react';

interface TvButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  icon?: React.ReactNode;
  children: React.ReactNode;
  autoFocus?: boolean;
}

const TvButton: React.FC<TvButtonProps> = ({ 
  variant = 'primary', 
  icon, 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "focusable tv-focus flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg tracking-wide transition-all duration-200 border border-transparent";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 focus:bg-white focus:text-black",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 focus:bg-gray-700",
    glass: "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus:bg-white/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-6 h-6">{icon}</span>}
      {children}
    </button>
  );
};

export default TvButton;
