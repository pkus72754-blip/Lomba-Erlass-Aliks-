import React from 'react';
import { Trophy, Code2, Sparkles, BookOpen, Rocket, Star } from 'lucide-react';

interface HeroSectionProps {
  totalStudents: number;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ totalStudents, onExploreClick }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b-4 border-black bg-[#FFFDF0]">
      {/* Decorative Neo-Brutalist Floating Badges */}
      <div className="absolute top-4 right-8 hidden lg:block rotate-3">
        <div className="bg-[#FF6B97] text-white font-extrabold text-sm px-4 py-2 border-3 border-black neo-shadow uppercase tracking-wider flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-yellow-300 text-black" />
          <span>SD ISLAM AL IKHLAS</span>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 hidden lg:block -rotate-3">
        <div className="bg-[#35E88E] text-black font-extrabold text-sm px-4 py-2 border-3 border-black neo-shadow uppercase tracking-wider flex items-center gap-1.5">
          <Code2 className="w-4 h-4" />
          <span>SCRATCH 3.0 COMPETITION</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Top Kicker Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FFE600] px-4 py-1.5 border-3 border-black neo-shadow mb-6 rotate-[-1deg]">
          <Trophy className="w-5 h-5 text-black" />
          <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-black font-['Outfit',sans-serif]">
            Ajang Prestasi & Kreativitas Digital Siswa SD
          </span>
        </div>

        {/* Main Massive Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-black tracking-tight leading-[1.1] mb-6 font-['Outfit',sans-serif]">
          <span className="inline-block bg-white px-3 py-1 border-3 border-black neo-shadow mb-2 sm:mb-3">
            ERLASS CODING
          </span>
          <br />
          <span className="inline-block bg-[#38BDF8] text-black px-4 py-1 border-3 border-black neo-shadow rotate-1 mt-1">
            COMPETITION 2026
          </span>
        </h1>

        {/* Subtitle / School Label */}
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-base sm:text-xl font-bold text-black bg-[#FFF59D] border-3 border-black neo-shadow-sm p-4 leading-relaxed">
            Selamat datang, para calon programmer cilik <span className="font-black underline decoration-4 decoration-[#FF6B97]">SD Islam Al Ikhlas</span>! Ide lomba kamu, referensi modul koding dari ide kamu, dan referensi proyek <span className="font-black bg-white px-1 border border-black">.sb3</span> Scratch kamu di sini yah...
          </p>
        </div>

        {/* Stat Badges / Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-black">
          <div className="flex items-center gap-2 bg-white px-4 py-2 border-3 border-black neo-shadow-sm">
            <span className="text-lg">👥</span>
            <span>{totalStudents} Peserta Terdaftar</span>
          </div>
          <div className="flex items-center gap-2 bg-[#A78BFA] text-white px-4 py-2 border-3 border-black neo-shadow-sm">
            <Rocket className="w-4 h-4 text-black" />
            <span className="text-black">100% Siap Berkompetisi</span>
          </div>
          <div className="flex items-center gap-2 bg-[#35E88E] text-black px-4 py-2 border-3 border-black neo-shadow-sm">
            <BookOpen className="w-4 h-4" />
            <span>Modul & File SB3 Lengkap</span>
          </div>
        </div>

      </div>
    </section>
  );
};
