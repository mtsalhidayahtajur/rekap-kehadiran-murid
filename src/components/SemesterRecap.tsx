import React, { useState, useMemo } from 'react';
import { ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student } from '../types';
import { exportAttendanceToExcel, exportAttendanceToPDF, RecapRowData } from '../utils/exportUtils';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react';

interface SemesterRecapProps {
  schoolInfo: SchoolInfo;
  classes: ClassInfo[];
  students: Student[];
  monthlyAttendance: MonthlyAttendanceRecord[];
  onOpenPrintOfficial: (params: { periodType: 'Semester'; periodLabel: string; classId: string }) => void;
}

export const SemesterRecap: React.FC<SemesterRecapProps> = ({
  schoolInfo,
  classes,
  students,
  monthlyAttendance,
  onOpenPrintOfficial,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('7A');
  const [selectedSemester, setSelectedSemester] = useState<'ganjil' | 'genap'>('ganjil');

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Months for selected semester
  const semesterMonths = useMemo(() => {
    if (selectedSemester === 'ganjil') {
      return [
        { key: '2026-07', label: 'Juli 2026', short: 'Jul' },
        { key: '2026-08', label: 'Agustus 2026', short: 'Ags' },
        { key: '2026-09', label: 'September 2026', short: 'Sep' },
        { key: '2026-10', label: 'Oktober 2026', short: 'Okt' },
        { key: '2026-11', label: 'November 2026', short: 'Nov' },
        { key: '2026-12', label: 'Desember 2026', short: 'Des' },
      ];
    } else {
      return [
        { key: '2027-01', label: 'Januari 2027', short: 'Jan' },
        { key: '2027-02', label: 'Februari 2027', short: 'Feb' },
        { key: '2027-03', label: 'Maret 2027', short: 'Mar' },
        { key: '2027-04', label: 'April 2027', short: 'Apr' },
        { key: '2027-05', label: 'Mei 2027', short: 'Mei' },
        { key: '2027-06', label: 'Juni 2027', short: 'Jun' },
      ];
    }
  }, [selectedSemester]);

  const semesterLabel =
    selectedSemester === 'ganjil'
      ? `Semester Ganjil T.A. ${schoolInfo.academicYear}`
      : `Semester Genap T.A. ${schoolInfo.academicYear}`;

  // Calculate per student monthly breakdown and totals
  const studentData = useMemo(() => {
    return classStudents.map((student, idx) => {
      let totalH = 0;
      let totalS = 0;
      let totalI = 0;
      let totalA = 0;
      let totalEffective = 0;

      const monthlyBreakdown: Record<string, { h: number; s: number; i: number; a: number; total: number }> = {};

      semesterMonths.forEach((m) => {
        const record = monthlyAttendance.find(
          (a) => a.studentId === student.id && a.monthKey === m.key
        );

        const h = record ? record.hadir : 0;
        const s = record ? record.sakit : 0;
        const i = record ? record.izin : 0;
        const a = record ? record.alpa : 0;
        const eff = record ? record.effectiveDays : 0;

        monthlyBreakdown[m.key] = { h, s, i, a, total: eff };

        totalH += h;
        totalS += s;
        totalI += i;
        totalA += a;
        totalEffective += eff;
      });

      const totalRecorded = totalEffective;
      const percentage = totalRecorded > 0 ? (totalH / totalRecorded) * 100 : 100;

      let predikat = 'Sangat Baik (A)';
      if (percentage < 75 || totalA >= 5) predikat = 'Kurang (D)';
      else if (percentage < 85 || totalA >= 2) predikat = 'Cukup (C)';
      else if (percentage < 92) predikat = 'Baik (B)';

      return {
        no: idx + 1,
        student,
        monthlyBreakdown,
        totalH,
        totalS,
        totalI,
        totalA,
        totalRecorded,
        percentage: Number(percentage.toFixed(1)),
        predikat,
      };
    });
  }, [classStudents, semesterMonths, monthlyAttendance]);

  // Transform to RecapRowData for export utilities
  const exportRows: RecapRowData[] = useMemo(() => {
    return studentData.map((d) => ({
      no: d.no,
      nisn: d.student.nisn,
      name: d.student.name,
      gender: d.student.gender,
      hadir: d.totalH,
      sakit: d.totalS,
      izin: d.totalI,
      alpa: d.totalA,
      totalHari: d.totalRecorded,
      percentage: d.percentage,
      keterangan: d.predikat,
    }));
  }, [studentData]);

  // Overall class averages
  const classAverages = useMemo(() => {
    const sumPct = studentData.reduce((acc, curr) => acc + curr.percentage, 0);
    const avg = studentData.length > 0 ? sumPct / studentData.length : 0;
    const totalH = studentData.reduce((acc, curr) => acc + curr.totalH, 0);
    const totalS = studentData.reduce((acc, curr) => acc + curr.totalS, 0);
    const totalI = studentData.reduce((acc, curr) => acc + curr.totalI, 0);
    const totalA = studentData.reduce((acc, curr) => acc + curr.totalA, 0);
    const perfectCount = studentData.filter((s) => s.percentage >= 99).length;

    return {
      avg: Number(avg.toFixed(1)),
      totalH,
      totalS,
      totalI,
      totalA,
      perfectCount,
    };
  }, [studentData]);

  const handleExportExcel = () => {
    exportAttendanceToExcel({
      periodType: 'Semester',
      periodLabel: semesterLabel,
      className: currentClass.name,
      homeroomTeacher: currentClass.homeroomTeacher,
      schoolInfo,
      rows: exportRows,
    });
  };

  const handleExportPDF = () => {
    exportAttendanceToPDF({
      periodType: 'Semester',
      periodLabel: semesterLabel,
      className: currentClass.name,
      homeroomTeacher: currentClass.homeroomTeacher,
      schoolInfo,
      rows: exportRows,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Rekap Kehadiran Siswa Persemester
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Semester Ganjil & Genap
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Akumulasi kehadiran per bulan dalam 1 semester untuk rapor dan evaluasi madrasah
          </p>
        </div>

        {/* Export Buttons */}
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
                periodType: 'Semester',
                periodLabel: semesterLabel,
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
          
          {/* Class Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rombel (Kelas)
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

          {/* Semester Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Semester
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedSemester('ganjil')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedSemester === 'ganjil'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester Ganjil (Jul - Des)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester('genap')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedSemester === 'genap'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester Genap (Jan - Jun)
              </button>
            </div>
          </div>

          {/* KPI Mini Summary */}
          <div className="flex flex-col justify-center text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span>Rata-rata Semester:</span>
              <span className="font-bold font-mono text-emerald-700 text-sm">{classAverages.avg}%</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Kehadiran 100%:</span>
              <span className="font-semibold text-slate-900">{classAverages.perfectCount} Siswa</span>
            </div>
          </div>

        </div>
      </div>

      {/* Semester Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                <th rowSpan={2} className="py-3 px-2 font-bold text-center w-8 border-r border-slate-200">No</th>
                <th rowSpan={2} className="py-3 px-2 font-bold w-24 border-r border-slate-200">NISN</th>
                <th rowSpan={2} className="py-3 px-3 font-bold w-48 border-r border-slate-200">Nama Siswa</th>
                <th rowSpan={2} className="py-3 px-1.5 font-bold text-center w-10 border-r border-slate-200">L/P</th>

                {/* Monthly Group Columns */}
                {semesterMonths.map((m) => (
                  <th
                    key={m.key}
                    colSpan={4}
                    className="py-1.5 px-1 font-bold text-center border-r border-slate-200 bg-slate-50 text-[11px]"
                  >
                    {m.short}
                  </th>
                ))}

                {/* Semester Totals */}
                <th colSpan={4} className="py-1.5 px-1 font-bold text-center border-r border-slate-200 bg-emerald-50 text-emerald-950 text-[11px]">
                  Total Semester
                </th>
                <th rowSpan={2} className="py-3 px-2 font-bold text-center w-16 bg-slate-100 text-slate-900 border-r border-slate-200">
                  % Hadir
                </th>
                <th rowSpan={2} className="py-3 px-3 font-bold w-32 text-slate-800">
                  Predikat Rapor
                </th>
              </tr>
              
              {/* Sub-header row for H, S, I, A per month */}
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                {semesterMonths.map((m) => (
                  <React.Fragment key={`${m.key}-sub`}>
                    <th className="py-1 px-1 text-center font-mono w-6 border-r border-slate-200 text-emerald-800">H</th>
                    <th className="py-1 px-1 text-center font-mono w-6 border-r border-slate-200 text-amber-800">S</th>
                    <th className="py-1 px-1 text-center font-mono w-6 border-r border-slate-200 text-sky-800">I</th>
                    <th className="py-1 px-1 text-center font-mono w-6 border-r border-slate-200 text-rose-800">A</th>
                  </React.Fragment>
                ))}

                {/* Totals Sub-headers */}
                <th className="py-1 px-1 text-center font-mono w-7 border-r border-slate-200 bg-emerald-100/60 font-bold text-emerald-900">H</th>
                <th className="py-1 px-1 text-center font-mono w-7 border-r border-slate-200 bg-amber-100/60 font-bold text-amber-900">S</th>
                <th className="py-1 px-1 text-center font-mono w-7 border-r border-slate-200 bg-sky-100/60 font-bold text-sky-900">I</th>
                <th className="py-1 px-1 text-center font-mono w-7 border-r border-slate-200 bg-rose-100/60 font-bold text-rose-900">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {studentData.map((row) => (
                <tr key={row.student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-2 text-center font-mono text-slate-500 border-r border-slate-100">
                    {row.no}
                  </td>
                  <td className="py-2 px-2 font-mono text-slate-600 border-r border-slate-100">
                    {row.student.nisn}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-100">
                    {row.student.name}
                  </td>
                  <td className="py-2 px-1.5 text-center text-slate-600 font-semibold border-r border-slate-100">
                    {row.student.gender}
                  </td>

                  {/* Monthly numbers */}
                  {semesterMonths.map((m) => {
                    const breakdown = row.monthlyBreakdown[m.key] || { h: 0, s: 0, i: 0, a: 0 };
                    return (
                      <React.Fragment key={`${row.student.id}-${m.key}`}>
                        <td className="py-1.5 px-1 text-center font-mono text-slate-800 border-r border-slate-100">
                          {breakdown.h || '-'}
                        </td>
                        <td className="py-1.5 px-1 text-center font-mono text-amber-700 border-r border-slate-100">
                          {breakdown.s || '-'}
                        </td>
                        <td className="py-1.5 px-1 text-center font-mono text-sky-700 border-r border-slate-100">
                          {breakdown.i || '-'}
                        </td>
                        <td className={`py-1.5 px-1 text-center font-mono border-r border-slate-100 ${breakdown.a > 0 ? 'text-rose-700 font-bold bg-rose-50' : 'text-slate-400'}`}>
                          {breakdown.a || '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* Total Semester */}
                  <td className="py-1.5 px-1 text-center font-mono font-bold text-emerald-800 bg-emerald-50/40 border-r border-slate-100">
                    {row.totalH}
                  </td>
                  <td className="py-1.5 px-1 text-center font-mono text-amber-800 bg-amber-50/40 border-r border-slate-100">
                    {row.totalS}
                  </td>
                  <td className="py-1.5 px-1 text-center font-mono text-sky-800 bg-sky-50/40 border-r border-slate-100">
                    {row.totalI}
                  </td>
                  <td className="py-1.5 px-1 text-center font-mono font-bold text-rose-800 bg-rose-50/40 border-r border-slate-100">
                    {row.totalA}
                  </td>

                  {/* % Hadir */}
                  <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900 bg-slate-50 border-r border-slate-100">
                    {row.percentage}%
                  </td>

                  {/* Predikat */}
                  <td className="py-1.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-semibold ${
                        row.percentage >= 90
                          ? 'text-emerald-800 bg-emerald-50'
                          : row.percentage >= 80
                          ? 'text-amber-800 bg-amber-50'
                          : 'text-rose-800 bg-rose-50'
                      }`}
                    >
                      {row.predikat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Summary */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-200">
                  TOTAL KELAS {currentClass.name.toUpperCase()}:
                </td>
                <td colSpan={semesterMonths.length * 4} className="text-center font-normal text-slate-400 border-r border-slate-200">
                  Rekapitulasi 6 Bulan Pembelajaran
                </td>
                <td className="py-2 px-1 text-center font-mono text-emerald-900 bg-emerald-100/70 border-r border-slate-200">
                  {classAverages.totalH}
                </td>
                <td className="py-2 px-1 text-center font-mono text-amber-900 bg-amber-100/70 border-r border-slate-200">
                  {classAverages.totalS}
                </td>
                <td className="py-2 px-1 text-center font-mono text-sky-900 bg-sky-100/70 border-r border-slate-200">
                  {classAverages.totalI}
                </td>
                <td className="py-2 px-1 text-center font-mono text-rose-900 bg-rose-100/70 border-r border-slate-200">
                  {classAverages.totalA}
                </td>
                <td className="py-2 px-2 text-center font-mono text-slate-900 bg-slate-200 border-r border-slate-200">
                  {classAverages.avg}%
                </td>
                <td className="py-2 px-3 text-slate-600 text-[11px]">
                  Rata-rata Semester
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
