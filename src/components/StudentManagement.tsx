import React, { useState, useMemo } from 'react';
import { ClassInfo, Student } from '../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  UserCheck,
  Phone,
  Edit,
  Trash2,
  School,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface StudentManagementProps {
  classes: ClassInfo[];
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddClass: (newClass: ClassInfo) => void;
  onUpdateClass: (updatedClass: ClassInfo) => void;
  onDeleteClass: (classId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  classes,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  // Sub-tab: 'students' or 'classes'
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'classes'>('classes');

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Student Modal state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Student Form state
  const [formName, setFormName] = useState<string>('');
  const [formNisn, setFormNisn] = useState<string>('');
  const [formNipd, setFormNipd] = useState<string>('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formClassId, setFormClassId] = useState<string>('7A');
  const [formParent, setFormParent] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');

  // Class Modal state
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  // Class Form state
  const [formClassName, setFormClassName] = useState<string>('');
  const [formGrade, setFormGrade] = useState<'7' | '8' | '9'>('7');
  const [formHomeroomTeacher, setFormHomeroomTeacher] = useState<string>('');

  // Open Add Student Modal
  const openAddStudentModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormNisn(`00${Math.floor(3100000 + Math.random() * 90000)}`);
    setFormNipd(`2627${selectedClassId === 'all' ? (classes[0]?.id || '7A') : selectedClassId}${Math.floor(10 + Math.random() * 89)}`);
    setFormGender('L');
    setFormClassId(selectedClassId === 'all' ? (classes[0]?.id || '7A') : selectedClassId);
    setFormParent('');
    setFormPhone('0812');
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (st: Student) => {
    setEditingStudent(st);
    setFormName(st.name);
    setFormNisn(st.nisn);
    setFormNipd(st.nipd || '');
    setFormGender(st.gender);
    setFormClassId(st.classId);
    setFormParent(st.parentName || '');
    setFormPhone(st.phone || '');
    setIsStudentModalOpen(true);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNisn.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: formName.trim(),
        nisn: formNisn.trim(),
        nipd: formNipd.trim(),
        gender: formGender,
        classId: formClassId,
        parentName: formParent.trim(),
        phone: formPhone.trim(),
      });
    } else {
      const newStudent: Student = {
        id: `std-new-${Date.now()}`,
        name: formName.trim(),
        nisn: formNisn.trim(),
        nipd: formNipd.trim(),
        gender: formGender,
        classId: formClassId,
        parentName: formParent.trim(),
        phone: formPhone.trim(),
      };
      onAddStudent(newStudent);
    }
    setIsStudentModalOpen(false);
  };

  // Open Add Class Modal
  const openAddClassModal = () => {
    setEditingClass(null);
    setFormClassName('Kelas VII-C');
    setFormGrade('7');
    setFormHomeroomTeacher('');
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls: ClassInfo) => {
    setEditingClass(cls);
    setFormClassName(cls.name);
    setFormGrade(cls.grade);
    setFormHomeroomTeacher(cls.homeroomTeacher);
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName.trim() || !formHomeroomTeacher.trim()) return;

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        name: formClassName.trim(),
        grade: formGrade,
        homeroomTeacher: formHomeroomTeacher.trim(),
      });
    } else {
      // Generate clean unique ID
      const baseId = `${formGrade}${formClassName.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase()}`;
      const id = classes.some((c) => c.id === baseId) ? `cls-${Date.now()}` : baseId;

      const newCls: ClassInfo = {
        id,
        name: formClassName.trim(),
        grade: formGrade,
        homeroomTeacher: formHomeroomTeacher.trim(),
        totalStudents: 0,
      };
      onAddClass(newCls);
    }
    setIsClassModalOpen(false);
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchClass = selectedClassId === 'all' || st.classId === selectedClassId;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        st.name.toLowerCase().includes(q) ||
        st.nisn.includes(q) ||
        (st.nipd && st.nipd.includes(q));
      return matchClass && matchQuery;
    });
  }, [students, selectedClassId, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Rombongan Belajar (Kelas) & Murid
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen kelas, penetapan wali kelas, dan pendaftaran peserta didik MTs Al Hidayah Tajur
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'classes' ? (
            <button
              onClick={openAddClassModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>
          ) : (
            <button
              onClick={openAddStudentModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Sub-Tab Switcher */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveSubTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'classes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Daftar Rombel / Kelas ({classes.length} Kelas)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Daftar Seluruh Murid ({students.length} Siswa)</span>
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-500 font-medium">
          T.A. 2026/2027 · MTs Al Hidayah Tajur Citeureup
        </div>
      </div>

      {/* SUB-TAB 1: DAFTAR KELAS & TAMBAH KELAS */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          
          {/* Top Info Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <School className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="font-bold">Manajemen Rombongan Belajar (Rombel):</strong> Anda dapat menambah kelas baru (misal Kelas VII-C, VIII-C, IX-C, dsb), mengubah wali kelas, dan mengelola kapasitas siswa.
              </div>
            </div>
            <button
              onClick={openAddClassModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          {/* Cards Grid of Classes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const studentCount = students.filter((s) => s.classId === cls.id).length;

              return (
                <div
                  key={cls.id}
                  className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Tingkat {cls.grade}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClassModal(cls)}
                        title="Edit Data Kelas"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (studentCount > 0) {
                            alert(
                              `Tidak dapat menghapus ${cls.name} karena masih memiliki ${studentCount} siswa terdaftar. Pindahkan siswa terlebih dahulu.`
                            );
                            return;
                          }
                          if (confirm(`Yakin ingin menghapus ${cls.name}?`)) {
                            onDeleteClass(cls.id);
                          }
                        }}
                        title="Hapus Kelas"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                      {cls.name}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Wali Kelas: <strong className="text-slate-800">{cls.homeroomTeacher}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Jumlah Siswa: <strong className="text-slate-900 font-mono">{studentCount} Orang</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setActiveSubTab('students');
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] hover:underline"
                    >
                      Lihat Siswa →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: DAFTAR MURID (SISWA) */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          
          {/* Filter Strip */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 shadow-2xs"
              >
                <option value="all">Semua Kelas ({students.length} Siswa)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.homeroomTeacher})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, NISN, atau NIPD siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="py-3 px-3 font-semibold text-center w-12 border-r border-slate-200">No</th>
                    <th className="py-3 px-3 font-semibold w-28 border-r border-slate-200">NISN</th>
                    <th className="py-3 px-3 font-semibold w-28 border-r border-slate-200">NIPD</th>
                    <th className="py-3 px-3 font-semibold border-r border-slate-200">Nama Lengkap Siswa</th>
                    <th className="py-3 px-3 font-semibold text-center w-14 border-r border-slate-200">L/P</th>
                    <th className="py-3 px-3 font-semibold w-32 border-r border-slate-200">Kelas</th>
                    <th className="py-3 px-3 font-semibold">Kontak Orang Tua</th>
                    <th className="py-3 px-3 font-semibold text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => {
                    const cls = classes.find((c) => c.id === st.classId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-100">
                          {st.nisn}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 border-r border-slate-100">
                          {st.nipd || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-100">
                          {st.name}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-100">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              st.gender === 'L'
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-pink-700 bg-pink-50'
                            }`}
                          >
                            {st.gender}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-100">
                          {cls?.name || st.classId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          <div>{st.parentName || 'Orang Tua / Wali'}</div>
                          <div className="text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{st.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditStudentModal(st)}
                              title="Edit Siswa"
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus ${st.name}?`)) {
                                onDeleteStudent(st.id);
                                }
                              }}
                              title="Hapus Siswa"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: TAMBAH / EDIT KELAS (ROMBEL) */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <School className="w-5 h-5 text-emerald-600" />
              <span>{editingClass ? 'Edit Rombongan Belajar (Kelas)' : 'Tambah Kelas Baru'}</span>
            </div>

            <form onSubmit={handleClassSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas VII-C, Kelas VIII-C, Kelas IX-C"
                  value={formClassName}
                  onChange={(e) => setFormClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat / Jenjang *
                </label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="7">Tingkat 7 (Kelas VII)</option>
                  <option value="8">Tingkat 8 (Kelas VIII)</option>
                  <option value="9">Tingkat 9 (Kelas IX)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Guru Wali Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadzah Halimah, S.Pd.I."
                  value={formHomeroomTeacher}
                  onChange={(e) => setFormHomeroomTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                >
                  {editingClass ? 'Simpan Perubahan Kelas' : 'Simpan Kelas Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH / EDIT MURID (SISWA) */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <span>{editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}</span>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Rayhan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    placeholder="003125001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIPD (Nomor Induk)
                  </label>
                  <input
                    type="text"
                    value={formNipd}
                    onChange={(e) => setFormNipd(e.target.value)}
                    placeholder="26277A01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombel (Kelas) *
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={formParent}
                  onChange={(e) => setFormParent(e.target.value)}
                  placeholder="Nama Orang Tua"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor HP WhatsApp Orang Tua
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                >
                  {editingStudent ? 'Simpan Perubahan Murid' : 'Simpan Murid Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
