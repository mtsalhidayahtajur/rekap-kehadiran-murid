import React, { useState, useEffect, useMemo } from 'react';
import { ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student, UserProfile } from '../types';
import { MONTH_CONFIG_LIST } from '../data/initialData';
import {
  Save,
  CheckCheck,
  Search,
  Filter,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  FileCheck,
  Award,
} from 'lucide-react';

interface MonthlyAttendanceInputProps {
  schoolInfo: SchoolInfo;
  classes: ClassInfo[];
  students: Student[];
  monthlyAttendance: MonthlyAttendanceRecord[];
  currentUser: UserProfile;
  onSaveMonthlyAttendance: (newRecords: MonthlyAttendanceRecord[]) => void;
}

export const MonthlyAttendanceInput: React.FC<MonthlyAttendanceInputProps> = ({
  schoolInfo,
  classes,
  students,
  monthlyAttendance,
  currentUser,
  onSaveMonthlyAttendance,
}) => {
  // Default class to teacher's assigned class or 7A
  const defaultClass = useMemo(() => {
    if (currentUser.assignedClassId) return currentUser.assignedClassId;
    return classes[0]?.id || '7A';
  }, [currentUser, classes]);

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClass);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-11'); // November 2026
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync if current user changes
  useEffect(() => {
    if (currentUser.assignedClassId) {
      setSelectedClassId(currentUser.assignedClassId);
    }
  }, [currentUser]);

  const currentClassInfo = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentMonthConfig = MONTH_CONFIG_LIST.find((m) => m.key === selectedMonthKey) || MONTH_CONFIG_LIST[4];

  // Effective days for this month
  const [effectiveDays, setEffectiveDays] = useState<number>(currentMonthConfig.effectiveDays);

  // When month changes, update effectiveDays default
  useEffect(() => {
    setEffectiveDays(currentMonthConfig.effectiveDays);
  }, [selectedMonthKey, currentMonthConfig]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Local state for editing the monthly entries
  // key: studentId -> { sakit, izin, alpa, hadir, notes }
  const [entries, setEntries] = useState<
    Record<string, { sakit: number; izin: number; alpa: number; hadir: number; notes: string }>
  >({});

  // Populate local edit state from existing monthly attendance records
  useEffect(() => {
    const map: Record<
      string,
      { sakit: number; izin: number; alpa: number; hadir: number; notes: string }
    > = {};

    classStudents.forEach((st) => {
      const match = monthlyAttendance.find(
        (m) => m.studentId === st.id && m.monthKey === selectedMonthKey
      );

      if (match) {
        map[st.id] = {
          sakit: match.sakit,
          izin: match.izin,
          alpa: match.alpa,
          hadir: match.hadir,
          notes: match.notes || '',
        };
      } else {
        // Default: Full attendance
        map[st.id] = {
          sakit: 0,
          izin: 0,
          alpa: 0,
          hadir: effectiveDays,
          notes: '',
        };
      }
    });

    setEntries(map);
    setSaveSuccessMsg(null);
  }, [selectedClassId, selectedMonthKey, classStudents, monthlyAttendance, effectiveDays]);

  // Handle changing S, I, A for a student
  const handleValueChange = (
    studentId: string,
    field: 'sakit' | 'izin' | 'alpa',
    val: number
  ) => {
    const cleanVal = Math.max(0, val);
    setEntries((prev) => {
      const current = prev[studentId] || { sakit: 0, izin: 0, alpa: 0, hadir: effectiveDays, notes: '' };
      const updated = { ...current, [field]: cleanVal };
      const nonHadir = updated.sakit + updated.izin + updated.alpa;
      updated.hadir = Math.max(0, effectiveDays - nonHadir);
      return { ...prev, [studentId]: updated };
    });
  };

  // Handle direct change of Hadir
  const handleHadirChange = (studentId: string, val: number) => {
    const cleanVal = Math.max(0, Math.min(effectiveDays, val));
    setEntries((prev) => {
      const current = prev[studentId] || { sakit: 0, izin: 0, alpa: 0, hadir: effectiveDays, notes: '' };
      return {
        ...prev,
        [studentId]: {
          ...current,
          hadir: cleanVal,
        },
      };
    });
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  // Quick Action: Mark all 100% Hadir
  const handleSetAllPerfect = () => {
    const updated: Record<
      string,
      { sakit: number; izin: number; alpa: number; hadir: number; notes: string }
    > = {};
    classStudents.forEach((st) => {
      updated[st.id] = {
        sakit: 0,
        izin: 0,
        alpa: 0,
        hadir: effectiveDays,
        notes: '',
      };
    });
    setEntries(updated);
  };

  // Handle Save
  const handleSave = () => {
    const recordsToSave: MonthlyAttendanceRecord[] = classStudents.map((st) => {
      const e = entries[st.id] || { sakit: 0, izin: 0, alpa: 0, hadir: effectiveDays, notes: '' };
      return {
        id: `mar-${st.id}-${selectedMonthKey}`,
        studentId: st.id,
        classId: selectedClassId,
        monthKey: selectedMonthKey,
        effectiveDays,
        hadir: e.hadir,
        sakit: e.sakit,
        izin: e.izin,
        alpa: e.alpa,
        notes: e.notes,
        recordedBy: currentUser.name,
        updatedAt: new Date().toISOString(),
      };
    });

    onSaveMonthlyAttendance(recordsToSave);
    setSaveSuccessMsg(
      `Alhamdulillah! Rekap kehadiran ${currentClassInfo.name} untuk ${currentMonthConfig.label} berhasil disimpan.`
    );

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4500);
  };

  // Computed summary metrics
  const classSummary = useMemo(() => {
    let totalH = 0;
    let totalS = 0;
    let totalI = 0;
    let totalA = 0;

    Object.values(entries).forEach((e) => {
      totalH += e.hadir;
      totalS += e.sakit;
      totalI += e.izin;
      totalA += e.alpa;
    });

    const totalDays = classStudents.length * effectiveDays;
    const avgPct = totalDays > 0 ? (totalH / totalDays) * 100 : 0;
    const perfectStudents = Object.values(entries).filter(
      (e) => e.hadir === effectiveDays && e.sakit === 0 && e.izin === 0 && e.alpa === 0
    ).length;

    return {
      totalH,
      totalS,
      totalI,
      totalA,
      avgPct: Number(avgPct.toFixed(1)),
      perfectStudents,
    };
  }, [entries, classStudents, effectiveDays]);

  // Filtered students by search query
  const visibleStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    );
  }, [classStudents, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Class Selector Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Input Presensi Bulanan Siswa
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Perbulan (Efektif & Cepat)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Input data kehadiran siswa langsung per bulan (Hadir, Sakit, Izin, Alpa) dengan kalkulasi otomatis persentase
          </p>
        </div>

        {/* Action Button: Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Presensi Bulan Ini</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-xs text-emerald-900 font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Control Panel: Class, Month, Effective Days, Quick Actions */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        
        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rombongan Belajar (Kelas)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Wali: {c.homeroomTeacher}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bulan Periode Presensi
            </label>
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              {MONTH_CONFIG_LIST.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} ({m.semester === 'ganjil' ? 'Smt Ganjil' : 'Smt Genap'})
                </option>
              ))}
            </select>
          </div>

          {/* Effective Days Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hari Efektif Belajar (Bulan Ini)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={31}
                value={effectiveDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setEffectiveDays(val);
                }}
                className="w-20 text-xs font-bold text-center bg-white border border-slate-300 rounded-lg py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-1">
                {[20, 22, 24].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setEffectiveDays(d)}
                    className={`px-2 py-1 text-[11px] rounded border font-mono ${
                      effectiveDays === d
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Batch Button */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleSetAllPerfect}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Set Semua Hadir 100%</span>
            </button>
          </div>

        </div>

        {/* Live Summary Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Ringkasan Bulan Ini:</span>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold">
                Total Hadir: {classSummary.totalH}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                Sakit: {classSummary.totalS}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-900 border border-sky-200 font-bold">
                Izin: {classSummary.totalI}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-900 border border-rose-200 font-bold">
                Alpa: {classSummary.totalA}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Rata-rata Kelas:</span>
              <span className="text-sm font-bold font-mono text-emerald-700">
                {classSummary.avgPct}%
              </span>
            </div>
            <div className="text-slate-400">·</div>
            <div className="text-slate-500">
              Wali Kelas: <strong className="text-slate-800">{currentClassInfo.homeroomTeacher}</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari siswa berdasarkan nama atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          Menampilkan {visibleStudents.length} dari {classStudents.length} siswa ({currentClassInfo.name})
        </span>
      </div>

      {/* Monthly Attendance Spreadsheet-like Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="py-3 px-3 font-semibold text-center w-12 border-r border-slate-200">No</th>
                <th className="py-3 px-3 font-semibold w-24 border-r border-slate-200">NISN</th>
                <th className="py-3 px-3 font-semibold w-52 border-r border-slate-200">Nama Siswa</th>
                <th className="py-3 px-2 font-semibold text-center w-12 border-r border-slate-200">L/P</th>
                
                {/* Status Inputs: S, I, A */}
                <th className="py-3 px-3 font-bold text-center w-28 border-r border-slate-200 bg-amber-50/70 text-amber-950">
                  Sakit (S)
                </th>
                <th className="py-3 px-3 font-bold text-center w-28 border-r border-slate-200 bg-sky-50/70 text-sky-950">
                  Izin (I)
                </th>
                <th className="py-3 px-3 font-bold text-center w-28 border-r border-slate-200 bg-rose-50/70 text-rose-950">
                  Alpa (A)
                </th>
                
                {/* Result columns */}
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200 bg-emerald-50/70 text-emerald-950">
                  Hadir (H)
                </th>
                <th className="py-3 px-3 font-bold text-center w-28 border-r border-slate-200 bg-slate-100 text-slate-900">
                  % Kehadiran
                </th>
                <th className="py-3 px-3 font-semibold">Keterangan / Catatan Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.map((student, idx) => {
                const entry = entries[student.id] || {
                  sakit: 0,
                  izin: 0,
                  alpa: 0,
                  hadir: effectiveDays,
                  notes: '',
                };

                const percentage =
                  effectiveDays > 0 ? (entry.hadir / effectiveDays) * 100 : 100;

                const isWarning = entry.alpa > 0 || percentage < 85;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isWarning
                        ? 'bg-rose-50/30 hover:bg-rose-50/60'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-100">
                      {student.nisn}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-100">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[10px] text-slate-400">NIPD: {student.nipd}</div>
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-100">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          student.gender === 'L'
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-pink-700 bg-pink-50'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>

                    {/* Sakit (S) Stepper / Direct Input */}
                    <td className="py-2 px-2 border-r border-slate-100 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleValueChange(student.id, 'sakit', entry.sakit - 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={effectiveDays}
                          value={entry.sakit}
                          onChange={(e) =>
                            handleValueChange(student.id, 'sakit', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-10 text-center py-1 text-xs font-mono font-bold border border-slate-200 rounded focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleValueChange(student.id, 'sakit', entry.sakit + 1)}
                          className="w-6 h-6 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Izin (I) Stepper / Direct Input */}
                    <td className="py-2 px-2 border-r border-slate-100 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleValueChange(student.id, 'izin', entry.izin - 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={effectiveDays}
                          value={entry.izin}
                          onChange={(e) =>
                            handleValueChange(student.id, 'izin', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-10 text-center py-1 text-xs font-mono font-bold border border-slate-200 rounded focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleValueChange(student.id, 'izin', entry.izin + 1)}
                          className="w-6 h-6 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Alpa (A) Stepper / Direct Input */}
                    <td className="py-2 px-2 border-r border-slate-100 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleValueChange(student.id, 'alpa', entry.alpa - 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={effectiveDays}
                          value={entry.alpa}
                          onChange={(e) =>
                            handleValueChange(student.id, 'alpa', parseInt(e.target.value, 10) || 0)
                          }
                          className={`w-10 text-center py-1 text-xs font-mono font-bold border rounded focus:ring-1 focus:ring-rose-500 ${
                            entry.alpa > 0 ? 'bg-rose-100 text-rose-900 border-rose-300' : 'border-slate-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleValueChange(student.id, 'alpa', entry.alpa + 1)}
                          className="w-6 h-6 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Hadir (H) Auto-Computed */}
                    <td className="py-2 px-3 text-center border-r border-slate-100 font-mono font-bold text-emerald-800 bg-emerald-50/40">
                      <span className="text-sm">{entry.hadir}</span>
                      <span className="text-[10px] text-slate-400">/{effectiveDays}</span>
                    </td>

                    {/* % Kehadiran */}
                    <td className="py-2 px-3 text-center border-r border-slate-100">
                      <div className="font-mono font-bold text-slate-900">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentage >= 90
                              ? 'bg-emerald-500'
                              : percentage >= 80
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="Catatan khusus (misal: Sakit flu 2 hari)..."
                        value={entry.notes}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            
            {/* Table Footer Summary */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-200">
                  TOTAL KELAS & RATA-RATA:
                </td>
                <td className="py-2 px-2 text-center font-mono text-amber-900 bg-amber-100/70 border-r border-slate-200">
                  {classSummary.totalS}
                </td>
                <td className="py-2 px-2 text-center font-mono text-sky-900 bg-sky-100/70 border-r border-slate-200">
                  {classSummary.totalI}
                </td>
                <td className="py-2 px-2 text-center font-mono text-rose-900 bg-rose-100/70 border-r border-slate-200">
                  {classSummary.totalA}
                </td>
                <td className="py-2 px-2 text-center font-mono text-emerald-900 bg-emerald-100/70 border-r border-slate-200">
                  {classSummary.totalH}
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-900 bg-slate-200 border-r border-slate-200">
                  {classSummary.avgPct}%
                </td>
                <td className="py-2 px-3 text-slate-600 text-[11px]">
                  {classSummary.perfectStudents} Siswa Hadir Sempurna (100%)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer save strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Perubahan kehadiran otomatis mengupdate persentase kehadiran dan rekapan semester/tahunan.
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-[1.01] shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Presensi Bulan {currentMonthConfig.label} ({currentClassInfo.name})</span>
          </button>
        </div>
      </div>

    </div>
  );
};
