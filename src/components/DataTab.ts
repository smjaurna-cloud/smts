import { storageService } from '../services/storage';
import { icons } from '../utils/icons';

export function renderDataTab(): string {
  const students = storageService.getStudents();
  const records = storageService.getAttendanceRecords();

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          Data Management & Archival
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
          การจัดการข้อมูล สำรอง และรีเซ็ตระบบ
        </h2>
        <p class="text-xs md:text-sm text-slate-500 mt-0.5">
          ส่งออก-นำเข้าไฟล์ JSON เพื่อการสำรองข้อมูล (Backup & Restore) โหลดข้อมูลตัวอย่าง หรือล้างระบบ
        </p>
      </div>

      <!-- Current Storage Statistics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            ${icons.users}
          </div>
          <div>
            <div class="text-xs font-medium text-slate-500">จำนวนนิสิตที่บันทึกในเครื่อง</div>
            <div class="text-2xl font-bold text-slate-900">${students.length} <span class="text-xs font-normal text-slate-400">รูป/คน</span></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            ${icons.clock}
          </div>
          <div>
            <div class="text-xs font-medium text-slate-500">ประวัติการเข้าเรียนทั้งหมด</div>
            <div class="text-2xl font-bold text-slate-900">${records.length} <span class="text-xs font-normal text-slate-400">รายการ</span></div>
          </div>
        </div>
      </div>

      <!-- Main Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Card 1: Backup & Export JSON -->
        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              ${icons.download}
            </div>
            <h3 class="text-base font-bold text-slate-900">ส่งออกข้อมูลสำรอง (Export JSON)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              ดาวน์โหลดข้อมูลนิสิตทั้งหมดพร้อมเวกเตอร์ชีวมิติใบหน้า และประวัติการเข้าเรียนทั้งหมดเป็นไฟล์ JSON เพื่อสำรองหรือย้ายเครื่อง
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-stone-100">
            <button 
              type="button" 
              id="btn-export-json"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ส่งออกไฟล์ JSON สำรองข้อมูล</span>
            </button>
          </div>
        </div>

        <!-- Card 2: Restore & Import JSON -->
        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              ${icons.upload}
            </div>
            <h3 class="text-base font-bold text-slate-900">นำเข้าข้อมูลสำรอง (Import JSON)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              เลือกไฟล์ JSON ที่เคยส่งออกจากระบบ เพื่อกู้คืนรายชื่อนิสิตและประวัติการเข้าเรียนทั้งหมดกลับคืนมา
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-stone-100">
            <input type="file" id="ipt-import-file" accept=".json,application/json" class="hidden" />
            <button 
              type="button" 
              id="btn-trigger-import"
              class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.upload}</span>
              <span>เลือกไฟล์ JSON เพื่อนำเข้า</span>
            </button>
          </div>
        </div>

        <!-- Card 3: Seed Demo Data -->
        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              ${icons.sparkles}
            </div>
            <h3 class="text-base font-bold text-slate-900">สร้างข้อมูลจำลอง (Seed Demo Data)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              สร้างข้อมูลตัวอย่างอัตโนมัติ: นิสิตบัณฑิตศึกษา ๑๐ รูป/คน จากทั้ง ๓ สาขาวิชา ๖ รุ่น พร้อมประวัติการเข้าเรียนย้อนหลัง ๗ วัน เพื่อทดสอบระบบได้ทันที
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-stone-100">
            <button 
              type="button" 
              id="btn-seed-data"
              class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.sparkles}</span>
              <span>โหลดข้อมูลตัวอย่าง ๑๐ นิสิต ๓ สาขา</span>
            </button>
          </div>
        </div>

        <!-- Card 4: One-Click System Reset -->
        <div class="bg-rose-50/40 rounded-2xl p-5 border border-rose-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              ${icons.trash2}
            </div>
            <h3 class="text-base font-bold text-rose-900">ล้างข้อมูลทั้งหมด (System Reset)</h3>
            <p class="text-xs text-rose-700 mt-1 leading-relaxed">
              ล้างข้อมูลนิสิต เวกเตอร์ใบหน้า และประวัติการเข้าเรียนทั้งหมดออกจาก Local Storage สำหรับเริ่มต้นภาคการศึกษาใหม่ (มีการยืนยันความปลอดภัย)
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-rose-200/80">
            <button 
              type="button" 
              id="btn-system-reset"
              class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.trash2}</span>
              <span>ล้างข้อมูลทั้งหมดในระบบ (Reset All Data)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
