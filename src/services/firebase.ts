import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  enableNetwork,
  collection, 
  getDocs,
  getDocsFromServer,
  doc, 
  setDoc, 
  deleteDoc, 
  Firestore,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  FirebaseStorage 
} from 'firebase/storage';
import { Student, FirebaseConfigType } from '../types';
import { storeFileInIndexedDB } from './dbStorage';
import { fileToBase64 } from './fileHelpers';

/**
 * =========================================================================
 * KONFIGURASI RESMI FIREBASE (ESKUL CODING AL IKHLAS)
 * =========================================================================
 */
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyAwcv2N9KimbDaBRnFoGyLmapaOSyklxAQ",
  authDomain: "eskul-coding-aliks.firebaseapp.com",
  projectId: "eskul-coding-aliks",
  storageBucket: "eskul-coding-aliks.firebasestorage.app",
  messagingSenderId: "276460223117",
  appId: "1:276460223117:web:a7b34f52465ca2f2f780c4"
};

const STORAGE_KEY_CONFIG = 'erlass_firebase_custom_config';
const STORAGE_KEY_STUDENTS = 'erlass_students_local_db';
export const FIREBASE_CONFIG_UPDATED_EVENT = 'firebase-config-updated';

// Data demo dikosongkan secara total
export const INITIAL_STUDENTS: Student[] = [];

// Helper untuk membaca konfigurasi Firebase aktif
export function getStoredFirebaseConfig(): FirebaseConfigType {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      const isInvalid =
        !parsed ||
        !parsed.apiKey ||
        !parsed.projectId ||
        parsed.projectId === 'erlass-coding-2026' ||
        parsed.apiKey.includes('REPLACE_ME') ||
        parsed.apiKey.includes('YOUR_API_KEY') ||
        parsed.projectId.includes('your-project-id');

      if (isInvalid) {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_FIREBASE_CONFIG));
        return DEFAULT_FIREBASE_CONFIG;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Gagal membaca firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// Instance Firebase Singleton
let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let initializedProjectId: string | null = null;

export async function resetFirebaseServicesCache(): Promise<void> {
  const prevApp = firebaseAppInstance;
  firebaseAppInstance = null;
  firestoreInstance = null;
  storageInstance = null;
  initializedProjectId = null;
  if (prevApp) {
    try {
      await deleteApp(prevApp);
    } catch {
      // ignore if already deleted
    }
  }
}

export function saveStoredFirebaseConfig(config: FirebaseConfigType): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    // Reset singleton if project/api changed and notify active listeners
    if (initializedProjectId !== config.projectId) {
      resetFirebaseServicesCache().finally(() => {
        window.dispatchEvent(new Event(FIREBASE_CONFIG_UPDATED_EVENT));
      });
    } else {
      window.dispatchEvent(new Event(FIREBASE_CONFIG_UPDATED_EVENT));
    }
  } catch (e) {
    console.error('Gagal menyimpan firebase config:', e);
  }
}

export function resetStoredFirebaseConfig(): FirebaseConfigType {
  try {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  } catch (e) {
    console.error('Gagal mereset firebase config:', e);
  }
  resetFirebaseServicesCache().finally(() => {
    window.dispatchEvent(new Event(FIREBASE_CONFIG_UPDATED_EVENT));
  });
  return DEFAULT_FIREBASE_CONFIG;
}

// Cek apakah kredensial Firebase aktif & valid
export function isFirebaseConfigured(config?: FirebaseConfigType): boolean {
  const cfg = config || getStoredFirebaseConfig();
  return Boolean(
    cfg.apiKey &&
    !cfg.apiKey.includes('YOUR_API_KEY') &&
    !cfg.apiKey.includes('REPLACE_ME') &&
    cfg.projectId &&
    !cfg.projectId.includes('your-project-id')
  );
}

export function initializeFirebaseServices() {
  const config = getStoredFirebaseConfig();
  
  if (!isFirebaseConfigured(config)) {
    return { app: null, db: null, storage: null, isLive: false };
  }

  try {
    if (!firebaseAppInstance) {
      const apps = getApps();
      const matchingApp = apps.find(a => a.options?.projectId === config.projectId);
      firebaseAppInstance = matchingApp || (apps.length > 0 && apps[0].options?.apiKey === config.apiKey ? apps[0] : initializeApp(config, `erlass-${config.projectId}-${Date.now()}`));
      initializedProjectId = config.projectId;
    }
    if (!firestoreInstance && firebaseAppInstance) {
      try {
        // Auto-detect long polling ensures reliable realtime sync on school WiFi / proxy / iFrame
        firestoreInstance = initializeFirestore(firebaseAppInstance, {
          experimentalAutoDetectLongPolling: true
        });
      } catch {
        firestoreInstance = getFirestore(firebaseAppInstance);
      }
    }
    if (!storageInstance && firebaseAppInstance) {
      storageInstance = getStorage(firebaseAppInstance);
    }
    return {
      app: firebaseAppInstance,
      db: firestoreInstance,
      storage: storageInstance,
      isLive: true
    };
  } catch (error) {
    console.warn('Inisialisasi Firebase error:', error);
    return { app: null, db: null, storage: null, isLive: false };
  }
}

// Bersihkan data demo dari penyimpanan lokal
export function clearAllLocalDemoData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_STUDENTS);
  } catch (e) {
    console.error('Gagal membersihkan storage:', e);
  }
}

// Local Storage Students Database Helpers
export function getLocalStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(s => !['student-1', 'student-2', 'student-3', 'student-4'].includes(s.id));
      }
    }
  } catch (e) {
    console.error('Gagal membaca data siswa lokal:', e);
  }
  return [];
}

export function saveLocalStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Gagal menyimpan students lokal:', e);
  }
}

export interface RealtimeSyncMeta {
  isLive: boolean;
  fromCache: boolean;
}

/**
 * =========================================================================
 * REALTIME LISTENER: SINKRONISASI FIRESTORE REALTIME KE CLIENT
 * Dilengkapi auto-reconnect & network recovery
 * =========================================================================
 */
export function subscribeToStudents(
  onData: (students: Student[], meta?: RealtimeSyncMeta) => void,
  onError?: (err: any) => void
): Unsubscribe {
  let activeUnsubscribe: Unsubscribe | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let isDisposed = false;

  const attachListener = () => {
    if (isDisposed) return;

    if (activeUnsubscribe) {
      try { activeUnsubscribe(); } catch {}
      activeUnsubscribe = null;
    }

    const { db, isLive } = initializeFirebaseServices();

    if (isLive && db) {
      try {
        enableNetwork(db).catch(() => {});
        const colRef = collection(db, 'students');

        activeUnsubscribe = onSnapshot(
          colRef,
          { includeMetadataChanges: true },
          (snapshot) => {
            if (isDisposed) return;
            const liveStudents: Student[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                studentName: data.studentName || '',
                competitionIdea: data.competitionIdea || '',
                moduleUrl: data.moduleUrl || '',
                sb3FileUrl: data.sb3FileUrl || '',
                createdAt: data.createdAt || new Date().toISOString(),
                moduleFileName: data.moduleFileName || '',
                sb3FileName: data.sb3FileName || '',
                moduleFileKey: data.moduleFileKey || '',
                sb3FileKey: data.sb3FileKey || '',
                category: data.category || '',
                grade: data.grade || ''
              };
            });

            // Urutkan berdasarkan waktu pembuatan terbaru
            liveStudents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Sinkronkan ke cache lokal
            saveLocalStudents(liveStudents);
            const fromCache = snapshot.metadata?.fromCache ?? false;
            onData(liveStudents, { isLive: !fromCache, fromCache });
          },
          (error) => {
            if (isDisposed) return;
            console.warn('Realtime listener error dari Firestore:', error);
            if (onError) onError(error);
            // Berikan data lokal tanpa menandai isLive = true
            onData(getLocalStudents(), { isLive: false, fromCache: true });

            // Jadwalkan penyambungan ulang otomatis setiap 5 detik
            if (!retryTimer) {
              retryTimer = setTimeout(() => {
                retryTimer = null;
                attachListener();
              }, 5000);
            }
          }
        );

        return;
      } catch (error) {
        console.warn('Gagal memasang onSnapshot Firestore:', error);
      }
    }

    // Fallback offline / local
    onData(getLocalStudents(), { isLive: false, fromCache: true });
  };

  attachListener();

  const handleOnline = () => {
    const { db } = initializeFirebaseServices();
    if (db) {
      enableNetwork(db).catch(() => {});
    }
    attachListener();
  };

  const handleConfigUpdated = () => {
    attachListener();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener(FIREBASE_CONFIG_UPDATED_EVENT, handleConfigUpdated);

  return () => {
    isDisposed = true;
    window.removeEventListener('online', handleOnline);
    window.removeEventListener(FIREBASE_CONFIG_UPDATED_EVENT, handleConfigUpdated);
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (activeUnsubscribe) {
      try { activeUnsubscribe(); } catch {}
      activeUnsubscribe = null;
    }
  };
}

// Fetch all students (Once, prioritizing server)
export async function fetchAllStudents(): Promise<{ students: Student[]; source: 'firestore' | 'local' }> {
  const { db, isLive } = initializeFirebaseServices();

  if (isLive && db) {
    try {
      await enableNetwork(db).catch(() => {});
      const colRef = collection(db, 'students');
      let snapshot;
      try {
        snapshot = await getDocsFromServer(colRef);
      } catch {
        snapshot = await getDocs(colRef);
      }
      const liveStudents: Student[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          studentName: data.studentName || '',
          competitionIdea: data.competitionIdea || '',
          moduleUrl: data.moduleUrl || '',
          sb3FileUrl: data.sb3FileUrl || '',
          createdAt: data.createdAt || new Date().toISOString(),
          moduleFileName: data.moduleFileName || '',
          sb3FileName: data.sb3FileName || '',
          moduleFileKey: data.moduleFileKey || '',
          sb3FileKey: data.sb3FileKey || '',
          category: data.category || '',
          grade: data.grade || ''
        };
      });
      liveStudents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalStudents(liveStudents);
      return { students: liveStudents, source: 'firestore' };
    } catch (error) {
      console.warn('Gagal membaca Firestore, menggunakan penyimpanan lokal:', error);
    }
  }

  return { students: getLocalStudents(), source: 'local' };
}

// Save or Update Student to Realtime Firestore
export async function saveStudent(
  student: Omit<Student, 'id'> & { id?: string }
): Promise<{ student: Student; isFirestore: boolean }> {
  const { db, isLive } = initializeFirebaseServices();
  const id = student.id || `student-${Date.now()}`;
  const fullStudent: Student = {
    ...student,
    id,
    createdAt: student.createdAt || new Date().toISOString()
  };

  const payload = {
    studentName: fullStudent.studentName,
    competitionIdea: fullStudent.competitionIdea,
    moduleUrl: fullStudent.moduleUrl || '',
    sb3FileUrl: fullStudent.sb3FileUrl || '',
    createdAt: fullStudent.createdAt,
    moduleFileName: fullStudent.moduleFileName || '',
    sb3FileName: fullStudent.sb3FileName || '',
    moduleFileKey: fullStudent.moduleFileKey || '',
    sb3FileKey: fullStudent.sb3FileKey || '',
    category: fullStudent.category || '',
    grade: fullStudent.grade || ''
  };

  // Cek estimasi ukuran dokumen Firestore (batas maksimal 1 MiB = 1.048.576 byte)
  const estimatedBytes = new Blob([JSON.stringify(payload)]).size;
  if (estimatedBytes > 1000000) {
    throw new Error(
      'Ukuran total data + file terlalu besar untuk disimpan langsung di Firestore (>980 KB). Gunakan tautan Google Drive untuk file berukuran besar!'
    );
  }

  // Update cache lokal terlebih dahulu
  const currentLocal = getLocalStudents();
  const existingIdx = currentLocal.findIndex(s => s.id === id);
  if (existingIdx >= 0) {
    currentLocal[existingIdx] = fullStudent;
  } else {
    currentLocal.unshift(fullStudent);
  }
  saveLocalStudents(currentLocal);

  // Jika Firestore terhubung, simpan langsung secara realtime ke Cloud
  let isFirestore = false;
  if (isLive && db) {
    try {
      await enableNetwork(db).catch(() => {});
      const docRef = doc(db, 'students', id);
      await setDoc(docRef, payload);
      isFirestore = true;
    } catch (err: any) {
      console.error('Gagal menulis ke Firestore:', err);
      throw new Error(`Gagal menyimpan ke Firestore: ${err?.message || err}`);
    }
  }

  return { student: fullStudent, isFirestore };
}

// Delete Student from Realtime Firestore
export async function deleteStudentById(studentId: string): Promise<void> {
  const { db, isLive } = initializeFirebaseServices();

  // Hapus dari cache lokal
  const current = getLocalStudents();
  const filtered = current.filter(s => s.id !== studentId);
  saveLocalStudents(filtered);

  // Hapus dari Firestore jika live
  if (isLive && db) {
    try {
      await enableNetwork(db).catch(() => {});
      const docRef = doc(db, 'students', studentId);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Gagal menghapus dokumen di Firestore:', err);
      throw new Error(`Gagal menghapus di Firestore: ${err?.message || err}`);
    }
  }
}

/**
 * Upload file dengan batas waktu (timeout 6 detik) & progress real-time.
 * Mencegah tombol terjebak dalam status "Mengunggah..." jika Firebase Storage belum diaktifkan atau lambat.
 */
export async function uploadFileToStorage(
  file: File, 
  folder: 'modules' | 'scratch_projects',
  onProgress?: (percent: number) => void
): Promise<{ url: string; fileName: string; storageType: 'cloud' | 'local'; note?: string; fileKey?: string }> {
  const { storage, isLive } = initializeFirebaseServices();

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${timestamp}_${sanitizedName}`;
  const fileKey = `file_${filePath}`;

  // 1. Coba upload ke Firebase Storage Cloud dengan timeout 6 detik
  if (isLive && storage) {
    try {
      const storageRef = ref(storage, filePath);
      const metadata = { 
        contentType: file.type || (file.name.endsWith('.sb3') ? 'application/x.scratch.sb3' : 'application/octet-stream') 
      };

      const cloudUploadPromise = new Promise<{ url: string; fileName: string; storageType: 'cloud'; fileKey: string }>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Batas waktu 6 detik
        const timeoutTimer = setTimeout(() => {
          try {
            uploadTask.cancel();
          } catch {}
          reject(new Error('Firebase Storage timeout.'));
        }, 6000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(pct);
            }
          },
          (err) => {
            clearTimeout(timeoutTimer);
            reject(err);
          },
          async () => {
            clearTimeout(timeoutTimer);
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                url: downloadUrl,
                fileName: file.name,
                storageType: 'cloud',
                fileKey
              });
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      const res = await cloudUploadPromise;
      return res;
    } catch (err: any) {
      console.warn('Firebase Storage Cloud dilewati/unauthorized, beralih ke penyimpanan cerdas:', err?.message || err);
    }
  }

  // 2. Jika file <= 680 KB, ubah menjadi Data URL (Base64) agar aman di bawah limit 1 MiB Firestore
  // Ini menjamin file dapat diakses 100% oleh semua siswa dari komputer/HP manapun tanpa link mati!
  if (onProgress) onProgress(90);
  await storeFileInIndexedDB(fileKey, file);

  if (file.size <= 680 * 1024) {
    try {
      const dataUrl = await fileToBase64(file);
      if (onProgress) onProgress(100);
      return {
        url: dataUrl,
        fileName: file.name,
        storageType: 'cloud',
        fileKey,
        note: 'Tersimpan otomatis ke database Firestore (Base64)'
      };
    } catch (b64Err) {
      console.warn('Gagal membaca file base64:', b64Err);
    }
  }

  // 3. Jika file > 680 KB, simpan di IndexedDB
  if (onProgress) onProgress(100);
  const blobUrl = URL.createObjectURL(file);
  return {
    url: blobUrl,
    fileName: file.name,
    storageType: 'local',
    fileKey,
    note: 'Ukuran file besar (>680KB). Disarankan menempelkan link Google Drive agar bisa dibuka semua siswa.'
  };
}

// Test Connection Helper (verifikasi langsung roundtrip ke server koleksi students)
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  const config = getStoredFirebaseConfig();
  if (!isFirebaseConfigured(config)) {
    return {
      success: false,
      message: 'Kredensial Firebase belum lengkap.'
    };
  }

  try {
    const { db } = initializeFirebaseServices();
    if (!db) {
      return { success: false, message: 'Gagal inisialisasi Firestore.' };
    }
    await enableNetwork(db).catch(() => {});
    const snapshot = await getDocsFromServer(collection(db, 'students'));
    return {
      success: true,
      message: `Berhasil terhubung secara realtime ke Firebase Firestore (${config.projectId})! Terdeteksi ${snapshot.size} peserta aktif di server.`
    };
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.message?.includes('failed-precondition')) {
      return {
        success: false,
        message: 'Klien offline atau belum dapat menjangkau server Firestore.'
      };
    }
    return {
      success: false,
      message: error?.message || 'Error saat menguji koneksi Firebase.'
    };
  }
}
