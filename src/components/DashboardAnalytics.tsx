import React, { useMemo, useState } from 'react';
import { ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student } from '../types';
import { MONTH_CONFIG_LIST } from '../data/initialData';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Filter,
  BarChart3,
  Percent,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DashboardAnalyticsProps {
  schoolInfo: SchoolInfo;
  classes: ClassInfo[];
  students: Student[];
  monthlyAttendance: MonthlyAttendanceRecord[];
  onNavigateToTab: (tab: any, params?: any) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  schoolInfo,
  classes,
  students,
  monthlyAttendance,
  onNavigateToTab,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const filteredAttendance = useMemo(() => {
    if (selectedClassId === 'all') return monthlyAttendance;
    return monthlyAttendance.filter((a) => a.classId === selectedClassId);
  }, [monthlyAttendance, selectedClassId]);

  // Overall KPI metrics
  const stats = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let totalPossible = 0;

    // We calculate from seeded/active months (Juli - November 2026)
    const activeMonths = ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
    const activeRecords = filteredAttendance.filter((r) => activeMonths.includes(r.monthKey));

    activeRecords.forEach((rec) => {
      hadir += rec.hadir;
      sakit += rec.sakit;
      izin += rec.izin;
      alpa += rec.alpa;
      totalPossible += rec.effectiveDays;
    });

    const pct = totalPossible > 0 ? (hadir / totalPossible) * 100 : 100;

    return {
      hadir,
      sakit,
      izin,
      alpa,
      totalPossible,
      pct: Number(pct.toFixed(1)),
    };
  }, [filteredAttendance]);

  // Monthly trends (Juli 2026 - Juni 2027)
  const monthlyTrends = useMemo(() => {
    return MONTH_CONFIG_LIST.map((m) => {
      const monthRecords = filteredAttendance.filter((r) => r.monthKey === m.key);
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      let totalPossible = 0;

      monthRecords.forEach((r) => {
        hadir += r.hadir;
        sakit += r.sakit;
        izin += r.izin;
        alpa += r.alpa;
        totalPossible += r.effectiveDays;
      });

      const pct = totalPossible > 0 ? (hadir / totalPossible) * 100 : 100;

      return {
        ...m,
        hadir,
        sakit,
        izin,
        alpa,
        pct: Number(pct.toFixed(1)),
      };
    });
  }, [filteredAttendance]);

  // Class comparison metrics
  const classComparison = useMemo(() => {
    return classes
      .map((cls) => {
        const classRecords = monthlyAttendance.filter((r) => r.classId === cls.id);
        let hadir = 0;
        let totalPossible = 0;

        classRecords.forEach((r) => {
          hadir += r.hadir;
          totalPossible += r.effectiveDays;
        });

        const pct = totalPossible > 0 ? (hadir / totalPossible) * 100 : 100;

        return {
          ...cls,
          attendanceRate: Number(pct.toFixed(1)),
        };
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [classes, monthlyAttendance]);

  // Students requiring special attention (Alpa >= 2 or attendance < 88%)
  const attentionStudents = useMemo(() => {
    const map = new Map<
      string,
      { student: Student; hadir: number; sakit: number; izin: number; alpa: number; totalPossible: number }
    >();

    students.forEach((s) => {
      map.set(s.id, { student: s, hadir: 0, sakit: 0, izin: 0, alpa: 0, totalPossible: 0 });
    });

    const activeMonths = ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
    monthlyAttendance
      .filter((r) => activeMonths.includes(r.monthKey))
      .forEach((rec) => {
        const entry = map.get(rec.studentId);
        if (entry) {
          entry.hadir += rec.hadir;
          entry.sakit += rec.sakit;
          entry.izin += rec.izin;
          entry.alpa += rec.alpa;
          entry.totalPossible += rec.effectiveDays;
        }
      });

    const list: Array<{
      student: Student;
      className: string;
      hadir: number;
      sakit: number;
      izin: number;
      alpa: number;
      pct: number;
    }> = [];

    map.forEach((val) => {
      const pct = val.totalPossible > 0 ? (val.hadir / val.totalPossible) * 100 : 100;
      if (val.alpa >= 2 || pct < 88) {
        const cls = classes.find((c) => c.id === val.student.classId);
        list.push({
          student: val.student,
          className: cls?.name || val.student.classId,
          hadir: val.hadir,
          sakit: val.sakit,
          izin: val.izin,
          alpa: val.alpa,
          pct: Number(pct.toFixed(1)),
        });
      }
    });

    return list.sort((a, b) => b.alpa - a.alpa || a.pct - b.pct);
  }, [students, monthlyAttendance, classes]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Filter Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dasbor Analitik Kehadiran Siswa
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
              Sistem Input Perbulan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun Pelajaran {schoolInfo.academicYear} · MTs Al Hidayah Tajur Citeureup
          </p>
        </div>

        {/* Filter per kelas & quick CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kelas ({students.length} Siswa)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.homeroomTeacher})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onNavigateToTab('input_monthly')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <span>Input Presensi Bulan Ini</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Single Elevation, Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Rata-rata Kehadiran */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata-rata Kehadiran</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.pct}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">Target $\ge 90\%$</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total {stats.hadir.toLocaleString('id-ID')} hari siswa hadir
          </div>
        </div>

        {/* Card 2: Total Siswa */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa Aktif</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {filteredStudents.length}
            </span>
            <span className="text-xs text-slate-500">Siswa ({selectedClassId === 'all' ? '6 Kelas' : '1 Kelas'})</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Laki-laki: {filteredStudents.filter((s) => s.gender === 'L').length} · Perempuan: {filteredStudents.filter((s) => s.gender === 'P').length}
          </div>
        </div>

        {/* Card 3: Sakit & Izin */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sakit & Izin (Terdokumentasi)</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {(stats.sakit + stats.izin).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              S: {stats.sakit} | I: {stats.izin}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Izin terkonfirmasi wali kelas & surat orang tua
          </div>
        </div>

        {/* Card 4: Alpa / Tanpa Keterangan */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alpa (Tanpa Keterangan)</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.alpa}
            </span>
            <span className={`text-xs font-medium ${stats.alpa > 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
              Hari Tidak Hadir
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {attentionStudents.length} siswa butuh tindak lanjut khusus
          </div>
        </div>

      </div>

      {/* Visual Analytics Sections: Monthly Trends & Class Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tren Kehadiran Bulanan (Visual Bar Chart) - Span 2 */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tren Kehadiran Bulanan (T.A. 2026/2027)
              </h2>
              <p className="text-xs text-slate-500">
                Grafik visual persentase kehadiran siswa yang diinputkan per bulan
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('recap_monthly')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Rekap Bulanan →
            </button>
          </div>

          {/* Interactive Visual Bar Representation for active months */}
          <div className="space-y-3.5 pt-1">
            {monthlyTrends.slice(0, 6).map((month) => {
              const pct = month.pct;
              const barColor =
                pct >= 95 ? 'bg-emerald-600' : pct >= 90 ? 'bg-emerald-500' : 'bg-amber-500';

              return (
                <div key={month.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{month.label}</span>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-slate-500 text-[11px]">
                        H: {month.hadir} · S: {month.sakit} · I: {month.izin} · A: {month.alpa}
                      </span>
                      <span className="font-bold text-slate-900 w-12 text-right">
                        {month.pct}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual Bar Track */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${month.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar Ketuntasan Disiplin Madrasah: Minimal 90%</span>
            <span className="text-slate-400">Semester Ganjil 2026/2027</span>
          </div>
        </div>

        {/* Perbandingan Kehadiran Antar Kelas (Ranking) */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Peringkat Kehadiran Rombel
              </h2>
              <p className="text-xs text-slate-500">
                Kedisiplinan kelas tahun berjalan
              </p>
            </div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-2.5">
            {classComparison.map((cls, idx) => (
              <div
                key={cls.id}
                className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors bg-slate-50/50"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{cls.name}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {cls.attendanceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[150px]">{cls.homeroomTeacher}</span>
                  <span>{cls.totalStudents} Siswa</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateToTab('recap_semester')}
            className="w-full text-center py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Lihat Rekapitulasi Semester Lengkap
          </button>
        </div>

      </div>

      {/* Early Warning Alert: Siswa Butuh Perhatian Khusus */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Siswa Butuh Perhatian Khusus (Wali Kelas & Guru BK)
              </h2>
              <p className="text-xs text-slate-500">
                Siswa dengan akumulasi Alpa $\ge 2$ atau tingkat kehadiran di bawah 88%
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-md">
            {attentionStudents.length} Siswa Teridentifikasi
          </span>
        </div>

        {attentionStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Alhamdulillah, seluruh siswa memiliki tingkat kehadiran di atas batas standar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">No</th>
                  <th className="py-2.5 px-3 font-semibold">NISN</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-semibold">Kelas</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Hadir</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Sakit</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Izin</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Alpa</th>
                  <th className="py-2.5 px-3 font-semibold text-center">% Kehadiran</th>
                  <th className="py-2.5 px-3 font-semibold">Tindakan Wali Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attentionStudents.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{item.student.nisn}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{item.student.name}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{item.className}</td>
                    <td className="py-2 px-3 text-center font-mono">{item.hadir}</td>
                    <td className="py-2 px-3 text-center font-mono text-amber-600">{item.sakit}</td>
                    <td className="py-2 px-3 text-center font-mono text-blue-600">{item.izin}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-rose-600">{item.alpa}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {item.pct}%
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                        {item.alpa >= 4
                          ? 'Panggilan Orang Tua Ke-2'
                          : item.alpa >= 2
                          ? 'Konseling & Kontak Orang Tua'
                          : 'Pendampingan Wali Kelas'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
