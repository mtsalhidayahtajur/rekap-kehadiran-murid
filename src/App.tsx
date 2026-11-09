import React, { useState } from 'react';
import { ActiveTab, ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student, UserProfile } from './types';
import {
  getStoredClasses,
  getStoredCurrentUser,
  getStoredMonthlyAttendance,
  getStoredSchoolInfo,
  getStoredStudents,
  resetAllDataToDefault,
  saveClasses,
  saveCurrentUser,
  saveMonthlyAttendance,
  saveStudents,
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { MonthlyAttendanceInput } from './components/MonthlyAttendanceInput';
import { MonthlyRecap } from './components/MonthlyRecap';
import { SemesterRecap } from './components/SemesterRecap';
import { YearlyRecap } from './components/YearlyRecap';
import { StudentManagement } from './components/StudentManagement';
import { OfficialPrintDocument } from './components/OfficialPrintDocument';
import { UserLoginModal } from './components/UserLoginModal';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(getStoredSchoolInfo());
  const [classes, setClasses] = useState<ClassInfo[]>(getStoredClasses());
  const [students, setStudents] = useState<Student[]>(getStoredStudents());
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendanceRecord[]>(
    getStoredMonthlyAttendance()
  );
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredCurrentUser());

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Print view custom parameters
  const [printParams, setPrintParams] = useState<{
    periodType: 'Bulanan' | 'Semester' | 'Tahunan';
    periodLabel: string;
    classId: string;
  } | undefined>(undefined);

  // Save monthly attendance records
  const handleSaveMonthlyAttendance = (newRecords: MonthlyAttendanceRecord[]) => {
    setMonthlyAttendance((prev) => {
      const map = new Map<string, MonthlyAttendanceRecord>();
      prev.forEach((r) => map.set(r.id, r));
      newRecords.forEach((r) => map.set(r.id, r));
      const updated = Array.from(map.values());
      saveMonthlyAttendance(updated);
      return updated;
    });
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => {
      const updated = [...prev, newStudent];
      saveStudents(updated);
      return updated;
    });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      saveStudents(updated);
      return updated;
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      saveStudents(updated);
      return updated;
    });
  };

  const handleAddClass = (newClass: ClassInfo) => {
    setClasses((prev) => {
      const updated = [...prev, newClass];
      saveClasses(updated);
      return updated;
    });
  };

  const handleUpdateClass = (updatedClass: ClassInfo) => {
    setClasses((prev) => {
      const updated = prev.map((c) => (c.id === updatedClass.id ? updatedClass : c));
      saveClasses(updated);
      return updated;
    });
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== classId);
      saveClasses(updated);
      return updated;
    });
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    saveCurrentUser(user);
  };

  const handleOpenPrintOfficial = (params: {
    periodType: 'Bulanan' | 'Semester' | 'Tahunan';
    periodLabel: string;
    classId: string;
  }) => {
    setPrintParams(params);
    setActiveTab('print_official');
  };

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang semua data presensi ke data bawaan awal MTs Al Hidayah Tajur T.A. 2026/2027?'
      )
    ) {
      resetAllDataToDefault();
      setSchoolInfo(getStoredSchoolInfo());
      setClasses(getStoredClasses());
      setStudents(getStoredStudents());
      setMonthlyAttendance(getStoredMonthlyAttendance());
      setCurrentUser(getStoredCurrentUser());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      
      {/* Top Header */}
      <Header
        schoolInfo={schoolInfo}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          currentUser={currentUser}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardAnalytics
              schoolInfo={schoolInfo}
              classes={classes}
              students={students}
              monthlyAttendance={monthlyAttendance}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'input_monthly' && (
            <MonthlyAttendanceInput
              schoolInfo={schoolInfo}
              classes={classes}
              students={students}
              monthlyAttendance={monthlyAttendance}
              currentUser={currentUser}
              onSaveMonthlyAttendance={handleSaveMonthlyAttendance}
            />
          )}

          {activeTab === 'recap_monthly' && (
            <MonthlyRecap
              schoolInfo={schoolInfo}
              classes={classes}
              students={students}
              monthlyAttendance={monthlyAttendance}
              onOpenPrintOfficial={handleOpenPrintOfficial}
            />
          )}

          {activeTab === 'recap_semester' && (
            <SemesterRecap
              schoolInfo={schoolInfo}
              classes={classes}
              students={students}
              monthlyAttendance={monthlyAttendance}
              onOpenPrintOfficial={handleOpenPrintOfficial}
            />
          )}

          {activeTab === 'recap_yearly' && (
            <YearlyRecap
              schoolInfo={schoolInfo}
              classes={classes}
              students={students}
              monthlyAttendance={monthlyAttendance}
              onOpenPrintOfficial={handleOpenPrintOfficial}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement
              classes={classes}
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeTab === 'print_official' && (
            <OfficialPrintDocument
              schoolInfo={schoolInfo}
              classes={classes}
              students={students}
              monthlyAttendance={monthlyAttendance}
              initialParams={printParams}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MTs Al Hidayah Tajur</span>
            <span>·</span>
            <span>Tahun Ajaran 2026/2027</span>
            <span>·</span>
            <span className="text-slate-400">Kepala Madrasah: {schoolInfo.headmaster.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-rose-600 transition-colors"
              title="Reset data demo ke awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Tata Usaha: {schoolInfo.headOfAdmin.name}
            </span>
          </div>
        </div>
      </footer>

      {/* Login / User Profile Switcher Modal */}
      <UserLoginModal
        currentUser={currentUser}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSelectUser={handleSelectUser}
      />

    </div>
  );
}
