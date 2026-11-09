import React from 'react';
import { SchoolInfo, UserProfile } from '../types';
import { UserCheck, Shield, BookOpen, School, Calendar, ArrowRightLeft } from 'lucide-react';

interface HeaderProps {
  schoolInfo: SchoolInfo;
  currentUser: UserProfile;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolInfo,
  currentUser,
  onOpenLoginModal,
}) => {
  // Format role label and icon
  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'kepala_madrasah':
        return {
          label: 'Kepala Madrasah',
          icon: <Shield className="w-3.5 h-3.5 text-amber-600" />,
          color: 'text-amber-900 bg-amber-50 border-amber-200',
        };
      case 'kepala_tu':
        return {
          label: 'Kepala Tata Usaha',
          icon: <School className="w-3.5 h-3.5 text-blue-600" />,
          color: 'text-blue-900 bg-blue-50 border-blue-200',
        };
      case 'guru_wali_kelas':
        return {
          label: currentUser.title,
          icon: <BookOpen className="w-3.5 h-3.5 text-emerald-600" />,
          color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
        };
      default:
        return {
          label: 'Guru Piket',
          icon: <UserCheck className="w-3.5 h-3.5 text-slate-600" />,
          color: 'text-slate-900 bg-slate-100 border-slate-200',
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone: 1-line text/logo lockup */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={schoolInfo.logoUrl}
              alt="Logo MTs Al Hidayah Tajur"
              className="w-10 h-10 object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight whitespace-nowrap">
                  SIAP MTs Al Hidayah Tajur
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 whitespace-nowrap">
                  T.A. {schoolInfo.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">
                {schoolInfo.foundation}
              </p>
            </div>
          </div>

          {/* Center Information / Context */}
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Right Action: Current User & Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {roleBadge.label}
              </div>
            </div>

            <button
              onClick={onOpenLoginModal}
              title="Ganti Akun / Masuk sebagai Guru, Kepala TU, atau Kepala Madrasah"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti Akun</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
