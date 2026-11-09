import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { Shield, School, BookOpen, UserCheck, X, Check, Lock } from 'lucide-react';

interface UserLoginModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [password, setPassword] = useState<string>('••••••');

  if (!isOpen) return null;

  const handleApply = (user: UserProfile) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">
              Sistem Login & Ganti Pengguna
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Pilih akun Guru, Kepala Tata Usaha, atau Kepala Madrasah
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Akun Pejabat & Guru Tersedia
          </div>

          <div className="space-y-2">
            {INITIAL_USERS.map((user) => {
              const isSelected = currentUser.id === user.id;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleApply(user)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        user.role === 'kepala_madrasah'
                          ? 'bg-amber-100 text-amber-800'
                          : user.role === 'kepala_tu'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.role === 'kepala_madrasah' ? (
                        <Shield className="w-4 h-4" />
                      ) : user.role === 'kepala_tu' ? (
                        <School className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {user.title} {user.nip ? `· NIP: ${user.nip}` : ''}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Akses cepat multi-peran disesuaikan dengan wewenang input guru dan monitoring pimpinan.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
