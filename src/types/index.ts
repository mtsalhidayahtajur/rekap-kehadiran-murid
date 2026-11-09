export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface Student {
  id: string;
  nisn: string;
  nipd?: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  phone?: string;
  parentName?: string;
}

export interface ClassInfo {
  id: string;
  name: string; // e.g. "Kelas VII-A"
  grade: '7' | '8' | '9';
  homeroomTeacher: string;
  totalStudents: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus; // H: Hadir, S: Sakit, I: Izin, A: Alpa
  notes?: string;
  recordedBy: string;
  updatedAt: string;
}

export interface MonthlyAttendanceRecord {
  id: string; // studentId + monthKey
  studentId: string;
  classId: string;
  monthKey: string; // "2026-07", "2026-08", etc.
  effectiveDays: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  notes?: string;
  recordedBy: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'kepala_madrasah' | 'kepala_tu' | 'guru_wali_kelas' | 'guru_piket';
  title: string;
  assignedClassId?: string;
  nip?: string;
}

export interface SchoolInfo {
  name: string;
  foundation: string;
  nsm: string;
  npsn: string;
  address: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  academicYear: string; // "2026/2027"
  headmaster: {
    name: string;
    title: string;
    nip: string;
  };
  headOfAdmin: {
    name: string;
    title: string;
    nip: string;
  };
  logoUrl: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'input_monthly'
  | 'recap_monthly'
  | 'recap_semester'
  | 'recap_yearly'
  | 'students'
  | 'print_official';
