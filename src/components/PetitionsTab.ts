import { storageService } from '../services/storage';
import { Petition, PetitionCategory, PetitionStatus } from '../types/index';
import { icons } from '../utils/icons';

const CATEGORY_NAMES: Record<PetitionCategory, string> = {
  ACADEMIC: 'วิชาการและการเรียนการสอน',
  FACILITIES: 'อาคารสถานที่และสิ่งอำนวยความสะดวก',
  FINANCE: 'การเงินและค่าธรรมเนียมการศึกษา',
  IT_SYSTEM: 'ระบบเทคโนโลยีสารสนเทศ / สแกนใบหน้า',
  GENERAL: 'ข้อเสนอแนะทั่วไป',
};

export function renderPetitionsTab(): string {
  const petitions = storageService.getPetitions();
  const students = storageService.getStudents();

  const studentOptions = students.map(s => {
    return `<option value="${s.id}">${s.studentId} - ${s.fullName}</option>`;
  }).join('');

  const petitionCards = petitions.length === 0
    ? `
      <div class="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-stone-200 p-8">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
          ${icons.messageSquare}
        </div>
        <p class="font-semibold text-slate-700">ยังไม่มีรายการคำร้องเรียนในระบบ</p>
        <p class="text-[11px] text-slate-400 mt-0.5">สามารถยื่นเรื่องหรือข้อเสนอแนะได้ผ่านแบบฟอร์มด้านล่าง</p>
      </div>
    `
    : petitions.map((p: Petition) => {
        const catName = CATEGORY_NAMES[p.category] || p.category;

        const statusBadge = p.status === 'RESOLVED'
          ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ยุติเรื่อง / ดำเนินการแล้วเสร็จ
             </span>`
          : p.status === 'IN_PROGRESS'
          ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> กำลังพิจารณา / ประสานงาน
             </span>`
          : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> รอรับเรื่อง (Pending)
             </span>`;

        const submitterText = p.isAnonymous
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600 font-medium">
              🔒 ไม่เปิดเผยตัวตน (Anonymous)
             </span>`
          : `<div class="text-xs font-semibold text-slate-800">${p.studentName || 'นิสิต'}</div>
             <div class="text-[11px] text-slate-400">รหัส: ${p.studentId || '-'} ${p.contactEmail ? `| ${p.contactEmail}` : ''}</div>`;

        return `
          <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3 hover:border-amber-300 transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  ${p.ticketNumber}
                </span>
                <span class="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ${catName}
                </span>
                ${p.urgency === 'URGENT' ? '<span class="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">เร่งด่วน</span>' : ''}
              </div>

              ${statusBadge}
            </div>

            <div>
              <h4 class="text-sm font-bold text-slate-900">${p.title}</h4>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">${p.detail}</p>
            </div>

            ${p.adminNote ? `
              <div class="bg-amber-50/70 rounded-xl p-3 border border-amber-200 text-xs">
                <span class="font-bold text-amber-900 block mb-0.5">การตอบรับจากเจ้าหน้าที่ / ผู้บริหาร:</span>
                <span class="text-amber-950">${p.adminNote}</span>
              </div>
            ` : ''}

            <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-100 text-xs">
              <div>
                ${submitterText}
              </div>

              <div class="flex items-center gap-2">
                <select 
                  data-petition-status-id="${p.id}"
                  class="bg-slate-50 border border-stone-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="PENDING" ${p.status === 'PENDING' ? 'selected' : ''}>สถานะ: รอรับเรื่อง</option>
                  <option value="IN_PROGRESS" ${p.status === 'IN_PROGRESS' ? 'selected' : ''}>สถานะ: กำลังพิจารณา</option>
                  <option value="RESOLVED" ${p.status === 'RESOLVED' ? 'selected' : ''}>สถานะ: ดำเนินการเสร็จสิ้น</option>
                </select>

                <button 
                  type="button" 
                  data-delete-petition="${p.id}"
                  class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="ลบคำร้อง"
                >
                  <span class="w-3.5 h-3.5">${icons.trash2}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Student Grievances, Petitions & Feedback
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            ระบบรับเรื่องและติดตามคำร้องเรียนนิสิต
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-0.5">
            ช่องทางรับฟังความคิดเห็นและข้อเสนอแนะสำหรับนิสิตระดับปริญญาโทและเอก มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย
          </p>
        </div>

        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          มีเรื่องร้องเรียนทั้งหมด ${petitions.length} เรื่อง
        </span>
      </div>

      <!-- Submit Form & Petition List Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Submission Form (5 cols) -->
        <div class="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div class="pb-3 border-b border-stone-100">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="text-rose-600">${icons.messageSquare}</span>
              ยื่นคำร้องเรียน / ข้อเสนอแนะใหม่
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              กรอกข้อมูลคำร้องเพื่อส่งตรงถึงสำนักงานวิทยาลัยสงฆ์
            </p>
          </div>

          <form id="form-submit-petition" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่คำร้องเรียน <span class="text-rose-500">*</span>
              </label>
              <select id="pet-category" required class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                <option value="ACADEMIC">ด้านวิชาการและการเรียนการสอน</option>
                <option value="FACILITIES">ด้านอาคารสถานที่และสิ่งอำนวยความสะดวก</option>
                <option value="FINANCE">ด้านการเงิน ค่าธรรมเนียม และทุนการศึกษา</option>
                <option value="IT_SYSTEM">ด้านระบบเทคโนโลยีสารสนเทศ / สแกนใบหน้า</option>
                <option value="GENERAL">ข้อเสนอแนะทั่วไป</option>
              </select>
            </div>

            <!-- Anonymous Toggle -->
            <div class="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-950">
                <input type="checkbox" id="pet-is-anonymous" class="accent-rose-600 rounded cursor-pointer" />
                <span>ไม่เปิดเผยตัวตน (ส่งคำร้องแบบ Anonymous)</span>
              </label>
              <p class="text-[11px] text-amber-800/80 mt-1 pl-5 leading-relaxed">
                หากเลือกตัวเลือกนี้ ระบบจะไม่บันทึกชื่อหรือรหัสนิสิต เพื่อความสบายใจในการเสนอแนะ
              </p>
            </div>

            <!-- Submitter info fields (Hidden if anonymous) -->
            <div id="pet-submitter-box" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกนิสิตผู้ยื่นคำร้อง
                </label>
                <select id="pet-student-select" class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                  <option value="">-- กรุณาเลือกนิสิต --</option>
                  ${studentOptions}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  ช่องทางติดต่อกลับ (เบอร์โทร หรือ อีเมล)
                </label>
                <input 
                  type="text" 
                  id="pet-contact" 
                  placeholder="เช่น 081-234-5678 หรืออีเมล"
                  class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้อเรื่องร้องเรียน / ข้อเสนอแนะ <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                id="pet-title" 
                required 
                placeholder="สรุปประเด็นสั้นๆ เช่น ขอปรับเวลาสัมมนา"
                class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดคำร้อง <span class="text-rose-500">*</span>
              </label>
              <textarea 
                id="pet-detail" 
                required 
                rows="4" 
                placeholder="ระบุข้อเท็จจริง วันเวลา สถานที่ และสิ่งที่ต้องการให้วิทยาลัยดำเนินการ..."
                class="w-full bg-slate-50 border border-stone-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความเร่งด่วน
              </label>
              <select id="pet-urgency" class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                <option value="NORMAL">ปกติ (ตามลำดับคิว)</option>
                <option value="URGENT">เร่งด่วน (มีผลต่อการเรียน/สอบ)</option>
                <option value="HIGH_PRIORITY">เร่งด่วนที่สุด (ส่งถึงผู้บริหารโดยตรง)</option>
              </select>
            </div>

            <button 
              type="submit" 
              class="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span class="w-4 h-4">${icons.checkCircle}</span>
              <span>ส่งคำร้องเรียนเข้าสู่ระบบ</span>
            </button>
          </form>
        </div>

        <!-- Right: Grievance Tracking List (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="text-amber-600">${icons.clock}</span>
              รายการคำร้องเรียนในระบบ (Petitions Tracking)
            </h3>
            <span class="text-xs text-slate-500 font-mono">${petitions.length} รายการ</span>
          </div>

          <div class="space-y-3">
            ${petitionCards}
          </div>
        </div>
      </div>
    </div>
  `;
}
