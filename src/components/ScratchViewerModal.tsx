import React, { useState } from 'react';
import { X, Play, Download, ExternalLink, HelpCircle, Code2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { parseScratchUrl, downloadSb3File } from '../services/fileHelpers';
import { Logo } from './Logo';

interface ScratchViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sb3Url: string;
  studentName: string;
  studentId?: string;
  fileName?: string;
  competitionIdea?: string;
}

export const ScratchViewerModal: React.FC<ScratchViewerModalProps> = ({
  isOpen,
  onClose,
  sb3Url,
  studentName,
  studentId,
  fileName,
  competitionIdea
}) => {
  const [showInstructions, setShowInstructions] = useState(true);

  if (!isOpen) return null;

  const displayFileName = fileName || `Proyek_${studentName.replace(/\s+/g, '_')}.sb3`;
  const sb3Info = parseScratchUrl(sb3Url, {
    studentId,
    fileName: displayFileName,
    studentName
  });
  const effectiveDownloadUrl = sb3Info.downloadUrl || sb3Url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#FFFDF0] border-4 border-black neo-shadow-xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#38BDF8] border-b-4 border-black p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showCodeBadge={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-black font-['Outfit',sans-serif] truncate max-w-md">
                  Peluncur Proyek Scratch: {studentName}
                </h3>
                <span className="hidden sm:inline bg-black text-[#FFE600] text-[11px] font-black px-2 py-0.5 border border-black uppercase">
                  TurboWarp 3.0
                </span>
              </div>
              <p className="text-xs font-bold text-black/80 truncate">
                File: {displayFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {effectiveDownloadUrl && (
              <button
                type="button"
                onClick={() => downloadSb3File(effectiveDownloadUrl, displayFileName, studentId)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh .SB3 Resmi</span>
              </button>
            )}
            <a
              href={sb3Info.fullPageUrl || sb3Info.editorUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Halaman Utuh TurboWarp ⚡</span>
            </a>
            <a
              href={sb3Info.editorUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Editor Blok</span>
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white hover:bg-neutral-200 text-black border-2 border-black neo-shadow-sm flex items-center justify-center font-black neo-btn cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions Collapsible Bar for Elementary Kids */}
        <div className="bg-[#FFF59D] border-b-3 border-black p-3 px-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-black">
              <span className="bg-black text-[#35E88E] px-2 py-0.5 border border-black text-xs">PANDUAN SISWA</span>
              <span>3 Langkah Mudah Membuka File SB3 di TurboWarp / Scratch (Klik untuk {showInstructions ? 'tutup' : 'baca'})</span>
            </div>
            {showInstructions ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
          </button>

          {showInstructions && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t-2 border-black/20 text-xs font-bold text-black">
                <div className="bg-white p-3 border-2 border-black neo-shadow-sm">
                  <div className="flex items-center gap-2 font-black text-black mb-1">
                    <span className="w-5 h-5 bg-[#FF6B97] text-white flex items-center justify-center rounded-none border border-black text-xs">1</span>
                    <span>Unduh File .SB3</span>
                  </div>
                  <p className="text-black/80">
                    Klik tombol <strong>"Unduh .SB3"</strong> di atas untuk menyimpan file koding ke komputermu.
                  </p>
                </div>

                <div className="bg-white p-3 border-2 border-black neo-shadow-sm">
                  <div className="flex items-center gap-2 font-black text-black mb-1">
                    <span className="w-5 h-5 bg-[#38BDF8] text-black flex items-center justify-center rounded-none border border-black text-xs">2</span>
                    <span>Buka TurboWarp / Scratch</span>
                  </div>
                  <p className="text-black/80">
                    Klik tombol <strong>"Buka di TurboWarp ⚡"</strong> untuk membuka editor koding di tab baru.
                  </p>
                </div>

                <div className="bg-white p-3 border-2 border-black neo-shadow-sm">
                  <div className="flex items-center gap-2 font-black text-black mb-1">
                    <span className="w-5 h-5 bg-[#35E88E] text-black flex items-center justify-center rounded-none border border-black text-xs">3</span>
                    <span>Muat File (Load)</span>
                  </div>
                  <p className="text-black/80">
                    Di editor, klik menu <strong>File &gt; Muat dari komputermu</strong> atau cukup seret (drag & drop) file .sb3 ke layar!
                  </p>
                </div>
              </div>

              {/* Note about Google Drive .zip vs .sb3 */}
              <div className="mt-3 bg-[#FFFDF0] p-2.5 border-2 border-black text-[11px] font-bold text-black flex items-center gap-2">
                <span className="bg-[#FFE600] px-2 py-0.5 border border-black font-black text-[10px] shrink-0">PENTING</span>
                <span>File Scratch (.sb3) secara teknis berformat arsip sehingga Google Drive terkadang melabelinya sebagai <strong>.zip</strong>. <u>Jangan diekstrak!</u> Tombol di atas otomatis menyimpannya dengan format <strong>.sb3</strong> yang benar.</span>
              </div>
            </>
          )}
        </div>

        {/* Embedded TurboWarp Runner Section */}
        <div className="flex-1 bg-neutral-900 relative flex flex-col items-center justify-center overflow-hidden">
          <iframe
            src={sb3Info.embedUrl}
            title="Scratch Runner Embed"
            allow="fullscreen; autoplay; gamepad; camera; microphone"
            className="w-full flex-1 border-none bg-neutral-900"
          />
        </div>

        {/* Footer info bar */}
        <div className="bg-[#FFFDF0] border-t-4 border-black p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs font-black">
          <div className="flex items-center gap-2">
            <span className="bg-[#35E88E] px-2 py-0.5 border border-black text-black">TURBOWARP READY</span>
            <span className="text-black/80">
              {sb3Info.hint || 'TurboWarp adalah runner Scratch 3.0 super cepat dengan kompiler FPS tinggi.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 border-2 border-black neo-shadow-sm ml-auto cursor-pointer"
          >
            Tutup Peluncur
          </button>
        </div>

      </div>
    </div>
  );
};
