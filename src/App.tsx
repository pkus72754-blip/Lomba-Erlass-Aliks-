/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SearchStudent } from './components/SearchStudent';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { Student } from './types';
import { 
  subscribeToStudents,
  initializeFirebaseServices,
  fetchAllStudents
} from './services/firebase';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);

  // Pasang listener realtime Firestore
  useEffect(() => {
    setIsLoading(true);
    const { isLive } = initializeFirebaseServices();
    setIsFirebaseLive(isLive);

    const unsubscribe = subscribeToStudents(
      (liveStudents, meta) => {
        setStudents(liveStudents);
        setIsLoading(false);
        setIsFirebaseLive(meta ? meta.isLive : true);

        // Jika siswa sedang dibuka, perbarui datanya secara realtime
        setSelectedStudent((currentSelected) => {
          if (!currentSelected) return null;
          const fresh = liveStudents.find(s => s.id === currentSelected.id);
          return fresh || currentSelected;
        });
      },
      (err) => {
        console.warn('Realtime sync fallback:', err);
        setIsLoading(false);
        setIsFirebaseLive(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    const res = await fetchAllStudents();
    setStudents(res.students);
    setIsFirebaseLive(res.source === 'firestore');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF0] text-black font-['Lexend',sans-serif]">
      
      {/* Top Header */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        isFirebaseLive={isFirebaseLive}
        onResetSearch={() => setSelectedStudent(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedStudent ? (
          /* Student Portal & Project Dashboard */
          <StudentDashboard
            student={selectedStudent}
            onBackToSearch={() => setSelectedStudent(null)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        ) : (
          /* Landing Page: Hero & Search Siswa */
          <>
            <HeroSection
              totalStudents={students.length}
              onExploreClick={() => {
                const el = document.getElementById('search-container');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Student Search Component */}
            <div id="search-container">
              <SearchStudent
                students={students}
                onSelectStudent={(st) => setSelectedStudent(st)}
                isLoading={isLoading}
                isFirebaseLive={isFirebaseLive}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer Wajib: @copyright Pak GuruAI */}
      <Footer />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        students={students}
        onRefreshStudents={handleRefresh}
        onViewStudent={(st) => setSelectedStudent(st)}
        isFirebaseLive={isFirebaseLive}
      />

    </div>
  );
}
