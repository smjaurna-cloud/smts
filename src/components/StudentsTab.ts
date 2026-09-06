import { storageService } from '../services/storage';
import { COHORTS, CohortId, Student } from '../types/index';
import { icons } from '../utils/icons';

export interface StudentsTabState {
  searchTerm: string;
  selectedCohort: string; // 'ALL' or CohortId
  editingStudentId: string | null;
  deletingStudentId: string | null;
}

export function renderStudentsTab(state: StudentsTabState): string {
  const allStudents = storageService.getStudents();
  const allRecords = storageService.getAttendanceRecords();

  // Filter students
  const filteredStudents = allStudents.filter(s => {
    const matchesCohort = state.selectedCohort === 'ALL' || s.programCohort === state.selectedCohort;
    const searchLower = state.searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      s.fullName.toLowerCase().includes(searchLower) ||
      s.studentId.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower);
    return matchesCohort && matchesSearch;
  });

  const cohortFilters = [
    { id: 'ALL', label: 'ทุกสาขาวิชา/รุ่น' },
    ...Object.values(COHORTS).map(c => ({ id: c.id, label: c.shortTitle }))
  ].map(cf => {
    const isSelected = state.selectedCohort === cf.id;
    const cls = isSelected
      ? 'bg-rose-600 text-white font-semibold shadow-xs'
      : 'bg-white text-slate-700 hover:bg-amber-50 border border-stone-200';
    return `
      <button 
        type="button" 
        data-filter-cohort="${cf.id}"
        class="px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap cursor-pointer ${cls}"
      >
        ${cf.label}
      </button>
    `;
  }).join('');

  // Table rows
  const rows = filteredStudents.length === 0
    ? `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-500">
          <div class="flex flex-col items-center justify-center gap-3">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              ${icons.search}
            </div>
            <div>
              <p class="font-medium text-slate-700">ไม่พบนิสิตที่ตรงกับเงื่อนไขการค้นหา</p>
              <p class="text-xs text-slate-400 mt-0.5">ลองเปลี่ยนคำค้นหา หรือลงทะเบียนนิสิตใหม่</p>
            </div>
            <button 
              type="button" 
              data-nav-tab="register" 
              class="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
            >
              <span class="w-4 h-4">${icons.userPlus}</span>
              ลงทะเบียนนิสิตใหม่
            </button>
          </div>
        </td>
      </tr>
    `
    : filteredStudents.map((s: Student) => {
        const cohortInfo = COHORTS[s.programCohort] || { shortTitle: s.programCohort, badgeColor: 'bg-slate-100 text-slate-700' };
        const hasFace = Array.isArray(s.faceDescriptor) && s.faceDescriptor.length > 0;
        const faceBadge = hasFace
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> ชีวมิติพร้อม (128-d)
             </span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              ยังไม่ลงทะเบียนใบหน้า
             </span>`;

        // Count how many attendance records for this student
        const attendanceCount = allRecords.filter(r => r.studentId === s.studentId || r.studentInternalId === s.id).length;

        return `
          <tr class="border-b border-stone-100 hover:bg-amber-50/40 transition-colors group">
            <td class="py-3.5 px-3 text-xs font-mono font-bold text-slate-800">
              ${s.studentId}
            </td>
            <td class="py-3.5 px-3 text-xs">
              <div class="font-semibold text-slate-900">${s.fullName}</div>
              <div class="text-[11px] text-slate-400">${s.email}</div>
            </td>
            <td class="py-3.5 px-3 text-xs">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${cohortInfo.badgeColor}">
                ${cohortInfo.shortTitle}
              </span>
            </td>
            <td class="py-3.5 px-3 text-xs">
              ${faceBadge}
            </td>
            <td class="py-3.5 px-3 text-xs text-center font-mono">
              <span class="inline-block px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-700 text-[11px]">
                ${attendanceCount} ครั้ง
              </span>
            </td>
            <td class="py-3.5 px-3 text-xs text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5">
                <button 
                  type="button" 
                  data-edit-student="${s.id}"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                  title="แก้ไขข้อมูลนิสิต"
                >
                  <span class="w-4 h-4">${icons.edit}</span>
                </button>
                <button 
                  type="button" 
                  data-delete-student="${s.id}"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="ลบนิสิตและประวัติเข้าเรียนทั้งหมด (Cascade Delete)"
                >
                  <span class="w-4 h-4">${icons.trash2}</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Graduate Student Registry & Cascade Management
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            ทะเบียนประวัตินิสิตระดับบัณฑิตศึกษา
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-0.5">
            จัดการข้อมูลนิสิต แก้ไขรายละเอียด และลบข้อมูลพร้อมประวัติการเข้าเรียนทั้งหมดแบบ Cascade Delete
          </p>
        </div>

        <button 
          type="button" 
          data-nav-tab="register"
          class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span class="w-4 h-4">${icons.userPlus}</span>
          ลงทะเบียนนิสิตใหม่
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        <!-- Search bar -->
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4">
            ${icons.search}
          </span>
          <input 
            type="text" 
            id="ipt-student-search" 
            placeholder="ค้นหาด้วยรหัสนิสิต, ชื่อ-นามสกุล, สมณศักดิ์, หรืออีเมล..."
            value="${state.searchTerm}"
            class="w-full bg-slate-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>

        <!-- Cohort Pills Filter -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          ${cohortFilters}
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-stone-100 flex items-center justify-between text-xs text-slate-500">
          <span>แสดงนิสิต ${filteredStudents.length} จากทั้งหมด ${allStudents.length} รูป/คน</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-stone-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th class="py-3 px-3">รหัสนิสิต</th>
                <th class="py-3 px-3">ชื่อ-นามสกุล / สมณศักดิ์ / อีเมล</th>
                <th class="py-3 px-3">สาขาวิชา / รุ่น</th>
                <th class="py-3 px-3">สถานะชีวมิติ</th>
                <th class="py-3 px-3 text-center">ประวัติเข้าเรียน</th>
                <th class="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
