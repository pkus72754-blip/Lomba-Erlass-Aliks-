import React from 'react';
import { Lock, Sparkles, BookOpen, Laptop, Code2 } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAdmin: () => void;
  isFirebaseLive: boolean;
  onResetSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isFirebaseLive, onResetSearch }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFE600] border-b-4 border-black shadow-[0_4px_0_#000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Lockup */}
        <button 
          onClick={onResetSearch}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-4 focus-visible:ring-black cursor-pointer"
        >
          <Logo size="md" showCodeBadge={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl sm:text-2xl text-black tracking-tight font-['Outfit',sans-serif]">
                ERLASS CODING 2026
              </span>
              <span className="hidden sm:inline-block bg-[#FF6B97] text-white text-xs font-bold px-2 py-0.5 border-2 border-black neo-shadow-sm uppercase">
                SD Islam Al Ikhlas
              </span>
            </div>
            <p className="text-xs font-bold text-black/80 flex items-center gap-1.5">
              <span>Portal Proyek & Modul Lomba Siswa</span>
              <span className="text-black">•</span>
              <span className="hidden md:inline">Scratch Programming</span>
            </p>
          </div>
        </button>

        {/* Quick Nav & Admin CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Indicator */}
          <div 
            title={isFirebaseLive ? 'Firebase Firestore Realtime Aktif (eskul-coding-aliks)' : 'Mode Penyimpanan Lokal'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border-2 border-black neo-shadow-sm ${
              isFirebaseLive ? 'bg-[#35E88E] text-black' : 'bg-white text-black'
            }`}
          >
            <span className={`w-2 h-2 rounded-full border border-black ${isFirebaseLive ? 'bg-black animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isFirebaseLive ? 'Realtime Firestore' : 'Lokal / Offline'}</span>
          </div>

          {/* Admin Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-[#FF6B97] hover:text-white text-black font-extrabold text-sm border-3 border-black neo-shadow-sm neo-btn active:translate-x-0.5 active:translate-y-0.5"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Akses Guru / Admin</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
};
