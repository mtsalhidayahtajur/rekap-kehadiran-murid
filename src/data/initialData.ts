import { ClassInfo, SchoolInfo, Student, UserProfile, AttendanceRecord, MonthlyAttendanceRecord } from '../types';

export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  name: 'MTs Al Hidayah Tajur',
  foundation: 'Yayasan Al Hidayah Tajur Citeureup Bogor',
  nsm: '121232010045',
  npsn: '20277812',
  address: 'Jl. Raya Tajur Citeureup No. 24, Desa Tajur, Kec. Citeureup',
  district: 'Citeureup',
  regency: 'Kabupaten Bogor',
  province: 'Jawa Barat',
  postalCode: '16810',
  academicYear: '2026/2027',
  headmaster: {
    name: 'H. Muh. Yusup Supriatna, S.Pd.I.',
    title: 'Kepala Madrasah',
    nip: '19750814 200501 1 003',
  },
  headOfAdmin: {
    name: 'Andes, S.Pd.I.',
    title: 'Kepala Tata Usaha',
    nip: '19820319 200801 1 005',
  },
  logoUrl: '/assets/aistudio/ggaga_63f1ef56.png',
};

export const INITIAL_CLASSES: ClassInfo[] = [
  { id: '7A', name: 'Kelas VII-A', grade: '7', homeroomTeacher: 'Ahmad Fauzi, S.Pd.', totalStudents: 24 },
  { id: '7B', name: 'Kelas VII-B', grade: '7', homeroomTeacher: 'Siti Fatimah, S.Pd.I.', totalStudents: 24 },
  { id: '8A', name: 'Kelas VIII-A', grade: '8', homeroomTeacher: 'M. Ridwan, S.Ag.', totalStudents: 22 },
  { id: '8B', name: 'Kelas VIII-B', grade: '8', homeroomTeacher: 'Nurul Hidayati, S.Pd.', totalStudents: 22 },
  { id: '9A', name: 'Kelas IX-A', grade: '9', homeroomTeacher: 'Dedi Kurniawan, S.Pd.I.', totalStudents: 20 },
  { id: '9B', name: 'Kelas IX-B', grade: '9', homeroomTeacher: 'Dewi Sartika, M.Pd.', totalStudents: 20 },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-kamad',
    name: 'H. Muh. Yusup Supriatna, S.Pd.I.',
    role: 'kepala_madrasah',
    title: 'Kepala Madrasah MTs Al Hidayah Tajur',
    nip: '19750814 200501 1 003',
  },
  {
    id: 'user-ktau',
    name: 'Andes, S.Pd.I.',
    role: 'kepala_tu',
    title: 'Kepala Tata Usaha MTs Al Hidayah Tajur',
    nip: '19820319 200801 1 005',
  },
  {
    id: 'user-7a',
    name: 'Ahmad Fauzi, S.Pd.',
    role: 'guru_wali_kelas',
    title: 'Wali Kelas VII-A',
    assignedClassId: '7A',
    nip: '19880512 201402 1 004',
  },
  {
    id: 'user-7b',
    name: 'Siti Fatimah, S.Pd.I.',
    role: 'guru_wali_kelas',
    title: 'Wali Kelas VII-B',
    assignedClassId: '7B',
    nip: '19901103 201503 2 006',
  },
  {
    id: 'user-8a',
    name: 'M. Ridwan, S.Ag.',
    role: 'guru_wali_kelas',
    title: 'Wali Kelas VIII-A',
    assignedClassId: '8A',
    nip: '19850620 201101 1 002',
  },
  {
    id: 'user-piket',
    name: 'Guru Piket Harian',
    role: 'guru_piket',
    title: 'Petugas Piket Presensi Madrasah',
  },
];

// Seed realistic students per class
const rawStudents7A = [
  { name: 'Abdullah Azzam Pratama', gender: 'L' as const },
  { name: 'Adinda Nur Aisyah', gender: 'P' as const },
  { name: 'Ahmad Bilal Al-Ghifari', gender: 'L' as const },
  { name: 'Aliya Zahra Ramadhani', gender: 'P' as const },
  { name: 'Amira Khairunnisa', gender: 'P' as const },
  { name: 'Arif Maulana Hakim', gender: 'L' as const },
  { name: 'Bagas Aditya Prasetyo', gender: 'L' as const },
  { name: 'Chairunnisa Syifa', gender: 'P' as const },
  { name: 'Danial Zaki Mubarak', gender: 'L' as const },
  { name: 'Fatimah Az-Zahra', gender: 'P' as const },
  { name: 'Fauzan Muhammad Rizky', gender: 'L' as const },
  { name: 'Habibi Rahman Al-Fath', gender: 'L' as const },
  { name: 'Hafizhah Khansa Nabilah', gender: 'P' as const },
  { name: 'Ilyas Rayhan Saputra', gender: 'L' as const },
  { name: 'Khayla Putri Anggraini', gender: 'P' as const },
  { name: 'Luthfi Hamzah Siregar', gender: 'L' as const },
  { name: 'Muhammad Alif Syahputra', gender: 'L' as const },
  { name: 'Nabila Syakira Putri', gender: 'P' as const },
  { name: 'Qonita Salma Salsabila', gender: 'P' as const },
  { name: 'Rafiandra Dwi Cahyo', gender: 'L' as const },
  { name: 'Salwa Medina Husna', gender: 'P' as const },
  { name: 'Taufiq Hidayatullah', gender: 'L' as const },
  { name: 'Yasmin Aurelia Zahid', gender: 'P' as const },
  { name: 'Zidan Al-Farisi', gender: 'L' as const },
];

const rawStudents7B = [
  { name: 'Akmal Fathurrahman', gender: 'L' as const },
  { name: 'Annisa Dwi Lestari', gender: 'P' as const },
  { name: 'Arya Putra Wijaya', gender: 'L' as const },
  { name: 'Azzahra Cantika Putri', gender: 'P' as const },
  { name: 'Bintang Ramadhan', gender: 'L' as const },
  { name: 'Citra Kirana Dewi', gender: 'P' as const },
  { name: 'Dafa Ilham Maulana', gender: 'L' as const },
  { name: 'Dini Fitriyani', gender: 'P' as const },
  { name: 'Farhan Nur Fauzi', gender: 'L' as const },
  { name: 'Gita Maharani', gender: 'P' as const },
  { name: 'Haikal Fadhil Pratama', gender: 'L' as const },
  { name: 'Indah Permata Sari', gender: 'P' as const },
  { name: 'Javier Zaidan Al-Kindi', gender: 'L' as const },
  { name: 'Kayla Safitri', gender: 'P' as const },
  { name: 'Muhammad Faqihuddin', gender: 'L' as const },
  { name: 'Nada Syahrani', gender: 'P' as const },
  { name: 'Prabu Siliwangi Al-Fatih', gender: 'L' as const },
  { name: 'Rania Husna Kamila', gender: 'P' as const },
  { name: 'Reyhan Akbar Maulana', gender: 'L' as const },
  { name: 'Siti Maryam Al-Kubro', gender: 'P' as const },
  { name: 'Syakir Daulay Hidayat', gender: 'L' as const },
  { name: 'Tiara Rahmadani', gender: 'P' as const },
  { name: 'Wildan Zulfikar', gender: 'L' as const },
  { name: 'Zahra Aulia Rahmah', gender: 'P' as const },
];

const rawStudents8A = [
  { name: 'Adityawarman Saputra', gender: 'L' as const },
  { name: 'Almira Shafa Salsabila', gender: 'P' as const },
  { name: 'Bayu Aji Pamungkas', gender: 'L' as const },
  { name: 'Dea Ananda Lestari', gender: 'P' as const },
  { name: 'Fikri Haikal Rahman', gender: 'L' as const },
  { name: 'Ghaniyya Nurul Izzah', gender: 'P' as const },
  { name: 'Hasan Basri Al-Farizi', gender: 'L' as const },
  { name: 'Intan Nur Aini', gender: 'P' as const },
  { name: 'Kemal Pasha Al-Ghazi', gender: 'L' as const },
  { name: 'Layla Nur Halimah', gender: 'P' as const },
  { name: 'Muhammad Ihsan Kamil', gender: 'L' as const },
  { name: 'Najwa Shihab Khadijah', gender: 'P' as const },
  { name: 'Omar Bima Sena', gender: 'L' as const },
  { name: 'Putri Ayu Wandira', gender: 'P' as const },
  { name: 'Rizki Aditya Pratama', gender: 'L' as const },
  { name: 'Salsabila Firdaus', gender: 'P' as const },
  { name: 'Tegar Satria Wibawa', gender: 'L' as const },
  { name: 'Ulya Rahmawati', gender: 'P' as const },
  { name: 'Vino Bastian Ramadhan', gender: 'L' as const },
  { name: 'Winda Asmarani', gender: 'P' as const },
  { name: 'Yusuf Habibi Al-Banna', gender: 'L' as const },
  { name: 'Zaskia Adya Mecca', gender: 'P' as const },
];

const rawStudents8B = [
  { name: 'Abdul Fattah Syarif', gender: 'L' as const },
  { name: 'Bella Safira Anggraini', gender: 'P' as const },
  { name: 'Cahya Gumilar', gender: 'L' as const },
  { name: 'Dhea Maharani', gender: 'P' as const },
  { name: 'Ehsan Nur Maulana', gender: 'L' as const },
  { name: 'Faradilla Ayu', gender: 'P' as const },
  { name: 'Gilang Ramadhan', gender: 'L' as const },
  { name: 'Hanifah Syahidah', gender: 'P' as const },
  { name: 'Ibrahim Khalilurrahman', gender: 'L' as const },
  { name: 'Jihan Audy Salsabila', gender: 'P' as const },
  { name: 'Kautsar Al-Kindi', gender: 'L' as const },
  { name: 'Lia Fitriani', gender: 'P' as const },
  { name: 'Maulana Malik Ibrahim', gender: 'L' as const },
  { name: 'Nurul Huda', gender: 'P' as const },
  { name: 'Panji Gumilang Putra', gender: 'L' as const },
  { name: 'Rina Astuti', gender: 'P' as const },
  { name: 'Salim Bahanan', gender: 'L' as const },
  { name: 'Tasya Kamila Putri', gender: 'P' as const },
  { name: 'Usman bin Affan Putra', gender: 'L' as const },
  { name: 'Vivi Novita Sari', gender: 'P' as const },
  { name: 'Wisnu Wardhana', gender: 'L' as const },
  { name: 'Zulfa Nur Sabrina', gender: 'P' as const },
];

const rawStudents9A = [
  { name: 'Ahmad Syafiq Al-Baqir', gender: 'L' as const },
  { name: 'Aisyah Humaira', gender: 'P' as const },
  { name: 'Bagus Tri Pamungkas', gender: 'L' as const },
  { name: 'Chelsea Olivia Putri', gender: 'P' as const },
  { name: 'Dimas Anggara', gender: 'L' as const },
  { name: 'Eka Nurjanah', gender: 'P' as const },
  { name: 'Fadhil Muhammad', gender: 'L' as const },
  { name: 'Gisella Anastasia Rahma', gender: 'P' as const },
  { name: 'Harun Al-Rasyid', gender: 'L' as const },
  { name: 'Inaya Wahid', gender: 'P' as const },
  { name: 'Joko Susilo Pratama', gender: 'L' as const },
  { name: 'Khansa Naura Syakira', gender: 'P' as const },
  { name: 'Luqman Al-Hakim', gender: 'L' as const },
  { name: 'Mawaddah Warahmah', gender: 'P' as const },
  { name: 'Naufal Ghani Al-Ghazali', gender: 'L' as const },
  { name: 'Oki Setiana Dewi Putri', gender: 'P' as const },
  { name: 'Pramudya Ananta', gender: 'L' as const },
  { name: 'Qurrota A\'yun', gender: 'P' as const },
  { name: 'Raden Mas Said', gender: 'L' as const },
  { name: 'Syifa Hadju Az-Zahra', gender: 'P' as const },
];

const rawStudents9B = [
  { name: 'Alif Ba Ta Saputra', gender: 'L' as const },
  { name: 'Bunga Citra Lestari', gender: 'P' as const },
  { name: 'Candra Darusman', gender: 'L' as const },
  { name: 'Dian Sastrowardoyo', gender: 'P' as const },
  { name: 'Emir Mahira', gender: 'L' as const },
  { name: 'Fitri Tropica', gender: 'P' as const },
  { name: 'Genta Buana', gender: 'L' as const },
  { name: 'Hana Saraswati', gender: 'P' as const },
  { name: 'Iqbaal Ramadhan', gender: 'L' as const },
  { name: 'Jessica Mila Syahrini', gender: 'P' as const },
  { name: 'Kevin Julio Al-Farabi', gender: 'L' as const },
  { name: 'Laudya Cynthia Bella', gender: 'P' as const },
  { name: 'Marcell Darwin', gender: 'L' as const },
  { name: 'Natasha Wilona Zahra', gender: 'P' as const },
  { name: 'Onky Alexander', gender: 'L' as const },
  { name: 'Prilly Latuconsina', gender: 'P' as const },
  { name: 'Raffi Ahmad Maulana', gender: 'L' as const },
  { name: 'Sherina Munaf', gender: 'P' as const },
  { name: 'Teuku Wisnu Al-Fatih', gender: 'L' as const },
  { name: 'Zaskia Sungkar', gender: 'P' as const },
];

function buildStudents(): Student[] {
  const result: Student[] = [];
  const map: Record<string, { list: { name: string; gender: 'L' | 'P' }[]; baseNisn: number }> = {
    '7A': { list: rawStudents7A, baseNisn: 3125001 },
    '7B': { list: rawStudents7B, baseNisn: 3125025 },
    '8A': { list: rawStudents8A, baseNisn: 3114001 },
    '8B': { list: rawStudents8B, baseNisn: 3114023 },
    '9A': { list: rawStudents9A, baseNisn: 3103001 },
    '9B': { list: rawStudents9B, baseNisn: 3103021 },
  };

  Object.entries(map).forEach(([classId, info]) => {
    info.list.forEach((st, idx) => {
      const studentId = `std-${classId}-${idx + 1}`;
      const nisn = `00${info.baseNisn + idx}`;
      const nipd = `2627${classId}${String(idx + 1).padStart(2, '0')}`;
      result.push({
        id: studentId,
        nisn,
        nipd,
        name: st.name,
        gender: st.gender,
        classId,
        parentName: `Orang Tua / Wali dari ${st.name.split(' ')[0]}`,
        phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      });
    });
  });

  return result;
}

export const INITIAL_STUDENTS: Student[] = buildStudents();

export const MONTH_CONFIG_LIST = [
  { key: '2026-07', label: 'Juli 2026', semester: 'ganjil', effectiveDays: 15 },
  { key: '2026-08', label: 'Agustus 2026', semester: 'ganjil', effectiveDays: 23 },
  { key: '2026-09', label: 'September 2026', semester: 'ganjil', effectiveDays: 22 },
  { key: '2026-10', label: 'Oktober 2026', semester: 'ganjil', effectiveDays: 24 },
  { key: '2026-11', label: 'November 2026', semester: 'ganjil', effectiveDays: 22 },
  { key: '2026-12', label: 'Desember 2026', semester: 'ganjil', effectiveDays: 18 },
  { key: '2027-01', label: 'Januari 2027', semester: 'genap', effectiveDays: 21 },
  { key: '2027-02', label: 'Februari 2027', semester: 'genap', effectiveDays: 20 },
  { key: '2027-03', label: 'Maret 2027', semester: 'genap', effectiveDays: 21 },
  { key: '2027-04', label: 'April 2027', semester: 'genap', effectiveDays: 18 },
  { key: '2027-05', label: 'Mei 2027', semester: 'genap', effectiveDays: 20 },
  { key: '2027-06', label: 'Juni 2027', semester: 'genap', effectiveDays: 16 },
];

export function generateSeedMonthlyAttendance(students: Student[]): MonthlyAttendanceRecord[] {
  const records: MonthlyAttendanceRecord[] = [];

  students.forEach((student, sIdx) => {
    const isChronicallyAbsent = sIdx === 6 || sIdx === 18;
    const isOccasionallySick = sIdx % 4 === 0;

    MONTH_CONFIG_LIST.forEach((m, mIdx) => {
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      let notes = '';

      // Only seed non-zero absences for months up to current (Juli - November 2026)
      if (mIdx <= 4) {
        if (isChronicallyAbsent) {
          alpa = (sIdx + mIdx) % 2 === 0 ? 2 : 1;
          sakit = 1;
          izin = 1;
          notes = 'Sering tidak hadir tanpa kabar';
        } else if (isOccasionallySick) {
          sakit = (sIdx + mIdx) % 3 === 0 ? 2 : 1;
          izin = (sIdx + mIdx) % 4 === 0 ? 1 : 0;
          alpa = 0;
          notes = 'Surat dokter terlampir';
        } else {
          // Normal student
          sakit = (sIdx * 11 + mIdx) % 7 === 0 ? 1 : 0;
          izin = (sIdx * 13 + mIdx) % 9 === 0 ? 1 : 0;
          alpa = 0;
        }
      }

      const hadir = Math.max(0, m.effectiveDays - (sakit + izin + alpa));

      records.push({
        id: `mar-${student.id}-${m.key}`,
        studentId: student.id,
        classId: student.classId,
        monthKey: m.key,
        effectiveDays: m.effectiveDays,
        hadir,
        sakit,
        izin,
        alpa,
        notes,
        recordedBy: 'Guru Wali Kelas',
        updatedAt: '2026-11-09T08:00:00Z',
      });
    });
  });

  return records;
}

