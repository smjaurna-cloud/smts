import { storageService } from '../services/storage';
import { ZoomRoom } from '../types/index';
import { icons } from '../utils/icons';

export function renderClassroomsTab(): string {
  const rooms = storageService.getZoomRooms();

  const roomCards = rooms.map((room: ZoomRoom) => {
    const isLive = room.isLive;
    const statusBadge = isLive
      ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> กำลังถ่ายทอดสด Hybrid
         </span>`
      : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span> ห้องเรียนว่าง (Standby)
         </span>`;

    return `
      <div class="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all p-5 flex flex-col justify-between space-y-4">
        <div>
          <!-- Header: Room title & Live status -->
          <div class="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  ${room.roomNumber}
                </span>
                <h3 class="text-base font-bold text-slate-900">${room.name}</h3>
              </div>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span class="w-3.5 h-3.5 text-amber-600">${icons.mapPin}</span>
                <span>${room.onSiteLocation}</span>
              </p>
            </div>
            ${statusBadge}
          </div>

          <!-- Target Program & Topic -->
          <div class="mt-3 space-y-2">
            <div>
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">หลักสูตรเป้าหมาย:</div>
              <div class="text-xs font-medium text-amber-900 mt-0.5">${room.targetProgram}</div>
            </div>

            <div class="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 text-xs">
              <span class="font-semibold text-amber-950 block mb-0.5">หัวข้อบรรยายปัจจุบัน / ตารางสอน:</span>
              <span class="text-amber-900">${room.activeTopic || 'ยังไม่มีหัวข้อบรรยายที่กำหนด'}</span>
            </div>
          </div>

          <!-- Credentials Box (Specified in prompt) -->
          <div class="mt-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-700 flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 text-slate-500">${icons.mail}</span>
                Zoom Account:
              </span>
              <div class="flex items-center gap-1.5">
                <code class="font-mono text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 select-all">
                  ${room.zoomAccount}
                </code>
                <button 
                  type="button" 
                  data-copy-text="${room.zoomAccount}"
                  class="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                  title="คัดลอกอีเมลบัญชี"
                >
                  <span class="w-3.5 h-3.5">${icons.copy}</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-700 flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 text-slate-500">${icons.key}</span>
                Password:
              </span>
              <div class="flex items-center gap-1.5">
                <code class="font-mono text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 select-all">
                  ${room.zoomPassword}
                </code>
                <button 
                  type="button" 
                  data-copy-text="${room.zoomPassword}"
                  class="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                  title="คัดลอกรหัสผ่าน"
                >
                  <span class="w-3.5 h-3.5">${icons.copy}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Official Course Timetable & Faculty Section -->
          <div class="mt-4 pt-3.5 border-t border-stone-200/80">
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span class="w-4 h-4 text-amber-600">${icons.calendar}</span>
                <span>ตารางเรียนและคณาจารย์ (ภาคเรียนที่ ๑/๒๕๖๙)</span>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                ${room.schedules ? room.schedules.length : 0} รายวิชา
              </span>
            </div>

            <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
              ${(room.schedules && room.schedules.length > 0) ? room.schedules.map(sch => `
                <div class="p-3 rounded-xl bg-stone-50 border border-stone-200/90 hover:border-amber-300 hover:bg-amber-50/40 transition-all text-xs space-y-1.5">
                  <div class="flex items-center justify-between gap-1 flex-wrap">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 rounded-md font-bold text-[10px] ${sch.day === 'วันพฤหัสบดี' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}">
                        ${sch.day}
                      </span>
                      <span class="text-slate-700 text-[11px] font-semibold">${sch.timeRange}</span>
                      <span class="text-slate-400 text-[10px]">(${sch.period})</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sch.courseType === 'วิชาเอก' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      sch.courseType === 'วิชาบังคับ' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      sch.courseType === 'วิชาเลือก' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      sch.courseType === 'วิทยานิพนธ์/ดุษฎีนิพนธ์' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-slate-200 text-slate-700 border border-slate-300'
                    }">
                      ${sch.courseType} • ${sch.credits}
                    </span>
                  </div>

                  <div>
                    <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                      <span class="font-mono text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded font-bold text-[11px] border border-amber-200/80">${sch.courseCode}</span>
                      <span>${sch.courseNameTh}</span>
                    </div>
                    ${sch.courseNameEn ? `<div class="text-[10px] text-slate-500 italic mt-0.5">${sch.courseNameEn}</div>` : ''}
                    ${sch.cohortPlan ? `<div class="text-[10px] text-rose-700 font-medium mt-1">🎯 ${sch.cohortPlan}</div>` : ''}
                  </div>

                  <div class="pt-1.5 border-t border-stone-200/70 flex flex-col gap-0.5">
                    <div class="flex items-start gap-1 text-[11px]">
                      <span class="font-semibold text-slate-700 shrink-0">อาจารย์ผู้สอน:</span>
                      <span class="font-bold text-amber-950">${sch.instructor}</span>
                    </div>
                    ${sch.teachingTeam && sch.teachingTeam.length > 0 ? `
                      <div class="flex items-start gap-1 text-[10px] text-slate-500 pl-1">
                        <span class="shrink-0">• คณะผู้สอน:</span>
                        <span>${sch.teachingTeam.join(', ')}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('') : `
                <div class="text-center py-4 text-xs text-slate-400">ไม่มีข้อมูลตารางเรียนในระบบ</div>
              `}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex items-center gap-2 border-t border-stone-100">
          <a 
            href="${room.zoomUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span class="w-4 h-4">${icons.video}</span>
            <span>เปิดห้องเรียน Zoom</span>
          </a>

          <button 
            type="button" 
            data-toggle-room="${room.roomNumber}"
            class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            title="สลับสถานะการสตรีมมิ่ง"
          >
            ${isLive ? 'สลับเป็น Standby' : 'เปิดสตรีมมิ่ง'}
          </button>
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
            Hybrid Classroom & Video Conference Integration
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            จัดการห้องเรียนออนไซต์และออนไลน์ (ซูมห้องที่ ๑ - ๔)
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-0.5">
            บูรณาการการเรียนการสอน On-site ณ อาคารพระไตรปิฎกศึกษา ควบคู่กับ Zoom Meeting ๔ บัญชีหลักวิทยาลัย
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a 
            href="https://zoom.us/signin" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span class="w-4 h-4">${icons.externalLink}</span>
            เข้าสู่ระบบ Zoom Web Portal
          </a>
        </div>
      </div>

      <!-- Grid of 4 Zoom Classrooms -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${roomCards}
      </div>

      <!-- Monastic Classroom Etiquette & Quick Instructions -->
      <div class="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/80 space-y-3">
        <h4 class="text-sm font-bold text-amber-950 flex items-center gap-2">
          <span class="text-amber-700">${icons.shieldCheck}</span>
          แนวปฏิบัติการใช้ห้องเรียนออนไลน์และออนไซต์ มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900">
          <div class="bg-white/80 rounded-xl p-3 border border-amber-200/60">
            <div class="font-semibold text-amber-950 mb-1">๑. การเปิดกล้องและเช็คชื่อ</div>
            <p class="text-[11px] leading-relaxed">
              ขอความเมตตานิสิตบรรพชิตและคฤหัสถ์เปิดกล้องหันหน้าตรง เพื่อให้ระบบสแกนใบหน้าจับเวลาเรียนได้อัตโนมัติ
            </p>
          </div>
          <div class="bg-white/80 rounded-xl p-3 border border-amber-200/60">
            <div class="font-semibold text-amber-950 mb-1">๒. การบันทึกภาพและเสียง</div>
            <p class="text-[11px] leading-relaxed">
              ระบบ Zoom Cloud Recording จะบันทึกการสอนอัตโนมัติเพื่อจัดเก็บในคลังสารสนเทศพระไตรปิฎก
            </p>
          </div>
          <div class="bg-white/80 rounded-xl p-3 border border-amber-200/60">
            <div class="font-semibold text-amber-950 mb-1">๓. การสนับสนุนทางเทคนิค</div>
            <p class="text-[11px] leading-relaxed">
              หากสัญญาณขัดข้อง ติดต่อเจ้าหน้าที่ไอทีห้องควบคุม โทร. 034-352-253 หรือส่งข้อความผ่านแท็บคำร้องเรียน
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
