import React from 'react';
import { X, Download, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';
import { parsePdfUrl, base64ToBlob } from '../services/fileHelpers';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  studentName: string;
  fileName?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  studentName,
  fileName
}) => {
  if (!isOpen) return null;

  const displayFileName = fileName || `Modul_Pembelajaran_${studentName.replace(/\s+/g, '_')}.pdf`;
  const pdfInfo = parsePdfUrl(pdfUrl);

  // If Data URL, convert to session blob URL so browser handles it cleanly
  let effectiveEmbedUrl = pdfInfo.embedUrl;
  let effectiveDownloadUrl = pdfInfo.downloadUrl || pdfUrl;

  if (pdfInfo.isDataUrl && typeof window !== 'undefined') {
    try {
      const blob = base64ToBlob(pdfUrl, 'application/pdf');
      const blobUrl = URL.createObjectURL(blob);
      effectiveEmbedUrl = `${blobUrl}#toolbar=1`;
      effectiveDownloadUrl = blobUrl;
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#FFFDF0] border-4 border-black neo-shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#35E88E] border-b-4 border-black p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-bold text-lg neo-shadow-sm">
              📄
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-black font-['Outfit',sans-serif] truncate max-w-md">
                Modul Pembelajaran: {studentName}
              </h3>
              <p className="text-xs font-bold text-black/80 truncate">
                {displayFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {effectiveDownloadUrl && (
              <>
                <a
                  href={effectiveDownloadUrl}
                  download={displayFileName}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFE600] text-black font-extrabold text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </a>
                <a
                  href={effectiveDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFE600] text-black font-extrabold text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Tab Baru</span>
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 bg-[#FF6B97] hover:bg-[#FF4D4D] text-white border-2 border-black neo-shadow-sm flex items-center justify-center font-black neo-btn cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
          {effectiveEmbedUrl ? (
            <div className="w-full h-full relative flex flex-col">
              <iframe
                src={effectiveEmbedUrl}
                title="Viewer Modul PDF"
                className="w-full flex-1 border-none bg-white"
                allow="autoplay"
              />
              <div className="bg-white border-t-2 border-black p-2.5 px-4 flex items-center justify-between text-xs font-black">
                <span className="text-black/80 truncate max-w-sm">
                  Jika tampilan dokumen tidak muncul di pratinjau browser, klik tombol buka di tab baru:
                </span>
                <a
                  href={effectiveDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FFE600] hover:bg-yellow-300 text-black px-3 py-1 border border-black font-black flex items-center gap-1 text-xs neo-shadow-sm neo-btn"
                >
                  <span>Buka di Tab Baru ↗</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF0]">
              <div className="w-16 h-16 bg-[#FFE600] border-3 border-black neo-shadow flex items-center justify-center text-3xl mb-4">
                📑
              </div>
              <h4 className="text-xl font-black text-black mb-2">Modul Sedang Disiapkan</h4>
              <p className="text-sm font-bold text-black/70 max-w-md">
                Guru pembimbing belum melampirkan tautan atau file modul PDF untuk proyek ini. Silakan hubungi Pak Guru.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FFE600] border-t-4 border-black p-3 px-4 flex flex-wrap items-center justify-between text-xs font-black gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 border border-black">TIPS SISWA</span>
            <span>Baca panduan langkah demi langkah sebelum menyusun blok kode Scratch kamu!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 border-2 border-black neo-shadow-sm ml-auto cursor-pointer"
          >
            Tutup Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
