import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCodeBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showCodeBadge = false 
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Neo-Brutalist Frame for Logo */}
      <div className={`${sizeClasses[size]} bg-white border-3 border-black neo-shadow-sm overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105`}>
        <img 
          src="/coding-logo.png" 
          alt="Erlass Coding Logo - Scratch Programming" 
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Floating Code Bracket Badge */}
      {showCodeBadge && (
        <span className="absolute -bottom-1 -right-1 bg-[#35E88E] text-black text-[10px] font-black px-1 border-2 border-black neo-shadow-sm leading-none py-0.5">
          &lt;/&gt;
        </span>
      )}
    </div>
  );
};
