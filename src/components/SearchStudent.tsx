import React, { useState, useMemo } from 'react';
import { Search, Sparkles, User, AlertCircle, ArrowRight } from 'lucide-react';
import { Student } from '../types';

interface SearchStudentProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  isLoading: boolean;
  isFirebaseLive?: boolean;
}

export const SearchStudent: React.FC<SearchStudentProps> = ({
  students,
  onSelectStudent,
  isLoading,
  isFirebaseLive = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Suggestions filtered case-insensitively
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return students.filter(s => 
      s.studentName.toLowerCase().includes(term) ||
      (s.grade && s.grade.toLowerCase().includes(term)) ||
      (s.category && s.category.toLowerCase().includes(term))
    ).slice(0, 10);
  }, [students, searchTerm]);

  // Sorted students alphabetically for neat browsing
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => 
      a.studentName.localeCompare(b.studentName, 'id', { sensitivity: 'base' })
    );
  }, [students]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanTerm = searchTerm.trim().toLowerCase();
    if (!cleanTerm) {
      setErrorMessage('Silakan ketik nama lengkap atau panggilanmu terlebih dahulu! 😊');
      return;
    }

    // Exact or substring match (case-insensitive)
    const found = students.find(s => 
      s.studentName.toLowerCase().trim() === cleanTerm ||
      s.studentName.toLowerCase().includes(cleanTerm)
    );

    if (found) {
      onSelectStudent(found);
    } else {
      setErrorMessage(
        `Nama "${searchTerm}" belum ditemukan di daftar lomba. Periksa ejaan nama atau hubungi Guru Pembimbing di sekolah ya!`
      );
    }
  };

  const handleQuickPick = (student: Student) => {
    setSearchTerm(student.studentName);
    setErrorMessage('');
    onSelectStudent(student);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      
      {/* Main Search Neo-Brutalist Box */}
      <div className="bg-[#FFE600] border-4 border-black neo-shadow-lg p-6 sm:p-8 relative">
        
        {/* Floating Tag */}
        <div className="absolute -top-4 left-6 bg-black text-white text-xs sm:text-sm font-black px-3 py-1 uppercase tracking-wider flex items-center gap-1.5 neo-shadow-sm">
          <User className="w-3.5 h-3.5 text-[#35E88E]" />
          <span>Langkah 1: Masukkan Nama Siswa</span>
        </div>

        <div className="text-center mb-6 pt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-['Outfit',sans-serif]">
            CARI NAMA PESERTA LOMBA 🎯
          </h2>
          <p className="text-sm sm:text-base font-bold text-black/90 mt-1">
            Ketik nama panggilan atau nama lengkapmu untuk membuka dashboard ide & modul koding!
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-black/60 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                onFocus={() => setIsFocused(true)}
                placeholder="Contoh: Ahmad Fauzan, Naura, Rayyan..."
                className="w-full pl-12 pr-4 py-4 text-base sm:text-lg font-bold bg-white text-black border-3 border-black neo-shadow-sm placeholder:text-black/40 focus:outline-none focus:ring-4 focus:ring-black"
              />
            </div>

            {/* Dropdown Suggestions */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white border-3 border-black neo-shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 bg-black text-white text-xs font-black uppercase tracking-wider">
                  Hasil yang cocok ({suggestions.length} siswa):
                </div>
                {suggestions.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onMouseDown={() => handleQuickPick(student)}
                    className="w-full text-left px-4 py-3 hover:bg-[#FFF59D] border-b-2 border-black last:border-b-0 flex items-center justify-between font-bold text-sm transition-colors"
                  >
                    <div>
                      <div className="text-black font-extrabold">{student.studentName}</div>
                      <div className="text-xs text-black/70">{student.grade || 'Peserta Lomba'} • {student.category || 'Scratch Project'}</div>
                    </div>
                    <span className="text-xs font-black bg-[#35E88E] text-black px-2 py-0.5 border border-black">
                      Buka 🚀
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#FF6B97] hover:bg-[#FF5084] text-white font-black text-lg sm:text-xl border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 fill-yellow-300 text-black" />
            <span>Mulai Proyek Lomba! 🚀</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-[#FF4D4D] text-white border-3 border-black neo-shadow-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-300" />
            <div className="text-sm font-bold leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Registered Students Helper or Clean Empty Note */}
        <div className="mt-6 pt-5 border-t-2 border-black/20">
          {students.length > 0 ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35E88E] border border-black animate-pulse"></span>
                  <span>👥 PESERTA TERDAFTAR ({students.length} SISWA):</span>
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 border border-black uppercase tracking-wider ${
                    isFirebaseLive ? 'bg-black text-[#35E88E]' : 'bg-[#FFF59D] text-black'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFirebaseLive ? 'bg-[#35E88E] animate-pulse' : 'bg-amber-500'
                    }`}
                  ></span>
                  <span>{isFirebaseLive ? 'SINKRONISASI REALTIME' : 'MENYAMBUNG FIREBASE...'}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
                {sortedStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleQuickPick(st)}
                    className="px-3 py-1.5 bg-white hover:bg-[#35E88E] text-black font-extrabold text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center gap-1.5 cursor-pointer transition-transform"
                    title={`Klik untuk membuka proyek koding ${st.studentName}`}
                  >
                    <span>👤</span>
                    <span>{st.studentName}</span>
                    {st.grade && <span className="text-[10px] bg-black/10 px-1 font-bold">{st.grade}</span>}
                    {st.sb3FileUrl && <span className="text-[11px]" title="File Scratch (.sb3) tersedia">🐱</span>}
                    {st.moduleUrl && <span className="text-[11px]" title="Modul PDF tersedia">📄</span>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-xs font-bold text-black/70">
              <span>Database peserta lomba siap terhubung ke Firebase. Guru/Admin dapat memasukkan data siswa melalui tombol <strong>Akses Guru / Admin</strong> di atas.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
