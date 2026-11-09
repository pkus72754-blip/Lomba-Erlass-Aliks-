import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t-4 border-black bg-[#FFE600] py-6 px-4 text-center mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-black text-black">
        
        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span>ERLASS CODING COMPETITION 2026 • SD ISLAM AL IKHLAS</span>
        </div>

        {/* Mandatory exact footer copyright text requested by user */}
        <div className="bg-white px-4 py-1.5 border-3 border-black neo-shadow-sm font-black tracking-wide text-black text-sm">
          @copyright Pak GuruAI
        </div>

        <div className="text-xs font-bold text-black/80">
          Platform Koding Siswa Berbasis Scratch 3.0
        </div>

      </div>
    </footer>
  );
};
