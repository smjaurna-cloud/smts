import { storageService } from '../services/storage';
import { icons } from '../utils/icons';

export function renderDataTab(): string {
  const students = storageService.getStudents();
  const records = storageService.getAttendanceRecords();
  const petitions = storageService.getPetitions();
  const receipts = storageService.getTuitionReceipts();
  const rooms = storageService.getZoomRooms();
  const totalCourses = rooms.reduce((acc, r) => acc + (r.schedules ? r.schedules.length : 0), 0);

  return `
    <div class="space-y-8 pb-16">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Download Center & Data Export
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            ศูนย์ดาวน์โหลดและจัดการข้อมูลระบบ (Download Center)
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-0.5">
            ดาวน์โหลดข้อมูลไปใช้งานในรูปแบบ Excel/CSV (ภาษาไทย UTF-8) หรือสำรองระบบทั้งชุด (JSON Backup)
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <span class="w-4 h-4 text-amber-600">${icons.sparkles}</span>
            <span>UTF-8 BOM รองรับ Excel 100%</span>
          </span>
        </div>
      </div>

      <!-- Current Storage Statistics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">นิสิตในระบบ</span>
            <span class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">${icons.users}</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 mt-2">${students.length} <span class="text-xs font-normal text-slate-400">รูป/คน</span></div>
        </div>

        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">บันทึกเข้าเรียน</span>
            <span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">${icons.clock}</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 mt-2">${records.length} <span class="text-xs font-normal text-slate-400">รายการ</span></div>
        </div>

        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">รายวิชาใน ๔ ซูม</span>
            <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">${icons.video}</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 mt-2">${totalCourses} <span class="text-xs font-normal text-slate-400">รายวิชา</span></div>
        </div>

        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">ใบเสร็จ/คำร้อง</span>
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">${icons.fileText}</span>
          </div>
          <div class="text-2xl font-bold text-slate-900 mt-2">${receipts.length + petitions.length} <span class="text-xs font-normal text-slate-400">รายการ</span></div>
        </div>
      </div>

      <!-- SECTION 1: DEDICATED DOWNLOAD CENTER -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 border-b border-stone-200 pb-2">
          <span class="w-5 h-5 text-amber-600">${icons.download}</span>
          <h3 class="text-base font-bold text-slate-900">พื้นที่ดาวน์โหลดข้อมูลไปใช้งาน (Export to Excel / CSV)</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Download Card 1: Attendance Records -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  ${icons.scanFace}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  ${records.length} รายการ
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-900">ประวัติการเข้าเรียน (Attendance Log)</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดประวัติการเช็กชื่อสแกนใบหน้าและเช็กชื่อด้วยตนเอง พร้อมวัน-เวลา, ผลสแกน, Difference Score และค่าความแม่นยำ
              </p>
            </div>
            <button
              type="button"
              id="btn-dl-attendance-csv"
              class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ดาวน์โหลด Excel/CSV (เข้าเรียน)</span>
            </button>
          </div>

          <!-- Download Card 2: Student Roster -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  ${icons.users}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  ${students.length} นิสิต
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-900">ทะเบียนรายชื่อนิสิต (Student Roster)</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดรายชื่อนิสิตระดับบัณฑิตศึกษา ๓ สาขาวิชา ๖ รุ่น พร้อมรหัสนิสิต, คำนำหน้า/สมณศักดิ์, ฉายาบาลี, อีเมล และสถานะ PDPA
              </p>
            </div>
            <button
              type="button"
              id="btn-dl-students-csv"
              class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ดาวน์โหลด Excel/CSV (ทะเบียนนิสิต)</span>
            </button>
          </div>

          <!-- Download Card 3: Class Timetables & Faculty -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  ${icons.calendar}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  ภาค ๑/๒๕๖๙
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-900">ตารางเรียนและอาจารย์ (Timetable)</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดตารางการเรียนการสอน ภาคเรียนที่ ๑/๒๕๖๙ ครบทั้ง ๔ ห้องเรียน Zoom พร้อมรหัสวิชา, คาบเรียน, อาจารย์ผู้สอน และคณะผู้สอนร่วม
              </p>
            </div>
            <button
              type="button"
              id="btn-dl-timetable-csv"
              class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ดาวน์โหลด Excel/CSV (ตารางสอน)</span>
            </button>
          </div>

          <!-- Download Card 4: Tuition Receipts -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${icons.creditCard}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ${receipts.length} ใบเสร็จ
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-900">ทะเบียนใบเสร็จค่าเทอม (Tuition Receipts)</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดสรุปรายการชำระค่าธรรมเนียมการศึกษา, เลขที่ใบเสร็จทางการ, ยอดเงิน, วิธีการชำระ และข้อมูลอ้างอิงของฝ่ายการเงิน
              </p>
            </div>
            <button
              type="button"
              id="btn-dl-receipts-csv"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ดาวน์โหลด Excel/CSV (การเงิน)</span>
            </button>
          </div>

          <!-- Download Card 5: Petitions Log -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  ${icons.messageSquare}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  ${petitions.length} คำร้อง
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-900">บันทึกคำร้องเรียน (Petitions Log)</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดสรุปคำร้องเรียนและข้อเสนอแนะ ๕ หมวดหมู่ พร้อมระดับความเร่งด่วนและสถานะการติดตาม (Pending/In Progress/Resolved)
              </p>
            </div>
            <button
              type="button"
              id="btn-dl-petitions-csv"
              class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ดาวน์โหลด Excel/CSV (คำร้องเรียน)</span>
            </button>
          </div>

          <!-- Download Card 6: Complete JSON Backup -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  ${icons.database}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  Full Backup
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-900">สำรองระบบทั้งหมด (Full JSON Backup)</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                ดาวน์โหลดข้อมูลทุกระบบรวมเวกเตอร์ 128 มิติ, ประวัติเข้าเรียน, ใบเสร็จ, และคำร้อง เป็นไฟล์ JSON ก้อนเดียวเพื่อย้ายเครื่องหรือกู้คืน
              </p>
            </div>
            <button
              type="button"
              id="btn-export-json"
              class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="w-4 h-4">${icons.download}</span>
              <span>ส่งออกไฟล์ JSON สำรองข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SECTION 2: RESTORE & ADMINISTRATIVE TOOLS -->
      <div class="space-y-4 pt-4 border-t border-stone-200">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 text-slate-600">${icons.shieldCheck}</span>
          <h3 class="text-base font-bold text-slate-900">การนำเข้าข้อมูลและการจัดการระบบ (Restore & Reset)</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Restore & Import JSON -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                ${icons.upload}
              </div>
              <h4 class="text-sm font-bold text-slate-900">นำเข้าข้อมูลสำรอง (Restore JSON)</h4>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                เลือกไฟล์ JSON ที่เคยส่งออกจากระบบ เพื่อกู้คืนรายชื่อนิสิตและประวัติการเข้าเรียนทั้งหมดกลับคืนมา
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-stone-100">
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

          <!-- Seed Demo Data -->
          <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                ${icons.sparkles}
              </div>
              <h4 class="text-sm font-bold text-slate-900">สร้างข้อมูลจำลอง (Seed Demo Data)</h4>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                สร้างข้อมูลตัวอย่างอัตโนมัติ: นิสิต ๑๐ รูป/คน ๓ สาขาวิชา ๖ รุ่น พร้อมประวัติเข้าเรียน ๗ วัน ใบเสร็จ และคำร้อง
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-stone-100">
              <button 
                type="button" 
                id="btn-seed-data"
                class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span class="w-4 h-4">${icons.sparkles}</span>
                <span>โหลดข้อมูลตัวอย่าง ๑๐ นิสิต</span>
              </button>
            </div>
          </div>

          <!-- One-Click System Reset -->
          <div class="bg-rose-50/40 rounded-2xl p-5 border border-rose-200 shadow-xs flex flex-col justify-between">
            <div>
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                ${icons.trash2}
              </div>
              <h4 class="text-sm font-bold text-rose-900">ล้างข้อมูลทั้งหมด (System Reset)</h4>
              <p class="text-xs text-rose-700 mt-1 leading-relaxed">
                ล้างข้อมูลนิสิต เวกเตอร์ใบหน้า และประวัติเข้าเรียนทั้งหมดออกจากเบราว์เซอร์ สำหรับเริ่มต้นภาคเรียนใหม่
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-rose-200/80">
              <button 
                type="button" 
                id="btn-system-reset"
                class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span class="w-4 h-4">${icons.trash2}</span>
                <span>ล้างข้อมูลระบบทั้งหมด (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

