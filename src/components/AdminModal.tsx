import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Key, 
  RefreshCw, 
  Search,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { Student, FirebaseConfigType } from '../types';
import { Logo } from './Logo';
import { 
  uploadFileToStorage, 
  saveStudent, 
  deleteStudentById,
  saveStoredFirebaseConfig,
  getStoredFirebaseConfig,
  resetStoredFirebaseConfig,
  testConnection,
  clearAllLocalDemoData,
  saveLocalStudents
} from '../services/firebase';

const GRADE_OPTIONS: string[] = [
  'Kelas 1', 'Kelas 1A', 'Kelas 1B', 'Kelas 1C',
  'Kelas 2', 'Kelas 2A', 'Kelas 2B', 'Kelas 2C',
  'Kelas 3', 'Kelas 3A', 'Kelas 3B', 'Kelas 3C',
  'Kelas 4', 'Kelas 4A', 'Kelas 4B', 'Kelas 4C',
  'Kelas 5', 'Kelas 5A', 'Kelas 5B', 'Kelas 5C',
  'Kelas 6', 'Kelas 6A', 'Kelas 6B', 'Kelas 6C'
];

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onRefreshStudents: () => void;
  onViewStudent: (student: Student) => void;
  isFirebaseLive: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  students,
  onRefreshStudents,
  onViewStudent,
  isFirebaseLive
}) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'batch' | 'firebase'>('list');

  // Form State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('Kelas 1A');
  const [category, setCategory] = useState('Game Interaktif');
  const [competitionIdea, setCompetitionIdea] = useState('');
  const [moduleUrl, setModuleUrl] = useState('');
  const [moduleFileName, setModuleFileName] = useState('');
  const [moduleFileKey, setModuleFileKey] = useState('');
  const [sb3Url, setSb3Url] = useState('');
  const [sb3FileName, setSb3FileName] = useState('');
  const [sb3FileKey, setSb3FileKey] = useState('');

  // Upload progress states
  const [isUploadingModule, setIsUploadingModule] = useState(false);
  const [uploadModuleProgress, setUploadModuleProgress] = useState(0);
  const [isUploadingSb3, setIsUploadingSb3] = useState(false);
  const [uploadSb3Progress, setUploadSb3Progress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Batch Upload States
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatusText, setBatchStatusText] = useState('');
  const [batchLog, setBatchLog] = useState<{ name: string; status: 'success' | 'error'; message: string }[]>([]);
  const [batchDefaultGrade, setBatchDefaultGrade] = useState('Kelas 1A');
  const [batchDefaultCategory, setBatchDefaultCategory] = useState('Game Interaktif');
  const [pasteRosterText, setPasteRosterText] = useState('');

  // Search in table
  const [searchTable, setSearchTable] = useState('');

  // Firebase Config State
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigType>(getStoredFirebaseConfig());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  // Authentication check (bajuri39, mrrohman, msima)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanPw = passwordInput.trim();
    if (cleanPw === 'bajuri39' || cleanPw === 'mrrohman' || cleanPw === 'msima') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Kata sandi salah! Gunakan sandi resmi guru pembimbing.');
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setStudentName(student.studentName);
    setGrade(student.grade || 'Kelas 1A');
    setCategory(student.category || 'Game Interaktif');
    setCompetitionIdea(student.competitionIdea);
    setModuleUrl(student.moduleUrl || '');
    setModuleFileName(student.moduleFileName || '');
    setModuleFileKey(student.moduleFileKey || '');
    setSb3Url(student.sb3FileUrl || '');
    setSb3FileName(student.sb3FileName || '');
    setSb3FileKey(student.sb3FileKey || '');
    setActiveTab('form');
  };

  const handleNewStudentClick = () => {
    setEditingStudentId(null);
    setStudentName('');
    setGrade('Kelas 1A');
    setCategory('Game Interaktif');
    setCompetitionIdea('');
    setModuleUrl('');
    setModuleFileName('');
    setModuleFileKey('');
    setSb3Url('');
    setSb3FileName('');
    setSb3FileKey('');
    setActiveTab('form');
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data siswa ${name}?`)) {
      try {
        await deleteStudentById(id);
        onRefreshStudents();
        setNotification({ type: 'success', message: `Data siswa ${name} berhasil dihapus!` });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        setNotification({ type: 'error', message: err.message || 'Gagal menghapus siswa' });
      }
    }
  };

  // Helper: Ekstraksi Nama Siswa & Kelas dari nama file yang diunggah
  const extractStudentInfoFromFileName = (filename: string): { name: string; grade: string; category: string } => {
    let clean = filename.replace(/\.(sb3|zip|pdf)$/i, '');
    clean = clean.replace(/[_-]+/g, ' ').trim();

    let detectedGrade = '';
    const gradeMatch = clean.match(/\b(?:kelas\s*)?([1-6]\s*[A-Z]?)\b/i);
    if (gradeMatch) {
      detectedGrade = `Kelas ${gradeMatch[1].toUpperCase().replace(/\s+/g, '')}`;
      clean = clean.replace(gradeMatch[0], '').trim();
    }

    clean = clean.replace(/\b(proyek|project|game|scratch|modul|coding|erlass|lomba|tugas|karya)\b/gi, '').trim();

    const nameParts = clean.split(' ').filter(Boolean);
    const formattedName = nameParts.length > 0 
      ? nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : filename.replace(/\.[^/.]+$/, '');

    return {
      name: formattedName || 'Peserta Lomba',
      grade: detectedGrade,
      category: 'Game Interaktif'
    };
  };

  // Upload PDF Module with real-time progress and timeout safeguard
  const handleModuleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingModule(true);
    setUploadModuleProgress(10);
    try {
      const res = await uploadFileToStorage(file, 'modules', (pct) => {
        setUploadModuleProgress(pct);
      });
      setModuleUrl(res.url);
      setModuleFileName(res.fileName);
      if (res.fileKey) setModuleFileKey(res.fileKey);

      // Otomatis isi Nama Siswa jika belum diisi berdasarkan nama file yang diunggah
      if (!studentName.trim()) {
        const info = extractStudentInfoFromFileName(file.name);
        if (info.name) setStudentName(info.name);
        if (info.grade) setGrade(info.grade);
      }
      if (!competitionIdea.trim()) {
        setCompetitionIdea(`Modul panduan koding proyek Scratch untuk kompetisi Erlass Coding 2026.`);
      }

      setNotification({ 
        type: 'success', 
        message: `Modul "${file.name}" berhasil disiapkan (${res.storageType === 'cloud' ? 'Firebase Cloud' : 'Penyimpanan Cepat Instan'})!` 
      });
      setTimeout(() => setNotification(null), 3500);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Gagal upload modul: ${error.message}` });
    } finally {
      setIsUploadingModule(false);
      setUploadModuleProgress(0);
      e.target.value = '';
    }
  };

  // Upload SB3 Project with real-time progress and timeout safeguard
  const handleSb3FileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSb3(true);
    setUploadSb3Progress(10);
    try {
      const res = await uploadFileToStorage(file, 'scratch_projects', (pct) => {
        setUploadSb3Progress(pct);
      });
      setSb3Url(res.url);
      setSb3FileName(res.fileName);
      if (res.fileKey) setSb3FileKey(res.fileKey);

      // Otomatis isi Nama Siswa jika belum diisi berdasarkan nama file yang diunggah
      if (!studentName.trim()) {
        const info = extractStudentInfoFromFileName(file.name);
        if (info.name) setStudentName(info.name);
        if (info.grade) setGrade(info.grade);
      }
      if (!competitionIdea.trim()) {
        setCompetitionIdea(`Proyek game koding Scratch untuk lomba Erlass Coding Competition 2026.`);
      }

      setNotification({ 
        type: 'success', 
        message: `File Scratch "${file.name}" berhasil disiapkan (${res.storageType === 'cloud' ? 'Firebase Cloud' : 'Penyimpanan Cepat Instan'})!` 
      });
      setTimeout(() => setNotification(null), 3500);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Gagal upload file SB3: ${error.message}` });
    } finally {
      setIsUploadingSb3(false);
      setUploadSb3Progress(0);
      e.target.value = '';
    }
  };

  // Submit Student Form to Realtime Firestore
  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !competitionIdea.trim()) {
      alert('Nama Siswa dan Deskripsi Ide Lomba wajib diisi!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveStudent({
        id: editingStudentId || undefined,
        studentName: studentName.trim(),
        grade,
        category,
        competitionIdea: competitionIdea.trim(),
        moduleUrl: moduleUrl.trim(),
        moduleFileName: moduleFileName.trim(),
        moduleFileKey: moduleFileKey.trim(),
        sb3FileUrl: sb3Url.trim(),
        sb3FileName: sb3FileName.trim(),
        sb3FileKey: sb3FileKey.trim(),
        createdAt: new Date().toISOString()
      });

      onRefreshStudents();
      setNotification({ 
        type: 'success', 
        message: res.isFirestore 
          ? `✅ Data ${studentName} BERHASIL TERSIMPAN KE FIREBASE FIRESTORE SECARA REALTIME!`
          : `✅ Data ${studentName} tersimpan di database lokal!` 
      });
      setActiveTab('list');
      setTimeout(() => setNotification(null), 4500);
    } catch (error: any) {
      setNotification({ type: 'error', message: `Gagal menyimpan: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Batch Upload Multiple SB3 Files at once
  const handleBatchSb3Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress(5);
    setBatchStatusText(`Menyiapkan ${files.length} file Scratch (.sb3)...`);
    const logs: { name: string; status: 'success' | 'error'; message: string }[] = [];

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { name, grade } = extractStudentInfoFromFileName(file.name);
      setBatchStatusText(`Mengunggah file untuk ${name} (${i + 1}/${files.length})...`);
      
      try {
        const uploadRes = await uploadFileToStorage(file, 'scratch_projects');
        
        // Cek apakah siswa dengan nama ini sudah ada di database
        const existingStudent = students.find(s => s.studentName.toLowerCase().trim() === name.toLowerCase().trim());

        await saveStudent({
          id: existingStudent?.id || undefined,
          studentName: name,
          grade: existingStudent?.grade || grade || batchDefaultGrade,
          category: existingStudent?.category || batchDefaultCategory,
          competitionIdea: existingStudent?.competitionIdea || `Proyek game koding Scratch "${file.name.replace(/\.[^/.]+$/, '')}" untuk Erlass Coding 2026.`,
          moduleUrl: existingStudent?.moduleUrl || '',
          moduleFileName: existingStudent?.moduleFileName || '',
          moduleFileKey: existingStudent?.moduleFileKey || '',
          sb3FileUrl: uploadRes.url,
          sb3FileName: uploadRes.fileName,
          sb3FileKey: uploadRes.fileKey || '',
          createdAt: existingStudent?.createdAt || new Date().toISOString()
        });

        successCount++;
        logs.push({
          name: `${name} (${file.name})`,
          status: 'success',
          message: `Berhasil tersimpan ke realtime database (${uploadRes.storageType === 'cloud' ? 'Firebase Cloud' : 'Penyimpanan Instan'})`
        });
      } catch (err: any) {
        logs.push({
          name: `${name} (${file.name})`,
          status: 'error',
          message: err?.message || 'Gagal menyimpan file'
        });
      }

      setBatchProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setBatchLog(logs);
    setIsBatchProcessing(false);
    onRefreshStudents();
    setNotification({
      type: 'success',
      message: `🎉 Selesai! ${successCount} dari ${files.length} file siswa berhasil diunggah & terhubung realtime!`
    });
    e.target.value = '';
  };

  // Import text / CSV roster
  const handleImportRosterText = async () => {
    const lines = pasteRosterText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert('Silakan masukkan nama siswa terlebih dahulu (satu nama per baris atau format CSV).');
      return;
    }

    setIsBatchProcessing(true);
    setBatchProgress(10);
    setBatchStatusText(`Memproses ${lines.length} nama siswa...`);
    const logs: { name: string; status: 'success' | 'error'; message: string }[] = [];
    let successCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const sName = parts[0];
      const sGrade = parts[1] || batchDefaultGrade;
      const sCategory = parts[2] || batchDefaultCategory;
      const sIdea = parts[3] || `Ide proyek koding siswa ${sName} untuk lomba Erlass Coding 2026.`;

      if (!sName) continue;

      try {
        const existingStudent = students.find(s => s.studentName.toLowerCase().trim() === sName.toLowerCase().trim());
        await saveStudent({
          id: existingStudent?.id || undefined,
          studentName: sName,
          grade: sGrade,
          category: sCategory,
          competitionIdea: existingStudent?.competitionIdea || sIdea,
          moduleUrl: existingStudent?.moduleUrl || '',
          moduleFileName: existingStudent?.moduleFileName || '',
          moduleFileKey: existingStudent?.moduleFileKey || '',
          sb3FileUrl: existingStudent?.sb3FileUrl || '',
          sb3FileName: existingStudent?.sb3FileName || '',
          sb3FileKey: existingStudent?.sb3FileKey || '',
          createdAt: existingStudent?.createdAt || new Date().toISOString()
        });

        successCount++;
        logs.push({
          name: sName,
          status: 'success',
          message: `Berhasil didaftarkan ke realtime database (${sGrade})`
        });
      } catch (err: any) {
        logs.push({
          name: sName,
          status: 'error',
          message: err?.message || 'Gagal menyimpan siswa'
        });
      }

      setBatchProgress(Math.round(((i + 1) / lines.length) * 100));
    }

    setBatchLog(logs);
    setIsBatchProcessing(false);
    setPasteRosterText('');
    onRefreshStudents();
    setNotification({
      type: 'success',
      message: `🎉 Berhasil mendaftarkan ${successCount} siswa ke database realtime!`
    });
  };

  // Save Firebase Config
  const handleSaveConfig = () => {
    saveStoredFirebaseConfig(firebaseConfig);
    setNotification({ type: 'success', message: 'Konfigurasi Firebase berhasil disimpan & disambungkan ulang!' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset Firebase Config to Official Default (eskul-coding-aliks)
  const handleResetConfig = async () => {
    const def = resetStoredFirebaseConfig();
    setFirebaseConfig(def);
    setIsTestingConnection(true);
    try {
      const res = await testConnection();
      setConnectionTestResult(res);
      onRefreshStudents();
      setNotification({ type: 'success', message: 'Kredensial dikembalikan ke default resmi (eskul-coding-aliks) & disinkronkan!' });
    } catch (e: any) {
      setConnectionTestResult({ success: false, message: e?.message || 'Gagal menguji koneksi setelah reset' });
    } finally {
      setIsTestingConnection(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      saveStoredFirebaseConfig(firebaseConfig);
      const res = await testConnection();
      setConnectionTestResult(res);
      if (res.success) {
        onRefreshStudents();
      }
    } catch (e: any) {
      setConnectionTestResult({ success: false, message: e.message || 'Gagal mengetes koneksi' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Yakin ingin membersihkan dan menghapus seluruh data siswa dari database?')) {
      try {
        for (const st of students) {
          await deleteStudentById(st.id);
        }
        clearAllLocalDemoData();
        onRefreshStudents();
        setNotification({ type: 'success', message: 'Semua data siswa berhasil dibersihkan!' });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        setNotification({ type: 'error', message: err.message || 'Gagal membersihkan data' });
      }
    }
  };

  // Filter students in table
  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(searchTable.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(searchTable.toLowerCase())) ||
    (s.category && s.category.toLowerCase().includes(searchTable.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#FFFDF0] border-4 border-black neo-shadow-xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="bg-[#FFE600] border-b-4 border-black p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showCodeBadge={true} />
            <div>
              <h2 className="font-black text-xl text-black font-['Outfit',sans-serif]">
                Panel Guru & Admin Lomba Koding 2026
              </h2>
              <p className="text-xs font-bold text-black/80">
                SD Islam Al Ikhlas • Manajemen Peserta, Ide Proyek, Modul & SB3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-[#FF6B97] hover:text-white text-black border-2 border-black neo-shadow-sm flex items-center justify-center font-black neo-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className={`p-3 px-4 border-b-3 border-black text-xs sm:text-sm font-black flex items-center justify-between ${
            notification.type === 'success' ? 'bg-[#35E88E] text-black' : 'bg-[#FF4D4D] text-white'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="font-bold underline text-xs">Tutup</button>
          </div>
        )}

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#FFFDF0]">
            <div className="bg-white border-4 border-black neo-shadow-lg p-6 sm:p-8 max-w-md w-full">
              <div className="w-14 h-14 bg-[#FF6B97] border-3 border-black neo-shadow-sm flex items-center justify-center text-2xl mx-auto mb-4 text-white">
                🔒
              </div>
              
              <h3 className="text-2xl font-black text-center text-black font-['Outfit',sans-serif] mb-1">
                Akses Khusus Guru & Admin
              </h3>
              <p className="text-xs font-bold text-center text-black/70 mb-6">
                Masukkan kata sandi resmi panitia lomba koding untuk mengelola ide, modul PDF, dan file .sb3 siswa.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                    Kata Sandi Admin:
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan sandi..."
                    className="w-full px-4 py-3 bg-[#FFFDF0] border-3 border-black neo-shadow-sm text-black font-bold focus:outline-none focus:ring-4 focus:ring-black"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-[#FF4D4D] text-white border-2 border-black text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-base border-3 border-black neo-shadow neo-btn cursor-pointer"
                >
                  Masuk ke Panel Admin 🚀
                </button>
              </form>

              <div className="mt-6 pt-4 border-t-2 border-black/10 text-center">
                <span className="text-[11px] font-bold text-black/60 bg-[#FFF59D] px-2 py-1 border border-black inline-block">
                  Petunjuk: Sandi resmi adalah bajuri39, mrrohman, atau msima
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN INTERFACE */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FFFDF0]">
            
            {/* Admin Tabs */}
            <div className="bg-white border-b-3 border-black px-4 pt-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2 font-black text-xs sm:text-sm border-2 border-black neo-btn ${
                    activeTab === 'list' 
                      ? 'bg-[#38BDF8] text-black neo-shadow-sm translate-y-[-2px]' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                  }`}
                >
                  📋 Daftar Siswa & Proyek ({students.length})
                </button>
                <button
                  onClick={handleNewStudentClick}
                  className={`px-4 py-2 font-black text-xs sm:text-sm border-2 border-black neo-btn ${
                    activeTab === 'form' 
                      ? 'bg-[#35E88E] text-black neo-shadow-sm translate-y-[-2px]' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                  }`}
                >
                  ➕ {editingStudentId ? 'Edit Siswa' : 'Tambah Siswa & Proyek'}
                </button>
                <button
                  onClick={() => setActiveTab('batch')}
                  className={`px-4 py-2 font-black text-xs sm:text-sm border-2 border-black neo-btn flex items-center gap-1.5 ${
                    activeTab === 'batch' 
                      ? 'bg-[#FFE600] text-black neo-shadow-sm translate-y-[-2px]' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📥 Unggah Banyak File / Batch</span>
                </button>
                <button
                  onClick={() => setActiveTab('firebase')}
                  className={`px-4 py-2 font-black text-xs sm:text-sm border-2 border-black neo-btn ${
                    activeTab === 'firebase' 
                      ? 'bg-[#FF6B97] text-white neo-shadow-sm translate-y-[-2px]' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                  }`}
                >
                  ⚙️ Pengaturan Firebase
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                {students.length > 0 && (
                  <button
                    onClick={handleClearAllData}
                    title="Bersihkan semua data siswa dari database"
                    className="px-2.5 py-1.5 bg-[#FF6B97] hover:bg-pink-500 text-white font-extrabold text-xs border border-black neo-shadow-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Bersihkan Data</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT 1: DAFTAR SISWA (CRUD) */}
            {activeTab === 'list' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-black/50" />
                    <input
                      type="text"
                      value={searchTable}
                      onChange={(e) => setSearchTable(e.target.value)}
                      placeholder="Cari siswa atau kelas..."
                      className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black text-xs sm:text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab('batch')}
                      className="px-4 py-2 bg-[#FFE600] hover:bg-yellow-300 text-black font-black text-xs sm:text-sm border-2 border-black neo-shadow-sm neo-btn flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Unggah Banyak File / Batch</span>
                    </button>
                    <button
                      onClick={handleNewStudentClick}
                      className="px-4 py-2 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-xs sm:text-sm border-2 border-black neo-shadow-sm neo-btn flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Peserta Baru</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="border-3 border-black neo-shadow-sm bg-white overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#FFE600] border-b-3 border-black text-black font-black uppercase text-[11px] sm:text-xs">
                        <th className="p-3 border-r-2 border-black">No</th>
                        <th className="p-3 border-r-2 border-black">Nama Siswa</th>
                        <th className="p-3 border-r-2 border-black">Kelas & Kategori</th>
                        <th className="p-3 border-r-2 border-black">Ide Proyek Scratch</th>
                        <th className="p-3 border-r-2 border-black text-center">Modul (PDF)</th>
                        <th className="p-3 border-r-2 border-black text-center">Proyek (.SB3)</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold divide-y-2 divide-black">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-black/60 bg-[#FFFDF0]">
                            Tidak ada data siswa yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-[#FFF59D]/40 transition-colors">
                            <td className="p-3 border-r-2 border-black font-black text-center w-12">
                              {idx + 1}
                            </td>
                            <td className="p-3 border-r-2 border-black font-black text-black">
                              {st.studentName}
                            </td>
                            <td className="p-3 border-r-2 border-black text-xs">
                              <div className="font-black text-black">{st.grade || '-'}</div>
                              <div className="text-black/70 text-[11px]">{st.category || 'Scratch Game'}</div>
                            </td>
                            <td className="p-3 border-r-2 border-black max-w-xs truncate text-xs text-black/80" title={st.competitionIdea}>
                              {st.competitionIdea}
                            </td>
                            <td className="p-3 border-r-2 border-black text-center">
                              {st.moduleUrl ? (
                                <span className="inline-flex items-center gap-1 bg-[#35E88E] text-black text-[10px] font-black px-2 py-0.5 border border-black">
                                  <Check className="w-3 h-3" /> Ada Modul
                                </span>
                              ) : (
                                <span className="text-[10px] text-black/50 font-bold">Kosong</span>
                              )}
                            </td>
                            <td className="p-3 border-r-2 border-black text-center">
                              {st.sb3FileUrl ? (
                                <span className="inline-flex items-center gap-1 bg-[#38BDF8] text-black text-[10px] font-black px-2 py-0.5 border border-black">
                                  <Check className="w-3 h-3" /> Ada .SB3
                                </span>
                              ) : (
                                <span className="text-[10px] text-black/50 font-bold">Kosong</span>
                              )}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    onViewStudent(st);
                                    onClose();
                                  }}
                                  title="Tinjau sebagai Tampilan Siswa"
                                  className="p-1.5 bg-[#FFF59D] hover:bg-yellow-400 border border-black neo-shadow-sm neo-btn text-black"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditClick(st)}
                                  title="Edit Data Siswa"
                                  className="p-1.5 bg-[#38BDF8] hover:bg-sky-400 border border-black neo-shadow-sm neo-btn text-black"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(st.id, st.studentName)}
                                  title="Hapus Data Siswa"
                                  className="p-1.5 bg-[#FF6B97] hover:bg-pink-500 border border-black neo-shadow-sm neo-btn text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-xs font-bold text-black/70 flex items-center justify-between">
                  <span>Total {students.length} peserta terdaftar di database.</span>
                  <span>Data langsung sinkron ke halaman siswa.</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: FORM TAMBAH / EDIT SISWA & PROYEK */}
            {activeTab === 'form' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto bg-white border-4 border-black neo-shadow-lg p-6">
                  
                  <div className="flex items-center justify-between pb-4 mb-6 border-b-3 border-black">
                    <div>
                      <h3 className="text-xl font-black text-black font-['Outfit',sans-serif]">
                        {editingStudentId ? 'Edit Data & Proyek Siswa' : 'Tambah Siswa & Proyek Baru'}
                      </h3>
                      <p className="text-xs font-bold text-black/70">
                        Isi nama, ide proyek, upload modul PDF dan file .sb3 untuk langsung tampil di halaman siswa.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('list')}
                      className="text-xs font-black underline"
                    >
                      Kembali ke Daftar
                    </button>
                  </div>

                  <form onSubmit={handleSubmitStudent} className="space-y-5">
                    
                    {/* Row 1: Nama & Kelas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black uppercase text-black mb-1">
                          Nama Lengkap / Panggilan Siswa: *
                        </label>
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Contoh: Ahmad Fauzan"
                          className="w-full px-3 py-2.5 bg-[#FFFDF0] border-2 border-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-black mb-1">
                          Kelas:
                        </label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#FFFDF0] border-2 border-black font-bold text-sm focus:outline-none"
                        >
                          {!GRADE_OPTIONS.includes(grade) && grade && (
                            <option value={grade}>{grade}</option>
                          )}
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Kategori Lomba */}
                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">
                        Kategori Proyek:
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Contoh: Game Petualangan Edukasi, Animasi Cerita, Kuis Koding"
                        className="w-full px-3 py-2.5 bg-[#FFFDF0] border-2 border-black font-bold text-sm focus:outline-none"
                      />
                    </div>

                    {/* Textarea: Deskripsi / Ide Lomba */}
                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">
                        Deskripsi / Ide Lomba Siswa: *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={competitionIdea}
                        onChange={(e) => setCompetitionIdea(e.target.value)}
                        placeholder="Tuliskan alur cerita game, mekanisme interaksi sprite Scratch, skor, dan pesan islami/edukasi proyek siswa ini..."
                        className="w-full p-3 bg-[#FFFDF0] border-2 border-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* File Input 1: Modul PDF */}
                    <div className="p-4 bg-[#35E88E]/20 border-2 border-black">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-black uppercase text-black">
                          1. Berkas Modul Pembelajaran (PDF):
                        </label>
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 border border-black text-black">
                          Upload PDF atau Tempel Link Drive
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className={`cursor-pointer px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black neo-shadow-sm font-black text-xs flex items-center gap-2 ${
                            isUploadingModule ? 'opacity-75 cursor-wait' : ''
                          }`}>
                            <Upload className="w-4 h-4" />
                            <span>
                              {isUploadingModule 
                                ? `Mengunggah (${uploadModuleProgress}%)...` 
                                : (moduleFileName ? 'Ganti File PDF Modul' : 'Pilih File PDF Modul')}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleModuleFileUpload}
                              className="hidden"
                              disabled={isUploadingModule}
                            />
                          </label>

                          {moduleFileName && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-black text-xs font-bold text-black">
                              <span className="truncate max-w-[200px]">📄 {moduleFileName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setModuleUrl('');
                                  setModuleFileName('');
                                }}
                                className="text-red-600 hover:text-red-800 font-black ml-1 text-xs"
                                title="Hapus berkas modul"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={moduleUrl}
                            onChange={(e) => setModuleUrl(e.target.value)}
                            placeholder="Atau tempelkan link Google Drive Modul (atur: Siapa saja yang memiliki link)..."
                            className="w-full px-3 py-1.5 bg-white border border-black font-bold text-xs"
                          />
                          <p className="text-[10px] font-bold text-black/70 mt-1">
                            💡 Format didukung: File PDF (otomatis ke Firestore), Link Google Drive, atau Link PDF langsung.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* File Input 2: File Scratch .sb3 */}
                    <div className="p-4 bg-[#38BDF8]/20 border-2 border-black">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-black uppercase text-black">
                          2. File Proyek Scratch (.sb3):
                        </label>
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 border border-black text-black">
                          Upload .sb3 atau Link/ID Scratch
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className={`cursor-pointer px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black neo-shadow-sm font-black text-xs flex items-center gap-2 ${
                            isUploadingSb3 ? 'opacity-75 cursor-wait' : ''
                          }`}>
                            <Upload className="w-4 h-4" />
                            <span>
                              {isUploadingSb3 
                                ? `Mengunggah (${uploadSb3Progress}%)...` 
                                : (sb3FileName ? 'Ganti File .sb3 Scratch' : 'Pilih File .sb3 Scratch')}
                            </span>
                            <input
                              type="file"
                              accept=".sb3,.sb2,.zip"
                              onChange={handleSb3FileUpload}
                              className="hidden"
                              disabled={isUploadingSb3}
                            />
                          </label>

                          {sb3FileName && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-black text-xs font-bold text-black">
                              <span className="truncate max-w-[200px]">🐱 {sb3FileName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSb3Url('');
                                  setSb3FileName('');
                                }}
                                className="text-red-600 hover:text-red-800 font-black ml-1 text-xs"
                                title="Hapus berkas scratch"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={sb3Url}
                            onChange={(e) => setSb3Url(e.target.value)}
                            placeholder="Atau tempel link/ID Scratch (contoh: https://scratch.mit.edu/projects/12345678) atau link Google Drive..."
                            className="w-full px-3 py-1.5 bg-white border border-black font-bold text-xs"
                          />
                          <p className="text-[10px] font-bold text-black/70 mt-1">
                            💡 Format didukung: Unggah langsung file .sb3 (tersimpan aman ke database), tautan Google Drive, atau ID Scratch resmi.
                          </p>
                          <p className="text-[10px] font-bold text-black/80 mt-0.5">
                            ⚡ Otomatis dapat dimainkan di TurboWarp dan diunduh sebagai format resmi <strong>.sb3</strong> (tidak akan menjadi file .zip!).
                          </p>
                          <p className="text-[10px] font-bold text-amber-800 mt-0.5">
                            ⚠️ Jika menggunakan Google Drive: Pastikan izin file disetel ke <u>"Siapa saja yang memiliki link"</u>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                      <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className="px-4 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black font-bold text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#FFE600] hover:bg-yellow-300 text-black border-3 border-black neo-shadow neo-btn font-black text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Data Siswa & Proyek'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT: UNGGAH BANYAK FILE / BATCH SISWA */}
            {activeTab === 'batch' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Header info */}
                  <div className="bg-[#FFE600] border-3 border-black neo-shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Upload className="w-5 h-5 text-black" />
                      <h3 className="text-lg font-black text-black font-['Outfit',sans-serif]">
                        Unggah File Siswa & Sinkronisasi Realtime
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-black/80">
                      Unggah banyak file <strong>.sb3</strong> Scratch sekaligus atau impor daftar nama siswa. Data akan langsung terhubung secara realtime ke database dan langsung tampil di halaman pencarian peserta.
                    </p>
                  </div>

                  {/* Section 1: Upload Multiple .sb3 Scratch Files */}
                  <div className="bg-white border-3 border-black neo-shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-black pb-3">
                      <div>
                        <h4 className="font-black text-sm text-black flex items-center gap-2">
                          <span className="text-base">🐱</span>
                          <span>1. Unggah Banyak File Scratch (.sb3) Sekaligus</span>
                        </h4>
                        <p className="text-xs text-black/70 mt-0.5">
                          Nama siswa dan kelas akan otomatis diekstrak dari nama file (contoh: <code>Bianca_5A.sb3</code>, <code>Arga_Game.sb3</code>, <code>Abi.sb3</code>).
                        </p>
                      </div>
                      <span className="bg-[#35E88E] text-black text-[11px] font-black px-2 py-0.5 border border-black shrink-0">
                        OTOMATIS SINKRON
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-black text-black block mb-1">Kelas Default (jika tidak ada di nama file):</label>
                        <select
                          value={batchDefaultGrade}
                          onChange={(e) => setBatchDefaultGrade(e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-black font-bold text-xs"
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-black text-black block mb-1">Kategori Default:</label>
                        <select
                          value={batchDefaultCategory}
                          onChange={(e) => setBatchDefaultCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-black font-bold text-xs"
                        >
                          <option value="Game Interaktif">Game Interaktif</option>
                          <option value="Animasi & Cerita">Animasi & Cerita</option>
                          <option value="Simulasi Edukasi">Simulasi Edukasi</option>
                          <option value="Karya Islami">Karya Islami</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-3 border-dashed border-black p-6 bg-[#FFFDF0] text-center hover:bg-[#FFF59D]/30 transition-colors">
                      <input
                        type="file"
                        id="batch-sb3-input"
                        multiple
                        accept=".sb3,.zip"
                        onChange={handleBatchSb3Upload}
                        disabled={isBatchProcessing}
                        className="hidden"
                      />
                      <label
                        htmlFor="batch-sb3-input"
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#38BDF8] hover:bg-sky-400 text-black font-black text-sm border-2 border-black neo-shadow-sm neo-btn cursor-pointer ${
                          isBatchProcessing ? 'opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Pilih Beberapa File .SB3 Siswa</span>
                      </label>
                      <p className="text-[11px] font-bold text-black/60 mt-2">
                        💡 Bisa pilih sekaligus banyak file (tekan Ctrl/Cmd + klik semua file .sb3 siswa)
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Import Roster / Name List */}
                  <div className="bg-white border-3 border-black neo-shadow-sm p-5 space-y-4">
                    <div className="border-b-2 border-black pb-3">
                      <h4 className="font-black text-sm text-black flex items-center gap-2">
                        <span className="text-base">📋</span>
                        <span>2. Impor Daftar Nama Siswa (Teks / CSV)</span>
                      </h4>
                      <p className="text-xs text-black/70 mt-0.5">
                        Ketik atau tempel daftar nama siswa (satu siswa per baris). Format opsional: <code>Nama Siswa, Kelas, Ide</code>
                      </p>
                    </div>

                    <textarea
                      value={pasteRosterText}
                      onChange={(e) => setPasteRosterText(e.target.value)}
                      placeholder={`Contoh tempel:\nBianca, Kelas 5A, Game Petualangan Labirin\nArga, Kelas 5A, Game Balap Mobil\nAbi, Kelas 5A, Game Pembersih Sampah\nFathiya, Kelas 5A, Animasi Islami\nAriza, Kelas 5A, Quiz Matematika Seru\nSyifa, Kelas 5A, Game Tangkap Buah`}
                      rows={5}
                      className="w-full p-3 bg-[#FFFDF0] border-2 border-black font-mono text-xs font-bold text-black focus:outline-none"
                    />

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] font-bold text-black/60">
                        {pasteRosterText.split('\n').filter(l => l.trim()).length} baris siswa terdeteksi
                      </span>
                      <button
                        type="button"
                        onClick={handleImportRosterText}
                        disabled={isBatchProcessing || !pasteRosterText.trim()}
                        className="px-5 py-2.5 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Impor & Daftarkan ke Database Realtime 🚀</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress & Log section */}
                  {isBatchProcessing && (
                    <div className="bg-[#FFE600] border-3 border-black p-4 neo-shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-black">
                        <span>{batchStatusText}</span>
                        <span>{batchProgress}%</span>
                      </div>
                      <div className="w-full bg-white h-4 border-2 border-black overflow-hidden">
                        <div
                          className="bg-[#35E88E] h-full transition-all duration-200"
                          style={{ width: `${batchProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Batch Result Logs */}
                  {batchLog.length > 0 && (
                    <div className="bg-white border-3 border-black p-4 neo-shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-xs text-black uppercase tracking-wider">
                          Riwayat Proses Terakhir ({batchLog.length} item):
                        </h4>
                        <button
                          type="button"
                          onClick={() => setBatchLog([])}
                          className="text-[10px] font-bold underline text-black/60 cursor-pointer"
                        >
                          Bersihkan Log
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                        {batchLog.map((log, i) => (
                          <div
                            key={i}
                            className={`p-2 border border-black flex items-center justify-between ${
                              log.status === 'success' ? 'bg-[#35E88E]/20 text-black' : 'bg-[#FF4D4D]/20 text-black'
                            }`}
                          >
                            <span className="font-bold">{log.name}</span>
                            <span className="text-[11px] font-bold">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB CONTENT 3: PENGATURAN FIREBASE (CONFIG PLACEHOLDER & TEST) */}
            {activeTab === 'firebase' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto bg-white border-4 border-black neo-shadow-lg p-6">
                  
                  <div className="pb-4 mb-6 border-b-3 border-black flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-black font-['Outfit',sans-serif]">
                        Konfigurasi Firebase Web SDK
                      </h3>
                      <p className="text-xs font-bold text-black/70">
                        Atur kredensial Firebase Firestore & Storage untuk sinkronisasi cloud waktu nyata.
                      </p>
                    </div>

                    <div className={`px-3 py-1 text-xs font-black border-2 border-black ${
                      isFirebaseLive ? 'bg-[#35E88E] text-black' : 'bg-[#FFF59D] text-black'
                    }`}>
                      {isFirebaseLive ? 'Status: Firebase Terhubung' : 'Status: Mode Demo / Offline DB'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-black/80 bg-[#FFFDF0] p-3 border-2 border-black">
                      ℹ️ Aplikasi ini telah dirancang dengan arsitektur <strong>Modular Firebase v9/v10</strong>. 
                      Anda dapat memasukkan kredensial proyek Firebase Anda di form bawah ini atau langsung menggantinya di file <code>src/services/firebase.ts</code>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-black text-black block mb-1">API Key:</label>
                        <input
                          type="text"
                          value={firebaseConfig.apiKey}
                          onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                          className="w-full p-2 bg-[#FFFDF0] border-2 border-black font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-black text-black block mb-1">Project ID:</label>
                        <input
                          type="text"
                          value={firebaseConfig.projectId}
                          onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                          className="w-full p-2 bg-[#FFFDF0] border-2 border-black font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-black text-black block mb-1">Auth Domain:</label>
                        <input
                          type="text"
                          value={firebaseConfig.authDomain}
                          onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                          className="w-full p-2 bg-[#FFFDF0] border-2 border-black font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-black text-black block mb-1">Storage Bucket:</label>
                        <input
                          type="text"
                          value={firebaseConfig.storageBucket}
                          onChange={(e) => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                          className="w-full p-2 bg-[#FFFDF0] border-2 border-black font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-black text-black block mb-1">Messaging Sender ID:</label>
                        <input
                          type="text"
                          value={firebaseConfig.messagingSenderId}
                          onChange={(e) => setFirebaseConfig({ ...firebaseConfig, messagingSenderId: e.target.value })}
                          className="w-full p-2 bg-[#FFFDF0] border-2 border-black font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-black text-black block mb-1">App ID:</label>
                        <input
                          type="text"
                          value={firebaseConfig.appId}
                          onChange={(e) => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })}
                          className="w-full p-2 bg-[#FFFDF0] border-2 border-black font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Test Connection Button & Result */}
                    <div className="pt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        className="px-4 py-2 bg-[#35E88E] hover:bg-emerald-400 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
                      >
                        Simpan Kredensial
                      </button>

                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="px-4 py-2 bg-[#FFE600] hover:bg-yellow-300 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                        <span>{isTestingConnection ? 'Menguji...' : 'Uji Koneksi Firestore'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetConfig}
                        disabled={isTestingConnection}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black font-black text-xs border-2 border-black neo-shadow-sm neo-btn cursor-pointer"
                      >
                        Reset Default Resmi
                      </button>
                    </div>

                    {connectionTestResult && (
                      <div className={`p-3 border-2 border-black text-xs font-bold ${
                        connectionTestResult.success ? 'bg-[#35E88E] text-black' : 'bg-[#FFF59D] text-black'
                      }`}>
                        <strong>Hasil Uji:</strong> {connectionTestResult.message}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
