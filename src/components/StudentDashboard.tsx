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
  PlayCircle,
  FileText
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToSearch}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FFE600] text-black font-black text-sm border-3 border-black neo-shadow-sm neo-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cari Siswa Lain</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShare}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#A78BFA] hover:text-white text-black font-extrabold text-xs sm:text-sm border-3 border-black neo-shadow-sm neo-btn"
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
            <button
              onClick={() => setShowScratchModal(true)}
              className="px-5 py-3 bg-[#38BDF8] hover:bg-sky-400 text-black font-black text-sm border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5 text-black" />
              <span>Buka Scratch Editor 🐱</span>
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-5 py-3 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-sm border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-black" />
              <span>Baca Modul PDF 📖</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Neo-Brutalism Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CARD 1: KARTU IDE LOMBA SISWA */}
        <div className="bg-[#FF6B97] border-4 border-black neo-shadow-lg flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="p-4 bg-black text-white flex items-center justify-between border-b-3 border-black">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider font-['Outfit',sans-serif]">
              <Lightbulb className="w-5 h-5 text-yellow-300" />
              <span>Ide Proyek Lomba</span>
            </div>
            <span className="bg-yellow-300 text-black text-xs font-black px-2 py-0.5">
              ORIGINAL IDEA
            </span>
          </div>

          {/* Card Body */}
          <div className="p-6 bg-white flex-1 flex flex-col justify-between border-b-3 border-black">
            <div>
              <div className="text-xs font-black text-black/60 uppercase tracking-wider mb-2">
                Deskripsi & Rencana Proyek:
              </div>
              <p className="text-base font-bold text-black leading-relaxed whitespace-pre-wrap bg-[#FFFDF0] p-4 border-2 border-black neo-shadow-sm mb-4">
                {student.competitionIdea || 'Ide proyek koding siswa sedang disempurnakan bersama guru pembimbing.'}
              </p>
            </div>

            {/* Rubric Points / Tips */}
            <div className="bg-[#FFF59D] p-3 border-2 border-black text-xs font-bold text-black space-y-1.5">
              <div className="font-black text-black flex items-center gap-1.5 uppercase">
                <Star className="w-3.5 h-3.5 fill-black" />
                <span>Tips Juara Penilaian Juri:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-black/90 pl-1">
                <li>Gunakan sprite karakter yang orisinal dan kreatif.</li>
                <li>Tambahkan efek suara dan musik islami ceria.</li>
                <li>Pastikan blok perintah tersusun rapi tanpa bug!</li>
              </ul>
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-3 bg-[#FFE600] flex items-center justify-between text-xs font-black">
            <span>Status: Disetujui Guru Pembimbing</span>
            <CheckCircle className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* CARD 2: TOMBOL / EMBED MODUL PEMBELAJARAN (PDF) */}
        <div className="bg-[#35E88E] border-4 border-black neo-shadow-lg flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="p-4 bg-black text-white flex items-center justify-between border-b-3 border-black">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider font-['Outfit',sans-serif]">
              <BookOpen className="w-5 h-5 text-[#35E88E]" />
              <span>Modul Pembelajaran</span>
            </div>
            <span className="bg-[#35E88E] text-black text-xs font-black px-2 py-0.5">
              FORMAT PDF
            </span>
          </div>

          {/* Card Body */}
          <div className="p-6 bg-white flex-1 flex flex-col justify-between border-b-3 border-black">
            <div>
              <div className="w-16 h-16 bg-[#35E88E] border-3 border-black neo-shadow-sm flex items-center justify-center text-3xl mb-4">
                📄
              </div>
              <h3 className="text-xl font-black text-black mb-2">
                Panduan Koding & Modul Lomba
              </h3>
              <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed mb-4">
                Berisi tutorial tahapan pembuatan logika Scratch, referensi algoritma, variabel, percabangan, dan tips presentasi.
              </p>
              
              <div className="p-3 bg-[#FFFDF0] border-2 border-black text-xs font-bold text-black truncate mb-4">
                <span className="text-black/60 font-black">Berkas: </span>
                <span className="font-extrabold">{student.moduleFileName || 'Modul_Erlass_Coding_2026.pdf'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => setShowPdfModal(true)}
                className="w-full py-3.5 px-4 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-sm sm:text-base border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5" />
                <span>Buka Modul Pembelajaran (PDF)</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={student.moduleUrl || '#'}
                  download={student.moduleFileName || `Modul_${student.studentName}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 text-black font-bold text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </a>
                <a
                  href={student.moduleUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-[#FFE600] hover:bg-yellow-300 text-black font-bold text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Tab Baru</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-3 bg-[#35E88E] flex items-center justify-between text-xs font-black text-black">
            <span>Dapat dibuka di Komputer & Tablet</span>
            <span>PDF Viewer Siap ✅</span>
          </div>
        </div>

        {/* CARD 3: TOMBOL PELUNCUR SCRATCH & PROYEK SB3 */}
        <div className="bg-[#38BDF8] border-4 border-black neo-shadow-lg flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="p-4 bg-black text-white flex items-center justify-between border-b-3 border-black">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider font-['Outfit',sans-serif]">
              <Code2 className="w-5 h-5 text-[#38BDF8]" />
              <span>Proyek Scratch (.sb3)</span>
            </div>
            <span className="bg-[#FFE600] text-black text-xs font-black px-2 py-0.5">
              SCRATCH 3.0
            </span>
          </div>

          {/* Card Body */}
          <div className="p-6 bg-white flex-1 flex flex-col justify-between border-b-3 border-black">
            <div>
              <div className="w-16 h-16 bg-[#38BDF8] border-3 border-black neo-shadow-sm flex items-center justify-center text-3xl mb-4">
                🐱
              </div>
              <h3 className="text-xl font-black text-black mb-2">
                File Proyek & Starter Scratch
              </h3>
              <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed mb-4">
                Buka file proyek <span className="bg-[#FFE600] px-1 border border-black font-black">.sb3</span> langsung di Scratch Player online atau unduh untuk dilanjutkan di Scratch Editor.
              </p>

              <div className="p-3 bg-[#FFFDF0] border-2 border-black text-xs font-bold text-black truncate mb-4">
                <span className="text-black/60 font-black">Berkas: </span>
                <span className="font-extrabold">{student.sb3FileName || 'Proyek_Scratch_Peserta.sb3'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => setShowScratchModal(true)}
                className="w-full py-3.5 px-4 bg-[#FFE600] hover:bg-yellow-300 text-black font-black text-sm sm:text-base border-3 border-black neo-shadow neo-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Buka & Mainkan File SB3 di Scratch 🚀</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={student.sb3FileUrl || '#'}
                  download={student.sb3FileName || `Proyek_${student.studentName}.sb3`}
                  className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 text-black font-bold text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File .SB3</span>
                </a>
                <a
                  href="https://scratch.mit.edu/projects/editor/"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-[#FF6B97] hover:bg-pink-500 text-white font-bold text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Scratch Web</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-3 bg-[#38BDF8] flex items-center justify-between text-xs font-black text-black">
            <span>Kompatibel Scratch Desktop & Online</span>
            <span>TurboWarp Player Ready ⚡</span>
          </div>
        </div>

      </div>

      {/* Embedded In-Page Scratch & Module Viewer Container (The user specifically emphasized embed in the page!) */}
      <div className="bg-white border-4 border-black neo-shadow-lg p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b-3 border-black">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#A78BFA] text-white text-xs font-black px-3 py-1 border border-black uppercase mb-1">
              <span>🌟 EMBED VIEW</span>
            </div>
            <h3 className="text-2xl font-black text-black font-['Outfit',sans-serif]">
              Tampilan Langsung Modul & Scratch Editor Siswa
            </h3>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              Siswa dapat membaca modul panduan dan memuat Scratch secara instan di bawah ini!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-3.5 py-2 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn"
            >
              Layar Penuh Modul 📄
            </button>
            <button
              onClick={() => setShowScratchModal(true)}
              className="px-3.5 py-2 bg-[#38BDF8] hover:bg-sky-400 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn"
            >
              Layar Penuh Scratch 🐱
            </button>
          </div>
        </div>

        {/* Dual Embedded Preview Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Embed: Modul PDF Preview */}
          <div className="border-3 border-black neo-shadow-sm bg-[#FFFDF0] flex flex-col h-[480px]">
            <div className="bg-[#35E88E] border-b-3 border-black p-3 flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Pratinjau Modul: {student.studentName}</span>
              </span>
              <a
                href={student.moduleUrl}
                download={student.moduleFileName || 'modul.pdf'}
                target="_blank"
                rel="noreferrer"
                className="bg-white px-2 py-0.5 border border-black hover:bg-[#FFE600]"
              >
                Unduh
              </a>
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
                  <div className="font-black text-sm">Modul belum dilampirkan</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Embed: Interactive Scratch Runner / TurboWarp Player */}
          <div className="border-3 border-black neo-shadow-sm bg-[#FFFDF0] flex flex-col h-[480px]">
            <div className="bg-[#38BDF8] border-b-3 border-black p-3 flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Pratinjau Proyek Scratch (.sb3)</span>
              </span>
              <a
                href="https://scratch.mit.edu/projects/editor/"
                target="_blank"
                rel="noreferrer"
                className="bg-[#FFE600] px-2 py-0.5 border border-black hover:bg-yellow-300"
              >
                Editor Scratch 🚀
              </a>
            </div>
            <div className="flex-1 bg-neutral-900 relative overflow-hidden">
              <iframe
                src={
                  student.sb3FileUrl?.startsWith('http')
                    ? `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(student.sb3FileUrl)}`
                    : `https://turbowarp.org/embed.html`
                }
                title="Scratch Runner Embed"
                allow="fullscreen; autoplay; gamepad"
                className="w-full h-full border-none"
              />
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
