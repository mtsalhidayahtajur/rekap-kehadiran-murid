import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { SchoolInfo, Student } from '../types';

export interface RecapRowData {
  no: number;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  totalHari: number;
  percentage: number;
  keterangan: string;
}

export interface ExportReportOptions {
  periodType: 'Bulanan' | 'Semester' | 'Tahunan';
  periodLabel: string; // e.g. "Bulan Oktober 2026", "Semester Ganjil 2026/2027", "Tahun Ajaran 2026/2027"
  className: string;
  homeroomTeacher: string;
  schoolInfo: SchoolInfo;
  rows: RecapRowData[];
}

export function exportAttendanceToExcel(options: ExportReportOptions): void {
  const { periodType, periodLabel, className, homeroomTeacher, schoolInfo, rows } = options;

  // Build header matrix
  const titleRows = [
    [schoolInfo.foundation.toUpperCase()],
    [schoolInfo.name.toUpperCase()],
    [`NSM: ${schoolInfo.nsm} | NPSN: ${schoolInfo.npsn} | STATUS TERAKREDITASI`],
    [`Alamat: ${schoolInfo.address}, ${schoolInfo.district}, ${schoolInfo.regency}`],
    [''],
    [`LAPORAN REKAPITULASI PRESENSI KEHADIRAN SISWA (${periodType.toUpperCase()})`],
    [`Tahun Ajaran: ${schoolInfo.academicYear} | Periode: ${periodLabel} | Kelas: ${className}`],
    [`Wali Kelas: ${homeroomTeacher}`],
    [''],
  ];

  // Table header
  const tableHeaders = [
    'No',
    'NISN',
    'Nama Lengkap Siswa',
    'L/P',
    'Hadir (H)',
    'Sakit (S)',
    'Izin (I)',
    'Alpa (A)',
    'Total Hari Belajar',
    '% Kehadiran',
    'Status Evaluasi',
  ];

  const tableData = rows.map((r) => [
    r.no,
    r.nisn,
    r.name,
    r.gender,
    r.hadir,
    r.sakit,
    r.izin,
    r.alpa,
    r.totalHari,
    `${r.percentage.toFixed(1)}%`,
    r.keterangan,
  ]);

  // Aggregate stats
  const totalHadir = rows.reduce((acc, curr) => acc + curr.hadir, 0);
  const totalSakit = rows.reduce((acc, curr) => acc + curr.sakit, 0);
  const totalIzin = rows.reduce((acc, curr) => acc + curr.izin, 0);
  const totalAlpa = rows.reduce((acc, curr) => acc + curr.alpa, 0);
  const avgPct = rows.length > 0 ? (rows.reduce((acc, curr) => acc + curr.percentage, 0) / rows.length).toFixed(1) : '0';

  const summaryRow = [
    '',
    '',
    'JUMLAH KELAS / RATA-RATA',
    '',
    totalHadir,
    totalSakit,
    totalIzin,
    totalAlpa,
    rows[0]?.totalHari || 0,
    `${avgPct}%`,
    Number(avgPct) >= 90 ? 'Tercapai Sangat Baik' : 'Perlu Pendampingan',
  ];

  const signatureRows = [
    [''],
    [''],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `Citeureup, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    ],
    ['Mengetahui,', '', 'Mengetahui,', '', '', '', 'Wali Kelas / Guru Pengampu,'],
    ['Kepala Madrasah,', '', 'Kepala Tata Usaha,', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    [
      schoolInfo.headmaster.name,
      '',
      schoolInfo.headOfAdmin.name,
      '',
      '',
      '',
      homeroomTeacher,
    ],
    [
      `NIP. ${schoolInfo.headmaster.nip}`,
      '',
      `NIP. ${schoolInfo.headOfAdmin.nip}`,
      '',
      '',
      '',
      'NIP. -',
    ],
  ];

  const allRows = [
    ...titleRows,
    tableHeaders,
    ...tableData,
    summaryRow,
    ...signatureRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NISN
    { wch: 32 }, // Nama
    { wch: 6 },  // L/P
    { wch: 10 }, // H
    { wch: 10 }, // S
    { wch: 10 }, // I
    { wch: 10 }, // A
    { wch: 16 }, // Total
    { wch: 14 }, // %
    { wch: 22 }, // Keterangan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran');

  // File naming
  const cleanClassName = className.replace(/\s+/g, '_');
  const cleanPeriod = periodLabel.replace(/[\/\s]+/g, '_');
  const filename = `Rekap_Kehadiran_${schoolInfo.name.replace(/\s+/g, '_')}_${cleanClassName}_${cleanPeriod}.xlsx`;

  XLSX.writeFile(wb, filename);
}

export function exportAttendanceToPDF(options: ExportReportOptions): void {
  const { periodType, periodLabel, className, homeroomTeacher, schoolInfo, rows } = options;

  // Use landscape for comprehensive monthly/semester table
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Kop Madrasah Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(schoolInfo.foundation.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`NSM: ${schoolInfo.nsm}   |   NPSN: ${schoolInfo.npsn}   |   Status Terakreditasi`, pageWidth / 2, 25, { align: 'center' });
  doc.text(`${schoolInfo.address}, ${schoolInfo.district}, ${schoolInfo.regency}, ${schoolInfo.province} ${schoolInfo.postalCode}`, pageWidth / 2, 29, { align: 'center' });

  // Double border line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(14, 32, pageWidth - 14, 32);
  doc.setLineWidth(0.3);
  doc.line(14, 33, pageWidth - 14, 33);

  // Document Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`LAPORAN REKAPITULASI PRESENSI KEHADIRAN SISWA (${periodType.toUpperCase()})`, pageWidth / 2, 39, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const leftColX = 14;
  const rightColX = pageWidth - 14;

  doc.text(`Tahun Pelajaran : ${schoolInfo.academicYear}`, leftColX, 45);
  doc.text(`Periode                 : ${periodLabel}`, leftColX, 50);

  doc.text(`Kelas              : ${className}`, rightColX - 65, 45);
  doc.text(`Wali Kelas     : ${homeroomTeacher}`, rightColX - 65, 50);

  // Table Data
  const tableBody = rows.map((r) => [
    r.no.toString(),
    r.nisn,
    r.name,
    r.gender,
    r.hadir.toString(),
    r.sakit.toString(),
    r.izin.toString(),
    r.alpa.toString(),
    r.totalHari.toString(),
    `${r.percentage.toFixed(1)}%`,
    r.keterangan,
  ]);

  // Totals
  const totalHadir = rows.reduce((acc, curr) => acc + curr.hadir, 0);
  const totalSakit = rows.reduce((acc, curr) => acc + curr.sakit, 0);
  const totalIzin = rows.reduce((acc, curr) => acc + curr.izin, 0);
  const totalAlpa = rows.reduce((acc, curr) => acc + curr.alpa, 0);
  const avgPct = rows.length > 0 ? (rows.reduce((acc, curr) => acc + curr.percentage, 0) / rows.length).toFixed(1) : '0';

  tableBody.push([
    '',
    '',
    'TOTAL KELAS & RATA-RATA',
    '',
    totalHadir.toString(),
    totalSakit.toString(),
    totalIzin.toString(),
    totalAlpa.toString(),
    (rows[0]?.totalHari || 0).toString(),
    `${avgPct}%`,
    Number(avgPct) >= 90 ? 'Sangat Baik' : 'Perlu Pembinaan',
  ]);

  autoTable(doc, {
    startY: 54,
    head: [[
      'No',
      'NISN',
      'Nama Siswa',
      'L/P',
      'Hadir',
      'Sakit',
      'Izin',
      'Alpa',
      'Hari Efektif',
      '% Kehadiran',
      'Status',
    ]],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 24 },
      2: { halign: 'left', cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 20 },
      9: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
      10: { halign: 'left', cellWidth: 28 },
    },
    didParseCell: (data) => {
      // Highlight summary row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Position for Signatures
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 150;
  
  // Check if we need a new page for signatures
  const pageHeight = doc.internal.pageSize.getHeight();
  let signY = finalY;
  if (signY > pageHeight - 45) {
    doc.addPage();
    signY = 25;
  }

  const dateStr = `Citeureup, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  // 3-Signature Layout
  const col1X = 20;               // Kepala Tata Usaha (Kiri)
  const col2X = pageWidth / 2;     // Guru Wali Kelas (Tengah)
  const col3X = pageWidth - 65;    // Kepala Madrasah (Kanan)

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Date line on right
  doc.text(dateStr, col3X, signY);

  // Titles
  doc.text('Mengetahui,', col1X, signY + 5);
  doc.text(schoolInfo.headOfAdmin.title + ',', col1X, signY + 9);

  doc.text('Wali Kelas / Pengampu,', col2X, signY + 9, { align: 'center' });

  doc.text('Mengetahui,', col3X, signY + 5);
  doc.text(schoolInfo.headmaster.title + ',', col3X, signY + 9);

  // Signature spacing
  const nameY = signY + 30;

  // Names with underlines
  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo.headOfAdmin.name, col1X, nameY);
  doc.text(homeroomTeacher, col2X, nameY, { align: 'center' });
  doc.text(schoolInfo.headmaster.name, col3X, nameY);

  // NIPs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${schoolInfo.headOfAdmin.nip}`, col1X, nameY + 4);
  doc.text('NIP. -', col2X, nameY + 4, { align: 'center' });
  doc.text(`NIP. ${schoolInfo.headmaster.nip}`, col3X, nameY + 4);

  // Save PDF
  const cleanClassName = className.replace(/\s+/g, '_');
  const cleanPeriod = periodLabel.replace(/[\/\s]+/g, '_');
  const filename = `Rekap_Kehadiran_${schoolInfo.name.replace(/\s+/g, '_')}_${cleanClassName}_${cleanPeriod}.pdf`;

  doc.save(filename);
}
