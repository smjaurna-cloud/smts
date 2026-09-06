import { Student, COHORTS, CohortId } from '../types/index';
import { icons } from '../utils/icons';

export function renderEditStudentModal(student: Student | null): string {
  if (!student) return '';

  const cohortOptions = (Object.keys(COHORTS) as CohortId[]).map(key => {
    const isSelected = student.programCohort === key ? 'selected' : '';
    return `<option value="${key}" ${isSelected}>${COHORTS[key].title}</option>`;
  }).join('');

  return `
    <div id="modal-edit-backdrop" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              ${icons.edit}
            </span>
            <h3 class="text-base font-bold text-slate-900">แก้ไขข้อมูลนิสิต</h3>
          </div>
          <button type="button" id="btn-close-edit-modal" class="text-slate-400 hover:text-slate-600 p-1">
            ✕
          </button>
        </div>

        <form id="form-edit-student" class="space-y-3">
          <input type="hidden" id="edit-internal-id" value="${student.id}" />

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสนิสิต</label>
            <input 
              type="text" 
              value="${student.studentId}" 
              disabled 
              class="w-full bg-slate-100 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล / สมณศักดิ์ / ฉายาบาลี</label>
            <input 
              type="text" 
              id="edit-fullname" 
              value="${student.fullName}" 
              required
              class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
            <input 
              type="email" 
              id="edit-email" 
              value="${student.email}" 
              required
              class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">สาขาวิชาและรุ่น</label>
            <select 
              id="edit-cohort" 
              class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            >
              ${cohortOptions}
            </select>
          </div>

          <div class="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <button 
              type="button" 
              id="btn-cancel-edit" 
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderDeleteConfirmModal(student: Student | null, attendanceCount: number): string {
  if (!student) return '';

  return `
    <div id="modal-delete-backdrop" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 border border-rose-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center gap-3 text-rose-600">
          <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            ${icons.alertTriangle}
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">ยืนยันการลบนิสิต (Cascade Delete)</h3>
            <p class="text-xs text-slate-500 mt-0.5">การกระทำนี้จะลบข้อมูลที่เกี่ยวข้องทั้งหมดอย่างถาวร</p>
          </div>
        </div>

        <div class="bg-rose-50/70 rounded-xl p-3.5 border border-rose-200/80 text-xs space-y-1.5">
          <div class="font-bold text-rose-900">${student.fullName} (รหัส ${student.studentId})</div>
          <p class="text-rose-800">
            ⚠️ <strong>ระบบ Cascade Delete:</strong> ประวัติการเข้าเรียนของนิสิตท่านนี้จำนวน <strong>${attendanceCount} รายการ</strong> จะถูกลบทิ้งทั้งหมดโดยอัตโนมัติ
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button 
            type="button" 
            id="btn-cancel-delete" 
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            type="button" 
            id="btn-confirm-delete" 
            data-delete-id="${student.id}"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            ยืนยันการลบแบบ Cascade
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderResetConfirmModal(): string {
  return `
    <div id="modal-reset-backdrop" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 border border-rose-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center gap-3 text-rose-600">
          <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            ${icons.trash2}
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">ยืนยันการล้างระบบ (System Reset)</h3>
            <p class="text-xs text-slate-500 mt-0.5">การกระทำนี้ไม่สามารถกู้คืนได้</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed">
          ข้อมูลนิสิตทั้งหมด เวกเตอร์ใบหน้าชีวมิติ และประวัติการบันทึกเวลาเรียนทั้งหมดใน Local Storage จะถูกลบออกจนหมดสิ้น แนะนำให้ดาวน์โหลดไฟล์สำรอง (Export JSON) ไว้ก่อน
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button 
            type="button" 
            id="btn-cancel-reset" 
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            type="button" 
            id="btn-confirm-reset" 
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            ล้างข้อมูลทั้งหมดทันที
          </button>
        </div>
      </div>
    </div>
  `;
}
