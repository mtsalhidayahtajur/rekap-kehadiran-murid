import React, { useState, useMemo } from 'react';
import { ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student } from '../types';
import { MONTH_CONFIG_LIST } from '../data/initialData';
import { exportAttendanceToExcel, exportAttendanceToPDF, RecapRowData } from '../utils/exportUtils';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

interface MonthlyRecapProps {
  schoolInfo: SchoolInfo;
  classes: ClassInfo[];
  students: Student[];
  monthlyAttendance: MonthlyAttendanceRecord[];
  onOpenPrintOfficial: (params: { periodType: 'Bulanan'; periodLabel: string; classId: string }) => void;
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({
  schoolInfo,
  classes,
  students,
  monthlyAttendance,
  onOpenPrintOfficial,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('7A');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-11');

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const currentMonthConfig = useMemo(() => {
    return MONTH_CONFIG_LIST.find((m) => m.key === selectedMonthKey) || MONTH_CONFIG_LIST[4];
  }, [selectedMonthKey]);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Build row data from monthlyAttendance
  const recapRows: RecapRowData[] = useMemo(() => {
    return classStudents.map((student, idx) => {
      const match = monthlyAttendance.find(
        (m) => m.studentId === student.id && m.monthKey === selectedMonthKey
      );

      const effectiveDays = match?.effectiveDays || currentMonthConfig.effectiveDays;
      const hadir = match?.hadir ?? effectiveDays;
      const sakit = match?.sakit ?? 0;
      const izin = match?.izin ?? 0;
      const alpa = match?.alpa ?? 0;

      const percentage = effectiveDays > 0 ? (hadir / effectiveDays) * 100 : 100;

      let keterangan = 'Sangat Baik';
      if (percentage < 75 || alpa >= 3) keterangan = 'Perlu Panggilan';
      else if (percentage < 85 || alpa >= 1) keterangan = 'Perlu Pembinaan';
      else if (percentage < 92) keterangan = 'Cukup Baik';

      return {
        no: idx + 1,
        nisn: student.nisn,
        name: student.name,
        gender: student.gender,
        hadir,
        sakit,
        izin,
        alpa,
        totalHari: effectiveDays,
        percentage: Number(percentage.toFixed(1)),
        keterangan,
      };
    });
  }, [classStudents, monthlyAttendance, selectedMonthKey, currentMonthConfig]);

  // Overall class summary stats
  const classSummary = useMemo(() => {
    const totalH = recapRows.reduce((a, b) => a + b.hadir, 0);
    const totalS = recapRows.reduce((a, b) => a + b.sakit, 0);
    const totalI = recapRows.reduce((a, b) => a + b.izin, 0);
    const totalA = recapRows.reduce((a, b) => a + b.alpa, 0);
    const avgPct =
      recapRows.length > 0
        ? recapRows.reduce((a, b) => a + b.percentage, 0) / recapRows.length
        : 0;
    const perfectCount = recapRows.filter((r) => r.percentage >= 100).length;

    return {
      totalH,
      totalS,
      totalI,
      totalA,
      avgPct: Number(avgPct.toFixed(1)),
      perfectCount,
    };
  }, [recapRows]);

  // Export handlers
  const handleExportExcel = () => {
    exportAttendanceToExcel({
      periodType: 'Bulanan',
      periodLabel: `Bulan ${currentMonthConfig.label}`,
      className: currentClass.name,
      homeroomTeacher: currentClass.homeroomTeacher,
      schoolInfo,
      rows: recapRows,
    });
  };

  const handleExportPDF = () => {
    exportAttendanceToPDF({
      periodType: 'Bulanan',
      periodLabel: `Bulan ${currentMonthConfig.label}`,
      className: currentClass.name,
      homeroomTeacher: currentClass.homeroomTeacher,
      schoolInfo,
      rows: recapRows,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Rekap Kehadiran Siswa Perbulan
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Laporan Bulanan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan rekapitulasi presensi bulanan lengkap dengan ekspor otomatis ke Excel dan PDF resmi
          </p>
        </div>

        {/* Action Buttons: Excel, PDF, Print */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF (.pdf)</span>
          </button>

          <button
            onClick={() =>
              onOpenPrintOfficial({
                periodType: 'Bulanan',
                periodLabel: `Bulan ${currentMonthConfig.label}`,
                classId: selectedClassId,
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Class Filter */}
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
                  {c.name} ({c.homeroomTeacher})
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bulan Periode Rekap
            </label>
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              {MONTH_CONFIG_LIST.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.semester === 'ganjil' ? 'Smt Ganjil' : 'Smt Genap'}) · {opt.effectiveDays} Hari Efektif
                </option>
              ))}
            </select>
          </div>

          {/* Wali Kelas & Info Box */}
          <div className="flex flex-col justify-center text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span>Wali Kelas:</span>
              <strong className="text-slate-900">{currentClass.homeroomTeacher}</strong>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span>Rata-rata Kehadiran:</span>
              <strong className="text-emerald-700 font-mono text-sm">{classSummary.avgPct}%</strong>
            </div>
          </div>

        </div>

        {/* Mini KPI Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3 font-mono tabular-nums">
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
              Total Hadir: {classSummary.totalH}
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
              Sakit: {classSummary.totalS}
            </span>
            <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-900 font-bold border border-sky-200">
              Izin: {classSummary.totalI}
            </span>
            <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-900 font-bold border border-rose-200">
              Alpa: {classSummary.totalA}
            </span>
          </div>

          <div className="text-slate-600">
            {classSummary.perfectCount} Siswa dengan kehadiran 100% tanpa absen bulan ini
          </div>
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="py-3 px-3 font-semibold text-center w-12 border-r border-slate-200">No</th>
                <th className="py-3 px-3 font-semibold w-28 border-r border-slate-200">NISN</th>
                <th className="py-3 px-3 font-semibold w-60 border-r border-slate-200">Nama Siswa</th>
                <th className="py-3 px-2 font-semibold text-center w-14 border-r border-slate-200">L/P</th>
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200 bg-emerald-50 text-emerald-950">
                  Hadir (H)
                </th>
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200 bg-amber-50 text-amber-950">
                  Sakit (S)
                </th>
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200 bg-sky-50 text-sky-950">
                  Izin (I)
                </th>
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200 bg-rose-50 text-rose-950">
                  Alpa (A)
                </th>
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200">
                  Hari Efektif
                </th>
                <th className="py-3 px-3 font-bold text-center w-28 bg-slate-100 text-slate-900 border-r border-slate-200">
                  % Hadir
                </th>
                <th className="py-3 px-4 font-semibold">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recapRows.map((row) => (
                <tr key={row.nisn} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                    {row.no}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-100">
                    {row.nisn}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-100">
                    {row.name}
                  </td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-100">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        row.gender === 'L'
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-pink-700 bg-pink-50'
                      }`}
                    >
                      {row.gender}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-800 bg-emerald-50/30 border-r border-slate-100">
                    {row.hadir}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-amber-800 bg-amber-50/30 border-r border-slate-100">
                    {row.sakit}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-sky-800 bg-sky-50/30 border-r border-slate-100">
                    {row.izin}
                  </td>
                  <td className={`py-2.5 px-3 text-center font-mono font-bold border-r border-slate-100 ${row.alpa > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-400'}`}>
                    {row.alpa}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-100">
                    {row.totalHari}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50 border-r border-slate-100">
                    {row.percentage}%
                  </td>
                  <td className="py-2.5 px-4 text-[11px]">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-semibold ${
                        row.percentage >= 90
                          ? 'text-emerald-800 bg-emerald-50'
                          : row.percentage >= 80
                          ? 'text-amber-800 bg-amber-50'
                          : 'text-rose-800 bg-rose-50'
                      }`}
                    >
                      {row.keterangan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Row */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-200">
                  TOTAL KELAS & RATA-RATA:
                </td>
                <td className="py-2 px-3 text-center font-mono text-emerald-900 bg-emerald-100/70 border-r border-slate-200">
                  {classSummary.totalH}
                </td>
                <td className="py-2 px-3 text-center font-mono text-amber-900 bg-amber-100/70 border-r border-slate-200">
                  {classSummary.totalS}
                </td>
                <td className="py-2 px-3 text-center font-mono text-sky-900 bg-sky-100/70 border-r border-slate-200">
                  {classSummary.totalI}
                </td>
                <td className="py-2 px-3 text-center font-mono text-rose-900 bg-rose-100/70 border-r border-slate-200">
                  {classSummary.totalA}
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-700 border-r border-slate-200">
                  {currentMonthConfig.effectiveDays} Hari
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-900 bg-slate-200 border-r border-slate-200">
                  {classSummary.avgPct}%
                </td>
                <td className="py-2 px-4 text-slate-600 text-[11px]">
                  {classSummary.avgPct >= 90 ? 'Target Kedisiplinan Tercapai' : 'Perlu Pendampingan'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
