import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  Award,
  Users,
  Printer,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dasbor Analitik',
      icon: LayoutDashboard,
      description: 'Tren & grafik kehadiran visual',
    },
    {
      id: 'input_monthly' as ActiveTab,
      label: 'Input Presensi Perbulan',
      icon: CalendarCheck,
      description: 'Input cepat rekap bulanan',
      highlight: true,
    },
    {
      id: 'recap_monthly' as ActiveTab,
      label: 'Rekap Perbulan',
      icon: CalendarDays,
      description: 'Matriks harian & ekspor bulanan',
    },
    {
      id: 'recap_semester' as ActiveTab,
      label: 'Rekap Persemester',
      icon: FileSpreadsheet,
      description: 'Semester Ganjil & Genap',
    },
    {
      id: 'recap_yearly' as ActiveTab,
      label: 'Rekap Pertahun',
      icon: Award,
      description: 'Akumulasi T.A. 2026/2027',
    },
    {
      id: 'students' as ActiveTab,
      label: 'Data Kelas & Murid',
      icon: Users,
      description: 'Tambah kelas & siswa',
    },
    {
      id: 'print_official' as ActiveTab,
      label: 'Cetak Dokumen Resmi',
      icon: Printer,
      description: 'Kop Madrasah & 3 TTD',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Utama Presensi
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              />
              <div className="truncate">
                <div className="whitespace-nowrap">{item.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Role Notice Card */}
      <div className="p-4 m-3 mt-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Status Akses</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Masuk sebagai: <strong className="text-slate-900">{currentUser.name}</strong>
        </p>
        <p className="text-slate-500 text-[11px]">
          {currentUser.title}
        </p>
      </div>
    </aside>
  );
};
