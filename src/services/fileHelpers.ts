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
  fullPageUrl: string;
  downloadUrl?: string;
  scratchId?: string;
  isDirectEmbeddable: boolean;
  hint?: string;
}

export interface ParseScratchOptions {
  studentId?: string;
  fileName?: string;
  studentName?: string;
}

/**
 * Generates the clean CORS-enabled project API URL that streams the .sb3 binary
 */
export function getSb3ProjectApiUrl(studentId: string, fileName?: string): string {
  const cleanName = (fileName || 'project.sb3').replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    // If running in HTTPS (Vercel / Cloud preview), use current origin.
    // If running on HTTP localhost, use production Vercel URL so TurboWarp (HTTPS) won't block mixed content!
    const base = isHttps ? window.location.origin : 'https://lomba-erlass-aliks.vercel.app';
    return `${base}/api/sb3-project?id=${encodeURIComponent(studentId)}&file=${encodeURIComponent(cleanName)}`;
  }
  return `https://lomba-erlass-aliks.vercel.app/api/sb3-project?id=${encodeURIComponent(studentId)}&file=${encodeURIComponent(cleanName)}`;
}

export function getSb3DriveApiUrl(driveFileId: string, fileName?: string): string {
  const cleanName = (fileName || 'project.sb3').replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const base = isHttps ? window.location.origin : 'https://lomba-erlass-aliks.vercel.app';
    return `${base}/api/sb3-project?driveId=${encodeURIComponent(driveFileId)}&file=${encodeURIComponent(cleanName)}`;
  }
  return `https://lomba-erlass-aliks.vercel.app/api/sb3-project?driveId=${encodeURIComponent(driveFileId)}&file=${encodeURIComponent(cleanName)}`;
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
export function parseScratchUrl(url?: string, options?: ParseScratchOptions): ScratchUrlInfo {
  const trimmed = (url || '').trim();

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
      fullPageUrl: `https://turbowarp.org/fullscreen.html#${id}`,
      downloadUrl: `https://projects.scratch.mit.edu/${id}`,
      isDirectEmbeddable: true,
      hint: `Proyek Scratch ID #${id} langsung terhubung dan siap dimainkan di TurboWarp ⚡`
    };
  }

  // 2. If studentId is provided, route directly through /api/sb3-project
  // This supports direct upload in Firestore (Base64) & Google Drive links without CORS or ZIP problems!
  if (options?.studentId && trimmed) {
    const projectApiUrl = getSb3ProjectApiUrl(options.studentId, options.fileName);
    const cleanFileName = (options.fileName || 'project.sb3').replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';
    const isDrive = trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');

    return {
      type: isDrive ? 'google_drive' : (trimmed.startsWith('data:') ? 'data_url' : 'direct_sb3'),
      embedUrl: `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(projectApiUrl)}`,
      editorUrl: `https://turbowarp.org/editor?project_url=${encodeURIComponent(projectApiUrl)}`,
      fullPageUrl: `https://turbowarp.org/fullscreen.html?project_url=${encodeURIComponent(projectApiUrl)}`,
      downloadUrl: trimmed.startsWith('data:') || trimmed.startsWith('blob:') ? trimmed : projectApiUrl,
      isDirectEmbeddable: true,
      hint: `Proyek Scratch (.sb3) "${cleanFileName}" dimuat langsung ke TurboWarp ⚡`
    };
  }

  // 3. Google Drive Link without studentId
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                       trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = driveMatch ? driveMatch[1] : '';
    const cleanFileName = (options?.fileName || 'project.sb3').replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';

    if (fileId) {
      const projectApiUrl = getSb3DriveApiUrl(fileId, cleanFileName);
      return {
        type: 'google_drive',
        embedUrl: `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(projectApiUrl)}`,
        editorUrl: `https://turbowarp.org/editor?project_url=${encodeURIComponent(projectApiUrl)}`,
        fullPageUrl: `https://turbowarp.org/fullscreen.html?project_url=${encodeURIComponent(projectApiUrl)}`,
        downloadUrl: projectApiUrl,
        scratchId: fileId,
        isDirectEmbeddable: true,
        hint: 'Proyek Scratch (.sb3) dari Google Drive dimuat langsung ke TurboWarp ⚡'
      };
    }
  }

  // 4. Direct Public HTTP/HTTPS URL to an .sb3 file (excluding drive)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'direct_sb3',
      embedUrl: `https://turbowarp.org/embed.html?project_url=${encodeURIComponent(trimmed)}`,
      editorUrl: `https://turbowarp.org/editor?project_url=${encodeURIComponent(trimmed)}`,
      fullPageUrl: `https://turbowarp.org/fullscreen.html?project_url=${encodeURIComponent(trimmed)}`,
      downloadUrl: trimmed,
      isDirectEmbeddable: true,
      hint: 'Proyek .sb3 tersambung langsung ke TurboWarp ⚡'
    };
  }

  // 5. Fallback for Data URL or Blob URL without studentId
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return {
      type: trimmed.startsWith('data:') ? 'data_url' : 'blob_url',
      embedUrl: 'https://turbowarp.org/embed.html',
      editorUrl: 'https://turbowarp.org/editor',
      fullPageUrl: 'https://turbowarp.org/fullscreen.html',
      downloadUrl: trimmed,
      isDirectEmbeddable: false,
      hint: 'File .sb3 tersimpan di database. Klik Unduh .sb3 untuk memainkannya di TurboWarp!'
    };
  }

  return {
    type: 'empty',
    embedUrl: 'https://turbowarp.org/embed.html',
    editorUrl: 'https://turbowarp.org/editor',
    fullPageUrl: 'https://turbowarp.org/fullscreen.html',
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

/**
 * Downloads an .sb3 file ensuring the file is NEVER saved as a .zip file.
 * Solves the issue where Google Drive labels .sb3 files as ZIP archives.
 */
export async function downloadSb3File(url: string, rawFileName: string, studentId?: string): Promise<void> {
  const cleanName = rawFileName.replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';

  // 1. If it's a local Blob or Base64 Data URL, download directly as .sb3
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 2. Route via /api/sb3-project or /api/sb3-proxy to guarantee .sb3 extension & correct MIME type
  try {
    let fetchUrl = url;
    if (studentId) {
      fetchUrl = `/api/sb3-project?id=${encodeURIComponent(studentId)}&file=${encodeURIComponent(cleanName)}`;
    } else if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      const fileId = match ? match[1] : '';
      if (fileId) {
        fetchUrl = `/api/sb3-project?driveId=${fileId}&file=${encodeURIComponent(cleanName)}`;
      }
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error('Fetch via proxy failed');
    const blob = await response.blob();
    // Force Scratch .sb3 MIME type so the OS/browser saves it with .sb3
    const forcedBlob = new Blob([blob], { type: 'application/x.scratch.sb3' });
    const localBlobUrl = URL.createObjectURL(forcedBlob);

    const a = document.createElement('a');
    a.href = localBlobUrl;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(localBlobUrl), 10000);
  } catch (err) {
    console.warn('Fallback direct download for sb3:', err);
    // Fallback: direct browser trigger
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

