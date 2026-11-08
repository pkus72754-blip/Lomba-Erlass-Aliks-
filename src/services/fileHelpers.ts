/**
 * File helpers for robust PDF & Scratch (.sb3) parsing, conversion, and embedding.
 * Handles:
 * 1. Google Drive URLs (converts /view to /preview, extracts file IDs)
 * 2. Scratch Project IDs and URLs (https://scratch.mit.edu/projects/ID -> turbowarp.org/embed.html#ID)
 * 3. Base64 Data URLs (permanent storage in Firestore under 800KB)
 * 4. Fresh session Blob creation so iframes never encounter dead cross-origin URLs
 */

export interface ScratchUrlInfo {
  type: 'scratch_id' | 'direct_sb3' | 'google_drive' | 'data_url' | 'blob_url' | 'empty';
  embedUrl: string;
  editorUrl: string;
  downloadUrl?: string;
  scratchId?: string;
  isDirectEmbeddable: boolean;
  hint?: string;
}

export interface PdfUrlInfo {
  type: 'google_drive' | 'data_url' | 'direct_pdf' | 'blob_url' | 'empty';
  embedUrl: string;
  downloadUrl?: string;
  isValid: boolean;
  isGoogleDrive: boolean;
  isDataUrl: boolean;
}

/**
 * Convert a File object to Base64 Data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Base64 Data URL to Blob
 */
export function base64ToBlob(base64Data: string, fallbackMime = 'application/octet-stream'): Blob {
  try {
    const parts = base64Data.split(';base64,');
    const mime = parts.length > 1 ? parts[0].replace('data:', '') : fallbackMime;
    const base64Str = parts[1] || parts[0];
    const byteCharacters = atob(base64Str);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  } catch (e) {
    console.error('Error converting base64 to blob:', e);
    return new Blob([], { type: fallbackMime });
  }
}

/**
 * Parse and resolve any Scratch project input (Scratch URL, ID, Direct SB3, Google Drive, Data URL)
 */
export function parseScratchUrl(url?: string): ScratchUrlInfo {
  if (!url || !url.trim()) {
    return {
      type: 'empty',
      embedUrl: 'https://turbowarp.org/embed.html',
      editorUrl: 'https://turbowarp.org/editor',
      isDirectEmbeddable: false
    };
  }

  const trimmed = url.trim();

  // 1. Check if input is a Scratch Project ID or Scratch/TurboWarp URL
  // Matches: 12345678, https://scratch.mit.edu/projects/12345678/, https://turbowarp.org/12345678
  const idMatch = trimmed.match(/(?:scratch\.mit\.edu\/projects\/|turbowarp\.org\/|^)(\d{6,14})/i);
  if (idMatch && idMatch[1]) {
    const id = idMatch[1];
    return {
      type: 'scratch_id',
      scratchId: id,
      embedUrl: `https://turbowarp.org/embed.html#${id}`,
      editorUrl: `https://turbowarp.org/editor#${id}`,
      downloadUrl: `https://projects.scratch.mit.edu/${id}`,
      isDirectEmbeddable: true,
      hint: `Proyek Scratch ID #${id} langsung terhubung dan siap dimainkan di TurboWarp!`
    };
  }

  // 2. Google Drive Link
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    const fileId = driveMatch ? driveMatch[1] : '';
    const downloadUrl = fileId 
      ? `https://drive.google.com/uc?export=download&id=${fileId}` 
      : trimmed;

    return {
      type: 'google_drive',
      embedUrl: 'https://turbowarp.org/embed.html',
      editorUrl: 'https://turbowarp.org/editor',
      downloadUrl: downloadUrl,
      isDirectEmbeddable: false,
      hint: 'File .sb3 tersimpan di Google Drive. Klik Unduh .sb3 lalu seret file ke player TurboWarp di bawah!'
    };
  }

  // 3. Base64 Data URL
  if (trimmed.startsWith('data:')) {
    return {
      type: 'data_url',
      embedUrl: 'https://turbowarp.org/embed.html',
      editorUrl: 'https://turbowarp.org/editor',
      downloadUrl: trimmed,
      isDirectEmbeddable: false,
      hint: 'File .sb3 tersimpan di database. Klik Unduh .sb3 lalu buka/seret ke layar TurboWarp di bawah!'
    };
  }

  // 4. Blob URL
  if (trimmed.startsWith('blob:')) {
    return {
      type: 'blob_url',
      embedUrl: 'https://turbowarp.org/embed.html',
      editorUrl: 'https://turbowarp.org/editor',
      downloadUrl: trimmed,
      isDirectEmbeddable: false,
      hint: 'Klik Unduh .sb3 lalu seret file ke layar TurboWarp di bawah untuk memainkannya!'
    };
  }

  // 5. Direct Public HTTP/HTTPS URL to an .sb3 file (excluding drive)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'direct_sb3',
      embedUrl: `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(trimmed)}`,
      editorUrl: `https://turbowarp.org/editor?project_url=${encodeURIComponent(trimmed)}`,
      downloadUrl: trimmed,
      isDirectEmbeddable: true,
      hint: 'Proyek .sb3 tersambung langsung ke TurboWarp ⚡'
    };
  }

  return {
    type: 'empty',
    embedUrl: 'https://turbowarp.org/embed.html',
    editorUrl: 'https://turbowarp.org/editor',
    isDirectEmbeddable: false
  };
}

/**
 * Parse and resolve any PDF input (Google Drive, Data URL, direct link, blob)
 */
export function parsePdfUrl(url?: string): PdfUrlInfo {
  if (!url || !url.trim()) {
    return {
      type: 'empty',
      embedUrl: '',
      isValid: false,
      isGoogleDrive: false,
      isDataUrl: false
    };
  }

  const trimmed = url.trim();

  // 1. Google Drive Link
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                        trimmed.match(/id=([a-zA-Z0-9_-]+)/) ||
                        trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return {
        type: 'google_drive',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        downloadUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
        isValid: true,
        isGoogleDrive: true,
        isDataUrl: false
      };
    }

    const previewUrl = trimmed
      .replace(/\/view(\?.*)?$/, '/preview')
      .replace(/\/edit(\?.*)?$/, '/preview');

    return {
      type: 'google_drive',
      embedUrl: previewUrl,
      downloadUrl: trimmed,
      isValid: true,
      isGoogleDrive: true,
      isDataUrl: false
    };
  }

  // 2. Base64 Data URL
  if (trimmed.startsWith('data:')) {
    return {
      type: 'data_url',
      embedUrl: trimmed,
      downloadUrl: trimmed,
      isValid: true,
      isGoogleDrive: false,
      isDataUrl: true
    };
  }

  // 3. Blob URL
  if (trimmed.startsWith('blob:')) {
    return {
      type: 'blob_url',
      embedUrl: trimmed,
      downloadUrl: trimmed,
      isValid: true,
      isGoogleDrive: false,
      isDataUrl: false
    };
  }

  // 4. Direct HTTP/HTTPS link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'direct_pdf',
      embedUrl: trimmed.includes('#') ? trimmed : `${trimmed}#toolbar=1`,
      downloadUrl: trimmed,
      isValid: true,
      isGoogleDrive: false,
      isDataUrl: false
    };
  }

  return {
    type: 'empty',
    embedUrl: '',
    isValid: false,
    isGoogleDrive: false,
    isDataUrl: false
  };
}
