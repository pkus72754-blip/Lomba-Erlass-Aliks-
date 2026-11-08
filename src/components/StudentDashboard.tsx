import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Code2, 
  Download, 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle, 
  Star, 
  Lightbulb, 
  Share2, 
  PlayCircle
} from 'lucide-react';
import { Student } from '../types';
import { fireStudentSuccessConfetti } from './Confetti';
import { PdfViewerModal } from './PdfViewerModal';
import { ScratchViewerModal } from './ScratchViewerModal';

interface StudentDashboardProps {
  student: Student;
  onBackToSearch: () => void;
  onOpenAdmin: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onBackToSearch,
  onOpenAdmin
}) => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti when student dashboard loads
    fireStudentSuccessConfetti();
  }, [student.id]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(
      `Halo! Saya ${student.studentName} dari SD Islam Al Ikhlas, peserta Erlass Coding Competition 2026! Ide proyek saya: ${student.competitionIdea}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const turboWarpEditorUrl = student.sb3FileUrl
    ? `https://turbowarp.org/editor?project_url=${encodeURIComponent(student.sb3FileUrl)}`
    : `https://turbowarp.org/editor`;

  const turboWarpEmbedUrl = student.sb3FileUrl
    ? `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(student.sb3FileUrl)}`
    : `https://turbowarp.org/embed.html`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToSearch}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FFE600] text-black font-black text-sm border-3 border-black neo-shadow-sm neo-btn cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cari Siswa Lain</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShare}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#A78BFA] hover:text-white text-black font-extrabold text-xs sm:text-sm border-3 border-black neo-shadow-sm neo-btn cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'Tersalin! ✅' : 'Bagikan Info Proyek'}</span>
          </button>
        </div>
      </div>

      {/* Main Greeting Neo-Brutalist Banner */}
      <div className="bg-[#FFE600] border-4 border-black neo-shadow-lg p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-2 right-4 text-7xl opacity-15 select-none pointer-events-none">
          🚀
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-black text-[#35E88E] text-xs font-black px-3 py-1 border border-black uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 fill-[#35E88E]" />
              <span>PESERTA RESMI ERLASS CODING 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight font-['Outfit',sans-serif]">
              Halo, {student.studentName}! 👋
            </h1>
            <p className="text-lg sm:text-xl font-black text-black/90 mt-1">
              Ready for Coding? Ayo wujudkan ide hebatmu menjadi karya nyata di Scratch!
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-black">
              <span className="bg-white px-3 py-1 border-2 border-black neo-shadow-sm">
                🏫 SD Islam Al Ikhlas
              </span>
              {student.grade && (
                <span className="bg-[#FF6B97] text-white px-3 py-1 border-2 border-black neo-shadow-sm">
                  📚 {student.grade}
                </span>
              )}
              {student.category && (
                <span className="bg-[#38BDF8] text-black px-3 py-1 border-2 border-black neo-shadow-sm">
                  🏷️ {student.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <a
              href={turboWarpEditorUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-[#38BDF8] hover:bg-sky-400 text-black font-black text-sm border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5 text-black" />
              <span>Buka di TurboWarp ⚡</span>
            </a>
            {student.moduleUrl && (
              <button
                onClick={() => setShowPdfModal(true)}
                className="px-5 py-3 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-sm border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-black" />
                <span>Baca Modul PDF 📖</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KARTU IDE LOMBA SISWA (Prominently Displayed Full Width) */}
      <div className="bg-[#FF6B97] border-4 border-black neo-shadow-lg flex flex-col overflow-hidden mb-8">
        {/* Card Header */}
        <div className="p-4 bg-black text-white flex items-center justify-between border-b-3 border-black">
          <div className="flex items-center gap-2 font-black text-base uppercase tracking-wider font-['Outfit',sans-serif]">
            <Lightbulb className="w-5 h-5 text-yellow-300" />
            <span>Ide Proyek Lomba Siswa</span>
          </div>
          <span className="bg-yellow-300 text-black text-xs font-black px-2.5 py-0.5 border border-black">
            ORIGINAL IDEA
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 bg-white flex flex-col justify-between border-b-3 border-black space-y-4">
          <div>
            <div className="text-xs font-black text-black/60 uppercase tracking-wider mb-2">
              Deskripsi & Rencana Proyek:
            </div>
            <p className="text-base sm:text-lg font-bold text-black leading-relaxed whitespace-pre-wrap bg-[#FFFDF0] p-5 border-3 border-black neo-shadow-sm">
              {student.competitionIdea || 'Ide proyek koding siswa sedang disempurnakan bersama guru pembimbing.'}
            </p>
          </div>

          {/* Rubric Points / Tips */}
          <div className="bg-[#FFF59D] p-4 border-2 border-black text-xs sm:text-sm font-bold text-black space-y-1.5">
            <div className="font-black text-black flex items-center gap-1.5 uppercase text-xs">
              <Star className="w-4 h-4 fill-black text-black" />
              <span>Tips Juara Penilaian Juri:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-black/90 pl-1 text-xs sm:text-sm">
              <li>Gunakan sprite karakter yang orisinal dan pesan Islami yang mendidik.</li>
              <li>Tambahkan efek suara, musik latar ceria, dan gameplay interaktif.</li>
              <li>Pastikan blok perintah tersusun rapi tanpa ada bug atau error!</li>
            </ul>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3 bg-[#FFE600] flex items-center justify-between text-xs font-black">
          <span>Status: Disetujui Guru Pembimbing SD Islam Al Ikhlas</span>
          <div className="flex items-center gap-1.5 text-black">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>Terdaftar Resmi</span>
          </div>
        </div>
      </div>

      {/* Embedded In-Page Scratch & Module Viewer Container */}
      <div className="bg-white border-4 border-black neo-shadow-lg p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b-3 border-black">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#A78BFA] text-white text-xs font-black px-3 py-1 border border-black uppercase mb-1">
              <span>🌟 EMBED VIEW</span>
            </div>
            <h3 className="text-2xl font-black text-black font-['Outfit',sans-serif]">
              Tampilan Langsung Modul & Pratinjau Scratch Siswa
            </h3>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              Modul panduan koding dan proyek Scratch (.sb3) dapat langsung dibuka menggunakan TurboWarp di bawah ini!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-3.5 py-2 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
            >
              Layar Penuh Modul 📄
            </button>
            <a
              href={turboWarpEditorUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-[#38BDF8] hover:bg-sky-400 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center gap-1.5"
            >
              <span>Layar Penuh TurboWarp ⚡</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Dual Embedded Preview Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Embed: Modul PDF Preview */}
          <div className="border-3 border-black neo-shadow-sm bg-[#FFFDF0] flex flex-col h-[520px]">
            <div className="bg-[#35E88E] border-b-3 border-black p-3 flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Pratinjau Modul: {student.studentName}</span>
              </span>
              {student.moduleUrl && (
                <a
                  href={student.moduleUrl}
                  download={student.moduleFileName || 'modul.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white px-2 py-0.5 border border-black hover:bg-[#FFE600] text-black"
                >
                  Unduh
                </a>
              )}
            </div>
            <div className="flex-1 bg-white relative overflow-hidden">
              {student.moduleUrl ? (
                <iframe
                  src={student.moduleUrl.startsWith('data:') ? student.moduleUrl : `${student.moduleUrl}#toolbar=0`}
                  title="Modul Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-4xl mb-2">📑</div>
                  <div className="font-black text-sm text-black">Modul belum dilampirkan</div>
                  <p className="text-xs text-black/60 mt-1">Guru pembimbing dapat melampirkan modul PDF dari menu Admin.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Embed: Interactive Scratch Runner / TurboWarp Player */}
          <div className="border-3 border-black neo-shadow-sm bg-[#FFFDF0] flex flex-col h-[520px]">
            <div className="bg-[#38BDF8] border-b-3 border-black p-3 flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Pratinjau Proyek Scratch (.sb3)</span>
              </span>
              <a
                href={turboWarpEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#FFE600] hover:bg-yellow-300 text-black px-2.5 py-1 border border-black neo-shadow-sm neo-btn flex items-center gap-1 font-black"
              >
                <span>Buka di TurboWarp ⚡</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex-1 bg-neutral-900 relative overflow-hidden">
              <iframe
                src={turboWarpEmbedUrl}
                title="Scratch Runner Embed"
                allow="fullscreen; autoplay; gamepad; camera; microphone"
                className="w-full h-full border-none bg-neutral-900"
              />
            </div>
            {/* Quick Actions Bar below TurboWarp Runner */}
            <div className="bg-[#FFFDF0] border-t-2 border-black p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs font-black">
              <span className="text-black/80">Proyek Scratch (.sb3) bisa langsung dibuka menggunakan TurboWarp ⚡</span>
              <div className="flex items-center gap-2">
                {student.sb3FileUrl && (
                  <a
                    href={student.sb3FileUrl}
                    download={student.sb3FileName || `Proyek_${student.studentName}.sb3`}
                    className="bg-white hover:bg-neutral-100 px-2 py-0.5 border border-black text-xs font-black"
                  >
                    ⬇️ Unduh .sb3
                  </a>
                )}
                <a
                  href={turboWarpEditorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FFE600] hover:bg-yellow-300 text-black px-2.5 py-0.5 border border-black text-xs font-black flex items-center gap-1"
                >
                  <span>Buka di TurboWarp ⚡</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        pdfUrl={student.moduleUrl}
        studentName={student.studentName}
        fileName={student.moduleFileName}
      />

      <ScratchViewerModal
        isOpen={showScratchModal}
        onClose={() => setShowScratchModal(false)}
        sb3Url={student.sb3FileUrl}
        studentName={student.studentName}
        fileName={student.sb3FileName}
        competitionIdea={student.competitionIdea}
      />

    </div>
  );
};
