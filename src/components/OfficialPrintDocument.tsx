import React, { useMemo } from 'react';
import { ClassInfo, MonthlyAttendanceRecord, SchoolInfo, Student } from '../types';
import { Printer, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { exportAttendanceToPDF } from '../utils/exportUtils';

interface OfficialPrintDocumentProps {
  schoolInfo: SchoolInfo;
  classes: ClassInfo[];
  students: Student[];
  monthlyAttendance: MonthlyAttendanceRecord[];
  initialParams?: {
    periodType: 'Bulanan' | 'Semester' | 'Tahunan';
    periodLabel: string;
    classId: string;
  };
  onBack: () => void;
}

export const OfficialPrintDocument: React.FC<OfficialPrintDocumentProps> = ({
  schoolInfo,
  classes,
  students,
  monthlyAttendance,
  initialParams,
  onBack,
}) => {
  const [selectedClassId, setSelectedClassId] = React.useState<string>(
    initialParams?.classId || '7A'
  );
  const [periodType, setPeriodType] = React.useState<'Bulanan' | 'Semester' | 'Tahunan'>(
    initialParams?.periodType || 'Bulanan'
  );
  const [periodLabel, setPeriodLabel] = React.useState<string>(
    initialParams?.periodLabel || 'Bulan November 2026'
  );

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Compute attendance stats based on period
  const tableRows = useMemo(() => {
    return classStudents.map((student, idx) => {
      let filtered = monthlyAttendance.filter((a) => a.studentId === student.id);

      if (periodType === 'Bulanan') {
        filtered = filtered.filter((a) => a.monthKey === '2026-11');
      } else if (periodType === 'Semester') {
        filtered = filtered.filter((a) => a.monthKey.startsWith('2026-'));
      }

      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      let totalEffective = 0;

      filtered.forEach((r) => {
        hadir += r.hadir;
        sakit += r.sakit;
        izin += r.izin;
        alpa += r.alpa;
        totalEffective += r.effectiveDays;
      });

      const pct = totalEffective > 0 ? (hadir / totalEffective) * 100 : 100;

      let keterangan = 'Sangat Baik';
      if (pct < 75 || alpa >= 3) keterangan = 'Perlu Perhatian';
      else if (pct < 85 || alpa >= 1) keterangan = 'Cukup';

      return {
        no: idx + 1,
        nisn: student.nisn,
        name: student.name,
        gender: student.gender,
        hadir,
        sakit,
        izin,
        alpa,
        totalHari: totalEffective,
        percentage: Number(pct.toFixed(1)),
        keterangan,
      };
    });
  }, [classStudents, monthlyAttendance, periodType]);

  const totals = useMemo(() => {
    const totalH = tableRows.reduce((a, b) => a + b.hadir, 0);
    const totalS = tableRows.reduce((a, b) => a + b.sakit, 0);
    const totalI = tableRows.reduce((a, b) => a + b.izin, 0);
    const totalA = tableRows.reduce((a, b) => a + b.alpa, 0);
    const avgPct =
      tableRows.length > 0
        ? tableRows.reduce((a, b) => a + b.percentage, 0) / tableRows.length
        : 0;

    return {
      totalH,
      totalS,
      totalI,
      totalA,
      avgPct: Number(avgPct.toFixed(1)),
    };
  }, [tableRows]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportAttendanceToPDF({
      periodType,
      periodLabel,
      className: currentClass.name,
      homeroomTeacher: currentClass.homeroomTeacher,
      schoolInfo,
      rows: tableRows,
    });
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      
      {/* Action Bar (Hidden on print) */}
      <div className="no-print p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Pilih Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Periode:</span>
            <select
              value={periodType}
              onChange={(e) => {
                const val = e.target.value as any;
                setPeriodType(val);
                if (val === 'Bulanan') setPeriodLabel('Bulan November 2026');
                else if (val === 'Semester') setPeriodLabel('Semester Ganjil 2026/2027');
                else setPeriodLabel('Tahun Ajaran 2026/2027');
              }}
              className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-800"
            >
              <option value="Bulanan">Bulanan</option>
              <option value="Semester">Semester</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Official Paper Sheet (A4 Styled container) */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-sm p-8 sm:p-12 max-w-4xl mx-auto text-slate-900">
        
        {/* Kop Surat Resmi Madrasah */}
        <div className="relative flex items-center justify-between pb-3 border-b-2 border-slate-900">
          {/* Logo on Left */}
          <div className="w-20 shrink-0">
            <img
              src={schoolInfo.logoUrl}
              alt="Logo MTs Al Hidayah Tajur"
              className="w-18 h-18 object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Centered Typography */}
          <div className="flex-1 text-center px-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-slate-800">
              {schoolInfo.foundation}
            </h3>
            <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-950 uppercase mt-0.5">
              {schoolInfo.name}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              NSM: {schoolInfo.nsm} &nbsp;|&nbsp; NPSN: {schoolInfo.npsn} &nbsp;|&nbsp; Status: Terakreditasi
            </p>
            <p className="text-[11px] text-slate-600">
              {schoolInfo.address}, {schoolInfo.district}, {schoolInfo.regency}, {schoolInfo.province} {schoolInfo.postalCode}
            </p>
          </div>

          {/* Symmetrical placeholder */}
          <div className="w-20 shrink-0 hidden sm:block" />
        </div>

        {/* Double rule line */}
        <div className="border-b-4 border-slate-900 border-double -mt-0.5 mb-6" />

        {/* Document Subject Header */}
        <div className="text-center mb-6">
          <h2 className="font-bold text-sm sm:text-base uppercase tracking-wide text-slate-950 underline underline-offset-4">
            LAPORAN REKAPITULASI PRESENSI KEHADIRAN SISWA
          </h2>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Nomor: 421.3 / REKAP-MTS / {schoolInfo.academicYear.replace('/', '-')}-XI
          </p>
        </div>

        {/* Document Metadata Table */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4 text-slate-800">
          <div className="flex">
            <span className="w-32 font-semibold">Tahun Pelajaran</span>
            <span className="w-4">:</span>
            <span>{schoolInfo.academicYear}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold">Kelas</span>
            <span className="w-4">:</span>
            <span className="font-bold">{currentClass.name}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold">Periode Laporan</span>
            <span className="w-4">:</span>
            <span>{periodLabel} ({periodType})</span>
          </div>
          <div className="flex">
            <span className="w-28 font-semibold">Wali Kelas</span>
            <span className="w-4">:</span>
            <span>{currentClass.homeroomTeacher}</span>
          </div>
        </div>

        {/* Formal Data Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-950 border-b border-slate-900 text-center font-bold">
                <th className="py-2 px-2 border border-slate-900 w-10">No</th>
                <th className="py-2 px-3 border border-slate-900 w-28">NISN</th>
                <th className="py-2 px-3 border border-slate-900 text-left">Nama Lengkap Siswa</th>
                <th className="py-2 px-2 border border-slate-900 w-12">L/P</th>
                <th className="py-2 px-2 border border-slate-900 w-12">Hadir</th>
                <th className="py-2 px-2 border border-slate-900 w-12">Sakit</th>
                <th className="py-2 px-2 border border-slate-900 w-12">Izin</th>
                <th className="py-2 px-2 border border-slate-900 w-12">Alpa</th>
                <th className="py-2 px-2 border border-slate-900 w-16">Total Hari</th>
                <th className="py-2 px-3 border border-slate-900 w-20">% Hadir</th>
                <th className="py-2 px-3 border border-slate-900 w-28 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {tableRows.map((r) => (
                <tr key={r.nisn} className="border-b border-slate-400">
                  <td className="py-1.5 px-2 text-center font-mono border-r border-slate-400">{r.no}</td>
                  <td className="py-1.5 px-3 text-center font-mono border-r border-slate-400">{r.nisn}</td>
                  <td className="py-1.5 px-3 font-medium border-r border-slate-400">{r.name}</td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-400">{r.gender}</td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-400">{r.hadir}</td>
                  <td className="py-1.5 px-2 text-center font-mono border-r border-slate-400">{r.sakit}</td>
                  <td className="py-1.5 px-2 text-center font-mono border-r border-slate-400">{r.izin}</td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-400">{r.alpa}</td>
                  <td className="py-1.5 px-2 text-center font-mono border-r border-slate-400">{r.totalHari}</td>
                  <td className="py-1.5 px-3 text-center font-mono font-bold border-r border-slate-400">{r.percentage}%</td>
                  <td className="py-1.5 px-3 text-[11px]">{r.keterangan}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-center">
                <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-900">
                  JUMLAH / RATA-RATA KELAS:
                </td>
                <td className="py-2 px-2 font-mono border-r border-slate-900">{totals.totalH}</td>
                <td className="py-2 px-2 font-mono border-r border-slate-900">{totals.totalS}</td>
                <td className="py-2 px-2 font-mono border-r border-slate-900">{totals.totalI}</td>
                <td className="py-2 px-2 font-mono border-r border-slate-900">{totals.totalA}</td>
                <td className="py-2 px-2 font-mono border-r border-slate-900">{tableRows[0]?.totalHari || 0}</td>
                <td className="py-2 px-3 font-mono border-r border-slate-900">{totals.avgPct}%</td>
                <td className="py-2 px-3 text-left text-[11px]">
                  {totals.avgPct >= 90 ? 'Memenuhi Standar' : 'Perlu Pembinaan'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 3-Signature Block (Kop Madrasah Standard) */}
        <div className="print-break-inside-avoid mt-8 pt-4">
          <div className="text-right text-xs mb-4 text-slate-800">
            Citeureup, {currentDateFormatted}
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            {/* Signature 1: Kepala Tata Usaha */}
            <div className="space-y-1">
              <div className="text-slate-600">Mengetahui,</div>
              <div className="font-bold text-slate-900">{schoolInfo.headOfAdmin.title}</div>
              <div className="h-20" />
              <div className="font-bold underline text-slate-950">
                {schoolInfo.headOfAdmin.name}
              </div>
              <div className="text-[11px] text-slate-600">
                NIP. {schoolInfo.headOfAdmin.nip}
              </div>
            </div>

            {/* Signature 2: Wali Kelas */}
            <div className="space-y-1">
              <div className="text-slate-600">Diperiksa Oleh,</div>
              <div className="font-bold text-slate-900">Wali Kelas / Pengampu</div>
              <div className="h-20" />
              <div className="font-bold underline text-slate-950">
                {currentClass.homeroomTeacher}
              </div>
              <div className="text-[11px] text-slate-600">
                NIP. -
              </div>
            </div>

            {/* Signature 3: Kepala Madrasah */}
            <div className="space-y-1">
              <div className="text-slate-600">Mengetahui & Menyetujui,</div>
              <div className="font-bold text-slate-900">{schoolInfo.headmaster.title}</div>
              <div className="h-20" />
              <div className="font-bold underline text-slate-950">
                {schoolInfo.headmaster.name}
              </div>
              <div className="text-[11px] text-slate-600">
                NIP. {schoolInfo.headmaster.nip}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
