import { storageService } from '../services/storage';
import { COHORTS, CohortId } from '../types/index';
import { icons } from '../utils/icons';

export function renderFaceScanTab(): string {
  const students = storageService.getStudents();
  const enrolledCount = students.filter(s => s.faceDescriptor && s.faceDescriptor.length > 0).length;

  // Student list options for manual checking
  const studentOptions = students.map(s => {
    const cohort = COHORTS[s.programCohort]?.shortTitle || s.programCohort;
    return `<option value="${s.id}">${s.studentId} - ${s.fullName} (${cohort})</option>`;
  }).join('');

  return `
    <div class="space-y-6 pb-12">
      <!-- Section Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Real-Time Facial Recognition & Manual Attendance
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            ระบบสแกนใบหน้าเข้าเรียนอัตโนมัติ
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-0.5">
            ตรวจจับและเปรียบเทียบค่าเวกเตอร์อัตลักษณ์ชีวมิติ 128 มิติ แบบ Real-time หรือเช็คชื่อด้วยมือ
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            ลงทะเบียนใบหน้าแล้ว ${enrolledCount} / ${students.length} รูป
          </span>
        </div>
      </div>

      <!-- Main Scanner Workspace -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Camera Viewfinder & HUD (8 cols) -->
        <div class="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <!-- Viewfinder Header & Controls -->
          <div class="p-3.5 bg-slate-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <span class="text-xs font-semibold text-slate-700">กล้องตรวจจับชีวมิติ (Camera Viewfinder)</span>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <label class="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs hover:border-rose-300 transition-colors">
                <input type="checkbox" id="chk-auto-scan" class="accent-rose-600 rounded cursor-pointer" checked />
                <span class="font-medium text-slate-700">ตรวจจับอัตโนมัติ (Auto-Detect)</span>
              </label>

              <button 
                type="button" 
                id="btn-toggle-camera"
                class="px-3 py-1 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span class="w-3.5 h-3.5">${icons.camera}</span>
                <span id="txt-camera-toggle">เริ่มเปิดกล้อง</span>
              </button>
            </div>
          </div>

          <!-- Video Camera Frame with Overlays -->
          <div class="relative bg-slate-950 aspect-4/3 sm:aspect-16/10 flex items-center justify-center overflow-hidden">
            <!-- Video element -->
            <video 
              id="scanner-video" 
              autoplay 
              playsinline 
              muted 
              class="w-full h-full object-cover transform -scale-x-100 hidden"
            ></video>

            <!-- Face Detection Canvas Overlay -->
            <canvas id="scanner-canvas" class="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"></canvas>

            <!-- Target Reticle Overlay -->
            <div id="scanner-reticle" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-48 h-60 sm:w-56 sm:h-72 rounded-3xl border-2 border-dashed border-amber-300/70 shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center relative">
                <div class="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold tracking-wider uppercase">
                  จัดใบหน้าให้อยู่ในกรอบ
                </div>
                <!-- Animated scanning laser bar -->
                <div id="scan-laser-line" class="absolute w-full h-0.5 bg-rose-500 shadow-[0_0_10px_#ec4899] top-0 animate-pulse"></div>
              </div>
            </div>

            <!-- Loading Spinner State -->
            <div id="scanner-loading" class="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white hidden">
              <div class="w-10 h-10 text-rose-500 animate-spin">
                ${icons.loader}
              </div>
              <p id="scanner-loading-text" class="text-xs font-medium text-slate-200">กำลังเชื่อมต่อกล้องและโหลดโมเดลชีวมิติ...</p>
            </div>

            <!-- Idle / Off State -->
            <div id="scanner-idle" class="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <span class="w-8 h-8">${icons.camera}</span>
              </div>
              <p class="text-sm font-semibold text-slate-300">กล้องยังไม่ได้เปิดใช้งาน</p>
              <p class="text-xs text-slate-500 mt-1 max-w-xs">
                กดปุ่ม "เริ่มเปิดกล้อง" ด้านบน หรือ "สแกนทันที" เพื่อเปิดระบบจับภาพใบหน้า
              </p>
              <button 
                type="button" 
                id="btn-start-camera-cta"
                class="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span class="w-4 h-4">${icons.play}</span>
                เปิดกล้องทันที
              </button>
            </div>
          </div>

          <!-- Bottom Action Buttons: Manual Trigger & Threshold Adjust -->
          <div class="p-3.5 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                id="btn-scan-now"
                class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                <span class="w-4 h-4">${icons.scanFace}</span>
                <span>สแกนและบันทึกทันที (Manual Trigger)</span>
              </button>

              <button 
                type="button" 
                id="btn-rescan"
                class="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                title="รองรับการสแกนซ้ำได้ไม่จำกัด"
              >
                <span class="w-3.5 h-3.5">${icons.refreshCw}</span>
                <span>สแกนซ้ำ (Unlimited Re-scan)</span>
              </button>
            </div>

            <!-- Match Threshold Setting -->
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="font-medium">เกณฑ์ตัดสิน (Threshold):</span>
              <select id="sel-threshold" class="bg-slate-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-mono">
                <option value="0.45">0.45 (เข้มงวดสูง)</option>
                <option value="0.50" selected>0.50 (มาตรฐาน)</option>
                <option value="0.55">0.55 (ยืดหยุ่น)</option>
                <option value="0.60">0.60 (ยืดหยุ่นสูง)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Right: Real-Time Results HUD & Manual Check-in (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          <!-- Real-Time Recognition Score HUD (Requirement: If fails, display difference score as a number on screen) -->
          <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-stone-100">
              <span class="text-rose-600">${icons.shieldCheck}</span>
              ผลการวิเคราะห์ชีวมิติ (Biometric HUD)
            </h3>

            <!-- Dynamic Result Card -->
            <div id="scan-hud-container" class="mt-3">
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center text-slate-400">
                <span class="w-8 h-8 mx-auto mb-1 block text-slate-400">${icons.scanFace}</span>
                <p class="text-xs font-medium text-slate-600">รอการสแกนใบหน้า</p>
                <p class="text-[11px] text-slate-400 mt-0.5">ผลการเปรียบเทียบและคะแนนความต่างจะแสดงที่นี่</p>
              </div>
            </div>
          </div>

          <!-- Manual Name-Checking Drawer (For professors without camera) -->
          <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-stone-100">
              <span class="text-amber-600">${icons.userCheck}</span>
              เช็คชื่อด้วยตนเอง (Manual Check-in)
            </h3>
            <p class="text-xs text-slate-500 mt-2">
              สำหรับอาจารย์ผู้สอนบันทึกเวลาเรียนให้นิสิตโดยไม่ต้องเปิดกล้อง
            </p>

            <form id="form-manual-checkin" class="mt-3 space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">เลือกนิสิต</label>
                <select id="sel-manual-student" class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                  <option value="">-- กรุณาเลือกนิสิต --</option>
                  ${studentOptions}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">สถานะ</label>
                  <select id="sel-manual-status" class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                    <option value="PRESENT">มาเรียน (ตรงเวลา)</option>
                    <option value="LATE">เข้าเรียนสาย</option>
                    <option value="EXCUSED">ลากิจ/ลาศาสนกิจ</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">หมายเหตุ</label>
                  <input type="text" id="ipt-manual-note" placeholder="เช่น ภารกิจวิทยาลัย" class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden" />
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span class="w-4 h-4">${icons.checkCircle}</span>
                บันทึกการเข้าเรียน
              </button>
            </form>
          </div>

          <!-- Quick Tip Card -->
          <div class="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/60 text-xs text-amber-900">
            <div class="font-semibold flex items-center gap-1 text-amber-800">
              <span class="w-4 h-4">${icons.sparkles}</span>
              ข้อแนะนำการตรวจจับใบหน้า:
            </div>
            <ul class="list-disc list-inside space-y-1 mt-1 text-[11px] text-amber-800/90 leading-relaxed">
              <li>ให้หันหน้าตรงเข้าหากล้องในระยะประมาณ ๕๐–๘๐ ซม.</li>
              <li>หลีกเลี่ยงแสงย้อนด้านหลัง และมีแสงสว่างสม่ำเสมอบนใบหน้า</li>
              <li>ระบบคำนวณเวกเตอร์ 128 มิติ แบบไม่จัดเก็บภาพถ่าย (PDPA)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}
