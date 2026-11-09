import {
  AttendanceRecord,
  ClassInfo,
  MonthlyAttendanceRecord,
  SchoolInfo,
  Student,
  UserProfile,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_SCHOOL_INFO,
  INITIAL_STUDENTS,
  INITIAL_USERS,
  generateSeedMonthlyAttendance,
} from '../data/initialData';

const STORAGE_KEYS = {
  SCHOOL_INFO: 'mth_school_info_v2',
  CLASSES: 'mth_classes_v2',
  STUDENTS: 'mth_students_v2',
  MONTHLY_ATTENDANCE: 'mth_monthly_attendance_v2',
  CURRENT_USER: 'mth_current_user_v2',
};

export function getStoredSchoolInfo(): SchoolInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.foundation = 'Yayasan Al Hidayah Tajur Citeureup Bogor';
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load school info', e);
  }
  return INITIAL_SCHOOL_INFO;
}

export function saveSchoolInfo(info: SchoolInfo): void {
  localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(info));
}

export function getStoredClasses(): ClassInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load classes', e);
  }
  return INITIAL_CLASSES;
}

export function saveClasses(classes: ClassInfo[]): void {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

export function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load students', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function getStoredMonthlyAttendance(): MonthlyAttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_ATTENDANCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load monthly attendance', e);
  }
  const initial = generateSeedMonthlyAttendance(INITIAL_STUDENTS);
  localStorage.setItem(STORAGE_KEYS.MONTHLY_ATTENDANCE, JSON.stringify(initial));
  return initial;
}

export function saveMonthlyAttendance(records: MonthlyAttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.MONTHLY_ATTENDANCE, JSON.stringify(records));
}

export function getStoredCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load current user', e);
  }
  return INITIAL_USERS[2]; // Wali Kelas VII-A
}

export function saveCurrentUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.SCHOOL_INFO);
  localStorage.removeItem(STORAGE_KEYS.CLASSES);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.MONTHLY_ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

  localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(INITIAL_SCHOOL_INFO));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  const seeded = generateSeedMonthlyAttendance(INITIAL_STUDENTS);
  localStorage.setItem(STORAGE_KEYS.MONTHLY_ATTENDANCE, JSON.stringify(seeded));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[2]));
}

