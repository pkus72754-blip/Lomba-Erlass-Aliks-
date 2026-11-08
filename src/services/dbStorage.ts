/**
 * IndexedDB helper for fast, non-blocking client-side file storage
 * Prevents localStorage 5MB quota errors and keeps Firestore documents light (<1MB)
 */

const DB_NAME = 'ErlassCodingFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFileInIndexedDB(key: string, file: Blob | File): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(file, key);
    req.onsuccess = () => resolve(URL.createObjectURL(file));
    req.onerror = () => reject(req.error);
  });
}

export async function getFileFromIndexedDB(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

// Convert stored key / expired blob URL to a fresh active Blob URL if available in IndexedDB
export async function getFreshBlobUrl(key: string): Promise<string | null> {
  try {
    const blob = await getFileFromIndexedDB(key);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Gagal membaca file dari IndexedDB:', e);
  }
  return null;
}

// Check if a URL is a valid remote public HTTP URL (NOT blob: and NOT data:)
export function isPublicHttpUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return (trimmed.startsWith('http://') || trimmed.startsWith('https://')) && 
         !trimmed.startsWith('blob:') && 
         !trimmed.startsWith('data:');
}

// Format URLs for iframe embedding (e.g. Google Drive view -> preview)
export function formatEmbedUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Google Drive: convert /view to /preview for iframe embed
  if (trimmed.includes('drive.google.com') && trimmed.includes('/view')) {
    return trimmed.replace(/\/view.*$/, '/preview');
  }
  
  return trimmed;
}
