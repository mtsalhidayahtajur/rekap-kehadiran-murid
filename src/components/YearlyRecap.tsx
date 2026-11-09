import React, { useState, useMemo } from 'react';
import { ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student } from '../types';
import { exportAttendanceToExcel, exportAttendanceToPDF, RecapRowData } from '../utils/exportUtils';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Award,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface YearlyRecapProps {
  schoolInfo: SchoolInfo;
  classes: ClassInfo[];
  students: Student[];
  monthlyAttendance: MonthlyAttendanceRecord[];
  onOpenPrintOfficial: (params: { periodType: 'Tahunan'; periodLabel: string; classId: string }) => void;
}

export const YearlyRecap: React.FC<YearlyRecapProps> = ({
  schoolInfo,
  classes,
  students,
  monthlyAttendance,
  onOpenPrintOfficial,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('7A');

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const yearLabel = `Tahun Ajaran ${schoolInfo.academicYear} (Smt 1 & Smt 2)`;

  // Calculate annual statistics per student from monthlyAttendance
  const studentYearlyData = useMemo(() => {
    const list = classStudents.map((student) => {
      const records = monthlyAttendance.filter((a) => a.studentId === student.id);
      
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      let totalEffective = 0;

      records.forEach((r) => {
        hadir += r.hadir;
        sakit += r.sakit;
        izin += r.izin;
        alpa += r.alpa;
        totalEffective += r.effectiveDays;
      });

      const percentage = totalEffective > 0 ? (hadir / totalEffective) * 100 : 100;

      let predikat = 'Sangat Memuaskan';
      if (percentage < 80 || alpa >= 6) predikat = 'Perhatian Khusus';
      else if (percentage < 88 || alpa >= 3) predikat = 'Cukup';
      else if (percentage < 95) predikat = 'Baik';

      return {
        student,
        hadir,
        sakit,
        izin,
        alpa,
        totalRecorded: totalEffective,
        percentage: Number(percentage.toFixed(1)),
        predikat,
      };
    });

    // Sort by percentage desc then alpa asc to determine ranking
    list.sort((a, b) => b.percentage - a.percentage || a.alpa - b.alpa);

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [classStudents, monthlyAttendance]);

  // Export rows
  const exportRows: RecapRowData[] = useMemo(() => {
    return studentYearlyData.map((d) => ({
      no: d.rank,
      nisn: d.student.nisn,
      name: d.student.name,
      gender: d.student.gender,
      hadir: d.hadir,
      sakit: d.sakit,
      izin: d.izin,
      alpa: d.alpa,
      totalHari: d.totalRecorded,
      percentage: d.percentage,
      keterangan: d.predikat,
    }));
  }, [studentYearlyData]);

  // Overall class averages
  const classStats = useMemo(() => {
    const sumPct = studentYearlyData.reduce((acc, curr) => acc + curr.percentage, 0);
    const avg = studentYearlyData.length > 0 ? sumPct / studentYearlyData.length : 0;
    const totalH = studentYearlyData.reduce((acc, curr) => acc + curr.hadir, 0);
    const totalS = studentYearlyData.reduce((acc, curr) => acc + curr.sakit, 0);
    const totalI = studentYearlyData.reduce((acc, curr) => acc + curr.izin, 0);
    const totalA = studentYearlyData.reduce((acc, curr) => acc + curr.alpa, 0);
    const topPerformer = studentYearlyData[0];

    return {
      avg: Number(avg.toFixed(1)),
      totalH,
      totalS,
      totalI,
      totalA,
      topPerformer,
    };
  }, [studentYearlyData]);

  const handleExportExcel = () => {
    exportAttendanceToExcel({
      periodType: 'Tahunan',
      periodLabel: yearLabel,
      className: currentClass.name,
      homeroomTeacher: currentClass.homeroomTeacher,
      schoolInfo,
      rows: exportRows,
    });
  };

  const handleExportPDF = () => {
    exportAttendanceToPDF({
      periodType: 'Tahunan',
      periodLabel: yearLabel,
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
              Rekap Kehadiran Siswa Pertahun
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Tahun Ajaran Penuh 2026/2027
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Akumulasi 1 tahun ajaran penuh (T.A. {schoolInfo.academicYear}) untuk syarat kenaikan kelas dan kelulusan
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
                periodType: 'Tahunan',
                periodLabel: yearLabel,
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

      {/* Class Selector & Annual Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Class Selection Box */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Rombel (Kelas)
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
          <div className="mt-3 text-[11px] text-slate-500">
            Tahun Ajaran: <strong className="text-slate-800">{schoolInfo.academicYear}</strong> · Kepala Madrasah: <strong className="text-slate-800">{schoolInfo.headmaster.name}</strong>
          </div>
        </div>

        {/* Card 2: Annual Average Attendance */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Rata-rata Tahunan Kelas</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {classStats.avg}%
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">Syarat Kenaikan Kelas: $\ge 85\%$</div>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Teladan Kehadiran */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Peringkat 1 Kehadiran Terbaik</span>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[200px]">
              {classStats.topPerformer?.student.name || '-'}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Presensi: {classStats.topPerformer?.percentage}% (Alpa: 0)
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
        </div>

      </div>

      {/* Table: Annual Student Attendance */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                <th className="py-3 px-3 font-bold text-center w-12 border-r border-slate-200">Rank</th>
                <th className="py-3 px-3 font-bold w-24 border-r border-slate-200">NISN</th>
                <th className="py-3 px-3 font-bold w-60 border-r border-slate-200">Nama Siswa</th>
                <th className="py-3 px-2 font-bold text-center w-12 border-r border-slate-200">L/P</th>
                <th className="py-3 px-3 font-bold text-center w-20 border-r border-slate-200 bg-emerald-50 text-emerald-950">Hadir</th>
                <th className="py-3 px-3 font-bold text-center w-20 border-r border-slate-200 bg-amber-50 text-amber-950">Sakit</th>
                <th className="py-3 px-3 font-bold text-center w-20 border-r border-slate-200 bg-sky-50 text-sky-950">Izin</th>
                <th className="py-3 px-3 font-bold text-center w-20 border-r border-slate-200 bg-rose-50 text-rose-950">Alpa</th>
                <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200">Total Hari</th>
                <th className="py-3 px-3 font-bold text-center w-24 bg-slate-100 text-slate-900 border-r border-slate-200">% Kehadiran</th>
                <th className="py-3 px-4 font-bold text-slate-800">Status Kelayakan Kenaikan / Ijazah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentYearlyData.map((row) => (
                <tr key={row.student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                    {row.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                        1
                      </span>
                    ) : (
                      row.rank
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-100">
                    {row.student.nisn}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-100">
                    {row.student.name}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-600 font-semibold border-r border-slate-100">
                    {row.student.gender}
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
                  <td className={`py-2.5 px-3 text-center font-mono font-bold border-r border-slate-100 ${row.alpa > 0 ? 'text-rose-700 bg-rose-50/50' : 'text-slate-400'}`}>
                    {row.alpa}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-100">
                    {row.totalRecorded}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50 border-r border-slate-100">
                    {row.percentage}%
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        row.percentage >= 90
                          ? 'text-emerald-800 bg-emerald-50'
                          : row.percentage >= 85
                          ? 'text-blue-800 bg-blue-50'
                          : 'text-rose-800 bg-rose-50'
                      }`}
                    >
                      {row.percentage >= 85 ? 'Memenuhi Syarat Kenaikan' : 'Perlu Sidang Pleno / Remedial Presensi'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Summary */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-200">
                  TOTAL KELAS & RATA-RATA:
                </td>
                <td className="py-2 px-3 text-center font-mono text-emerald-900 bg-emerald-100/70 border-r border-slate-200">
                  {classStats.totalH}
                </td>
                <td className="py-2 px-3 text-center font-mono text-amber-900 bg-amber-100/70 border-r border-slate-200">
                  {classStats.totalS}
                </td>
                <td className="py-2 px-3 text-center font-mono text-sky-900 bg-sky-100/70 border-r border-slate-200">
                  {classStats.totalI}
                </td>
                <td className="py-2 px-3 text-center font-mono text-rose-900 bg-rose-100/70 border-r border-slate-200">
                  {classStats.totalA}
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-700 border-r border-slate-200">
                  {studentYearlyData[0]?.totalRecorded || 0}
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-900 bg-slate-200 border-r border-slate-200">
                  {classStats.avg}%
                </td>
                <td className="py-2 px-4 text-slate-600 text-[11px]">
                  Rata-rata Tingkat Kehadiran 1 Tahun
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
