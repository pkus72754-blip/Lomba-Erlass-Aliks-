import React, { useState } from 'react';
import { X, Play, Download, ExternalLink, HelpCircle, Code2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface ScratchViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sb3Url: string;
  studentName: string;
  fileName?: string;
  competitionIdea?: string;
}

export const ScratchViewerModal: React.FC<ScratchViewerModalProps> = ({
  isOpen,
  onClose,
  sb3Url,
  studentName,
  fileName,
  competitionIdea
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [playerMode, setPlayerMode] = useState<'editor' | 'player'>('player');

  if (!isOpen) return null;

  const displayFileName = fileName || `Proyek_${studentName.replace(/\s+/g, '_')}.sb3`;

  // TurboWarp embed allows direct HTML5 execution of scratch projects
  const turboWarpEmbedUrl = sb3Url.startsWith('http') 
    ? `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(sb3Url)}`
    : `https://turbowarp.org/embed.html`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#FFFDF0] border-4 border-black neo-shadow-xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#38BDF8] border-b-4 border-black p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xl neo-shadow-sm">
              🐱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-black font-['Outfit',sans-serif] truncate max-w-md">
                  Peluncur Proyek Scratch: {studentName}
                </h3>
                <span className="hidden sm:inline bg-black text-[#FFE600] text-[11px] font-black px-2 py-0.5 border border-black uppercase">
                  Scratch 3.0
                </span>
              </div>
              <p className="text-xs font-bold text-black/80 truncate">
                File: {displayFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={sb3Url}
              download={displayFileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn"
            >
              <Download className="w-4 h-4" />
              <span>Unduh .SB3</span>
            </a>
            <a
              href="https://scratch.mit.edu/projects/editor/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B97] hover:bg-pink-500 text-white font-black text-xs border-2 border-black neo-shadow-sm neo-btn"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Editor Scratch Online</span>
              <span className="sm:hidden">Scratch</span>
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white hover:bg-neutral-200 text-black border-2 border-black neo-shadow-sm flex items-center justify-center font-black neo-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions Collapsible Bar for Elementary Kids */}
        <div className="bg-[#FFF59D] border-b-3 border-black p-3 px-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-black">
              <span className="bg-black text-[#35E88E] px-2 py-0.5 border border-black text-xs">PANDUAN SISWA</span>
              <span>3 Langkah Mudah Membuka File SB3 di Scratch Resmi (Klik untuk {showInstructions ? 'tutup' : 'baca'})</span>
            </div>
            {showInstructions ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
          </button>

          {showInstructions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t-2 border-black/20 text-xs font-bold text-black">
              <div className="bg-white p-3 border-2 border-black neo-shadow-sm">
                <div className="flex items-center gap-2 font-black text-black mb-1">
                  <span className="w-5 h-5 bg-[#FF6B97] text-white flex items-center justify-center rounded-none border border-black text-xs">1</span>
                  <span>Unduh File .SB3</span>
                </div>
                <p className="text-black/80">
                  Klik tombol kuning <strong>"Unduh .SB3"</strong> di atas untuk menyimpan proyek ke komputermu.
                </p>
              </div>

              <div className="bg-white p-3 border-2 border-black neo-shadow-sm">
                <div className="flex items-center gap-2 font-black text-black mb-1">
                  <span className="w-5 h-5 bg-[#38BDF8] text-black flex items-center justify-center rounded-none border border-black text-xs">2</span>
                  <span>Buka Editor Scratch</span>
                </div>
                <p className="text-black/80">
                  Klik tombol pink <strong>"Editor Scratch Online"</strong> untuk membuka halaman Scratch resmi di tab baru.
                </p>
              </div>

              <div className="bg-white p-3 border-2 border-black neo-shadow-sm">
                <div className="flex items-center gap-2 font-black text-black mb-1">
                  <span className="w-5 h-5 bg-[#35E88E] text-black flex items-center justify-center rounded-none border border-black text-xs">3</span>
                  <span>Muat File (Load)</span>
                </div>
                <p className="text-black/80">
                  Di Scratch, klik menu <strong>File &gt; Load from your computer</strong> lalu pilih file .sb3 tadi!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Player Section */}
        <div className="flex-1 bg-neutral-900 relative flex flex-col items-center justify-center overflow-hidden">
          {sb3Url ? (
            <div className="w-full h-full relative flex flex-col bg-neutral-950">
              <iframe
                src={turboWarpEmbedUrl}
                title="Scratch Embed Player"
                allow="fullscreen; autoplay; gamepad"
                className="w-full flex-1 border-none bg-neutral-900"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FFFDF0] border-3 border-black neo-shadow max-w-md m-4">
              <div className="text-4xl mb-3">🐱</div>
              <h4 className="text-lg font-black text-black mb-1">File SB3 Belum Diunggah</h4>
              <p className="text-xs font-bold text-black/70 mb-4">
                Guru pembimbing dapat mengunggah file proyek Scratch (.sb3) melalui menu Admin.
              </p>
              <a
                href="https://scratch.mit.edu/projects/editor/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE600] text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn"
              >
                <Code2 className="w-4 h-4" />
                <span>Buka Lembar Kosong di Scratch</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-[#FFFDF0] border-t-4 border-black p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs font-black">
          <div className="flex items-center gap-2">
            <span className="bg-[#35E88E] px-2 py-0.5 border border-black text-black">INFO SCRATCH</span>
            <span className="text-black/80">Format .sb3 adalah file resmi Scratch 3.0 yang dapat dibuka langsung di aplikasi offline Scratch Desktop maupun Web!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 border-2 border-black neo-shadow-sm ml-auto"
          >
            Tutup Peluncur
          </button>
        </div>

      </div>
    </div>
  );
};
