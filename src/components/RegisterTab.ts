import { COHORTS, CohortId } from '../types/index';
import { icons } from '../utils/icons';

export function renderRegisterTab(): string {
  const cohortOptions = (Object.keys(COHORTS) as CohortId[]).map(key => {
    const info = COHORTS[key];
    return `<option value="${key}">${info.title}</option>`;
  }).join('');

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          Biometric Enrolment & Student Profile
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
          ลงทะเบียนนิสิตใหม่และจัดเก็บอัตลักษณ์ชีวมิติใบหน้า
        </h2>
        <p class="text-xs md:text-sm text-slate-500 mt-0.5">
          ระบบจะสกัดเฉพาะค่าเวกเตอร์ตัวเลข 128 มิติ (Facial Descriptor) จัดเก็บเป็นตัวอักษร 
          <span class="font-semibold text-rose-600">โดยไม่มีการบันทึกไฟล์ภาพถ่ายใดๆ ลงในระบบตามมาตรฐาน PDPA</span>
        </p>
      </div>

      <!-- Registration Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Student Info & PDPA Form (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <span class="text-rose-600">${icons.userPlus}</span>
            ข้อมูลนิสิตระดับบัณฑิตศึกษา (Student Information)
          </h3>

          <form id="form-register-student" class="mt-4 space-y-4">
            <!-- Student ID -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                รหัสนิสิต (Student ID) <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                id="reg-student-id" 
                required 
                placeholder="เช่น 6701102011"
                class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
              />
            </div>

            <!-- Full Name with Monastic Title -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล / สมณศักดิ์ / ฉายาบาลี (Full Name & Monastic Title) <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                id="reg-fullname" 
                required 
                placeholder="เช่น พระมหาปรีชา ปิยธมฺโม (ป.ธ.๙) หรือ ดร.กฤษณา พงษ์ศิริ"
                class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
              <span class="text-[11px] text-slate-400 mt-1 block">
                * รองรับสมณศักดิ์, ฉายาบาลี, และชื่อ-นามสกุลทางโลก โดยไม่ตัดทอน
              </span>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                อีเมลทางการ (Email) <span class="text-rose-500">*</span>
              </label>
              <input 
                type="email" 
                id="reg-email" 
                required 
                placeholder="เช่น preecha.p@mcu.ac.th"
                class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <!-- Program / Cohort Selection -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                หลักสูตรและรุ่นที่ศึกษา (Graduate Program & Cohort) <span class="text-rose-500">*</span>
              </label>
              <select 
                id="reg-cohort" 
                required 
                class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden cursor-pointer"
              >
                ${cohortOptions}
              </select>
            </div>

            <!-- PDPA Consent Checkbox -->
            <div class="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80 space-y-2">
              <div class="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="reg-pdpa-consent" 
                  required 
                  class="mt-1 w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <label for="reg-pdpa-consent" class="text-xs text-amber-950 font-medium cursor-pointer leading-relaxed">
                  <span class="font-bold text-amber-900 block mb-0.5">หนังสือยินยอมประมวลผลข้อมูลชีวมิติ (PDPA Consent)</span>
                  ข้าพเจ้ายินยอมให้วิทยาลัยประมวลผลข้อมูลชีวมิติใบหน้าเพื่อสกัดเป็นเวกเตอร์ตัวเลข (Mathematical Descriptor) ในการบันทึกเวลาเรียนตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ โดยระบบจะไม่บันทึกภาพถ่ายจริง
                </label>
              </div>
            </div>

            <!-- Form Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                id="btn-submit-registration"
                class="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all shadow-sm shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="w-4 h-4">${icons.checkCircle}</span>
                <span>บันทึกข้อมูลนิสิตและเวกเตอร์ใบหน้า</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Face Capture & Descriptor Generation (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div class="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span class="text-amber-600">${icons.camera}</span>
                จับภาพและสกัดเวกเตอร์ใบหน้า
              </h3>
              <button 
                type="button" 
                id="btn-reg-camera-toggle"
                class="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span class="w-3.5 h-3.5">${icons.refreshCw}</span>
                <span id="txt-reg-camera-btn">เปิดกล้อง</span>
              </button>
            </div>

            <!-- Live Camera Preview Frame -->
            <div class="mt-3 relative bg-slate-950 rounded-xl aspect-4/3 overflow-hidden flex items-center justify-center border border-stone-200">
              <video 
                id="reg-video" 
                autoplay 
                playsinline 
                muted 
                class="w-full h-full object-cover transform -scale-x-100 hidden"
              ></video>
              <canvas id="reg-canvas" class="hidden"></canvas>

              <!-- Target oval -->
              <div id="reg-target-box" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-36 h-48 sm:w-44 sm:h-56 rounded-full border-2 border-dashed border-rose-400/80 shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>
              </div>

              <!-- Idle placeholder -->
              <div id="reg-camera-idle" class="flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <div class="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 mb-2">
                  ${icons.camera}
                </div>
                <p class="text-xs font-medium text-slate-300">กล้องถ่ายภาพยังไม่เปิด</p>
                <p class="text-[11px] text-slate-500 mt-0.5">กด "เปิดกล้อง" เพื่อจับภาพใบหน้านิสิต</p>
              </div>

              <!-- Capture Loading State -->
              <div id="reg-loading-overlay" class="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white hidden">
                <div class="w-8 h-8 text-rose-500 animate-spin">${icons.loader}</div>
                <p class="text-xs text-slate-200">กำลังสกัดเวกเตอร์ชีวมิติ 128 มิติ...</p>
              </div>
            </div>

            <!-- Capture Button -->
            <div class="mt-3">
              <button 
                type="button" 
                id="btn-capture-face"
                class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                <span class="w-4 h-4">${icons.scanFace}</span>
                <span>ตรวจจับและสกัดเวกเตอร์ใบหน้า (Extract Descriptor)</span>
              </button>
            </div>

            <!-- Descriptor Signature Status Card -->
            <div id="reg-signature-status" class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div class="flex items-center gap-2 text-slate-600 font-medium">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>สถานะเวกเตอร์: ยังไม่ได้สกัดอัตลักษณ์</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                เมื่อสกัดสำเร็จ เวกเตอร์ 128 มิติ จะถูกแนบกับข้อมูลนิสิตเพื่อใช้เปรียบเทียบ
              </p>
            </div>
          </div>

          <!-- Privacy Protection Notice -->
          <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-900">
            <div class="font-bold flex items-center gap-1.5 text-emerald-800">
              <span class="w-4 h-4">${icons.shieldCheck}</span>
              หลักการคุ้มครองข้อมูลส่วนบุคคล (PDPA Protection):
            </div>
            <p class="mt-1 text-[11px] text-emerald-800/90 leading-relaxed">
              ระบบปฏิบัติตามนโยบายความมั่นคงปลอดภัยสารสนเทศ โดยระบบจะแปลงภาพใบหน้าเป็นตัวเลขทศนิยม 128 ตัวทันที และทำลาย Buffer ภาพถ่ายทิ้งทันที ไม่มีการบันทึกภาพถ่ายใบหน้าจริงลงในอุปกรณ์หรือเซิร์ฟเวอร์
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
