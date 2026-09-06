import { storageService } from '../services/storage';
import { COHORTS, AttendanceRecord } from '../types/index';
import { icons } from '../utils/icons';

export function renderDashboardTab(): string {
  const students = storageService.getStudents();
  const totalStudents = students.length;
  const enrolledFaces = students.filter(s => s.faceDescriptor && s.faceDescriptor.length > 0).length;

  const todayRecords = storageService.getTodayAttendanceRecords();
  const uniqueTodayAttendees = new Set(todayRecords.map(r => r.studentId)).size;
  const attendanceRate = totalStudents > 0 ? Math.round((uniqueTodayAttendees / totalStudents) * 100) : 0;

  const stats7Days = storageService.get7DayHistoricalStats();
  const maxCount = Math.max(1, ...stats7Days.map(s => s.count));

  const recentCheckins = storageService.getRecentAttendanceRecords(10);

  // Group students by degree/program for quick stats
  const phdCount = students.filter(s => s.programCohort.startsWith('PHD')).length;
  const maTipitakaCount = students.filter(s => s.programCohort.startsWith('MA_TIPITAKA')).length;
  const maAbhidhammaCount = students.filter(s => s.programCohort.startsWith('MA_ABHIDHAMMA')).length;

  // Render 7-day SVG/CSS Bar Chart
  const chartBars = stats7Days.map((stat, idx) => {
    const isToday = idx === stats7Days.length - 1;
    const heightPercent = Math.max(8, Math.round((stat.count / maxCount) * 100));
    const barBg = isToday ? 'bg-rose-500' : 'bg-amber-400 hover:bg-amber-500';

    return `
      <div class="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
        <div class="text-xs font-semibold text-slate-600 group-hover:text-rose-600 transition-colors">
          ${stat.count} <span class="text-[10px] text-slate-400 font-normal">รูป/คน</span>
        </div>
        <div class="w-full bg-slate-100 rounded-t-lg h-36 flex items-end p-1.5 border border-slate-200/60">
          <div 
            class="w-full ${barBg} rounded-md transition-all duration-500 shadow-xs relative" 
            style="height: ${heightPercent}%"
            title="${stat.date}: ${stat.count} นิสิต"
          >
            ${isToday ? '<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white"></div>' : ''}
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs font-medium text-slate-700">${stat.dayName}</div>
          <div class="text-[10px] text-slate-400">${stat.label}</div>
        </div>
      </div>
    `;
  }).join('');

  // Render recent check-ins rows
  const checkinRows = recentCheckins.length === 0
    ? `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-500">
          <div class="flex flex-col items-center justify-center gap-3">
            <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              ${icons.clock}
            </div>
            <div>
              <p class="font-medium text-slate-700">ยังไม่มีรายการเช็คชื่อในระบบ</p>
              <p class="text-xs text-slate-400 mt-0.5">เริ่มบันทึกการเข้าเรียนด้วยการสแกนใบหน้า หรือโหลดข้อมูลทดสอบ</p>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <button type="button" data-nav-tab="scan" class="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors flex items-center gap-1.5">
                <span class="w-3.5 h-3.5">${icons.scanFace}</span>
                ไปที่หน้าสแกนใบหน้า
              </button>
              <button type="button" id="btn-quick-seed-dash" class="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium hover:bg-amber-200 transition-colors flex items-center gap-1.5">
                <span class="w-3.5 h-3.5">${icons.sparkles}</span>
                โหลดข้อมูลตัวอย่าง ๑๐ นิสิต
              </button>
            </div>
          </div>
        </td>
      </tr>
    `
    : recentCheckins.map((rec: AttendanceRecord) => {
        const cohortInfo = COHORTS[rec.programCohort] || { shortTitle: rec.programCohort, badgeColor: 'bg-slate-100 text-slate-700' };
        const isFaceScan = rec.method === 'FACE_SCAN';
        const methodBadge = isFaceScan
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <span class="w-3 h-3">${icons.scanFace}</span> สแกนใบหน้า
             </span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span class="w-3 h-3">${icons.userCheck}</span> แมนนวล
             </span>`;

        const scoreInfo = isFaceScan && rec.distanceScore !== null
          ? `<div class="text-xs font-mono text-slate-700">
              <span class="font-semibold text-emerald-600">${rec.confidence ?? 95}%</span>
              <span class="text-[10px] text-slate-400">(Dist: ${rec.distanceScore})</span>
             </div>`
          : `<span class="text-xs text-slate-400">-</span>`;

        const statusBadge = rec.status === 'PRESENT'
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">ตรงเวลา</span>`
          : rec.status === 'LATE'
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">เข้าสาย</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">${rec.status}</span>`;

        return `
          <tr class="border-b border-stone-100 hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
              <div class="font-medium text-slate-800">${rec.time}</div>
              <div class="text-[11px] text-slate-400">${rec.date}</div>
            </td>
            <td class="py-3 px-3 text-xs font-mono font-semibold text-slate-700">
              ${rec.studentId}
            </td>
            <td class="py-3 px-3 text-xs font-medium text-slate-900">
              ${rec.studentName}
            </td>
            <td class="py-3 px-3 text-xs">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${cohortInfo.badgeColor}">
                ${cohortInfo.shortTitle}
              </span>
            </td>
            <td class="py-3 px-3 text-xs">
              ${methodBadge}
            </td>
            <td class="py-3 px-3 text-xs">
              ${scoreInfo}
            </td>
            <td class="py-3 px-3 text-xs text-right">
              ${statusBadge}
            </td>
          </tr>
        `;
      }).join('');

  return `
    <div class="space-y-6 pb-12">
      <!-- Welcome & Cohort Filter Banner -->
      <div class="bg-gradient-to-r from-amber-50 via-warm to-rose-50 rounded-2xl p-5 border border-amber-200/70 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-rose-700 font-medium text-xs tracking-wider uppercase">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              ระบบสารสนเทศบัณฑิตศึกษา (Graduate Academic Information)
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
              สรุปภาพรวมการเข้าชั้นเรียนและตรวจจับชีวมิติ
            </h2>
            <p class="text-xs md:text-sm text-slate-600 mt-0.5">
              พุทธศาสตรดุษฎีบัณฑิต และ พุทธศาสตรมหาบัณฑิต (พระไตรปิฎกศึกษา / พระอภิธรรมปิฎก รุ่นที่ ๑ และ ๒)
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              data-nav-tab="scan"
              class="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200 flex items-center gap-2"
            >
              <span class="w-4 h-4">${icons.scanFace}</span>
              เปิดกล้องสแกนเข้าเรียน
            </button>
          </div>
        </div>

        <!-- Cohort quick breakdown chips -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-amber-200/50">
          <div class="bg-white/80 backdrop-blur-xs rounded-xl p-2.5 border border-amber-200/60 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-medium text-amber-900">พธ.ด. พระไตรปิฎกศึกษา (รุ่น 1-2)</div>
              <div class="text-xs text-slate-500">ระดับปริญญาเอก</div>
            </div>
            <div class="text-base font-bold text-amber-700">${phdCount} รูป/คน</div>
          </div>
          <div class="bg-white/80 backdrop-blur-xs rounded-xl p-2.5 border border-rose-200/60 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-medium text-rose-900">พธ.ม. พระไตรปิฎกศึกษา (รุ่น 1-2)</div>
              <div class="text-xs text-slate-500">ระดับปริญญาโท</div>
            </div>
            <div class="text-base font-bold text-rose-700">${maTipitakaCount} รูป/คน</div>
          </div>
          <div class="bg-white/80 backdrop-blur-xs rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-medium text-slate-800">พธ.ม. พระอภิธรรมปิฎก (รุ่น 1-2)</div>
              <div class="text-xs text-slate-500">ระดับปริญญาโท</div>
            </div>
            <div class="text-base font-bold text-slate-700">${maAbhidhammaCount} รูป/คน</div>
          </div>
        </div>
      </div>

      <!-- Metric KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Metric 1: Total Students -->
        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:border-amber-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">นิสิตทั้งหมดในระบบ</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              ${icons.users}
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-bold text-slate-900">${totalStudents}</span>
            <span class="text-xs text-slate-400">รูป/คน</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            ครอบคลุม ๓ สาขาวิชา ๖ รุ่นการศึกษา
          </div>
        </div>

        <!-- Metric 2: Today's Attendees -->
        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:border-rose-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">เข้าเรียนวันนี้</span>
            <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              ${icons.userCheck}
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-bold text-rose-600">${uniqueTodayAttendees}</span>
            <span class="text-xs text-slate-400">รูป/คน (${attendanceRate}%)</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            บันทึกแล้ว ${todayRecords.length} ครั้งในรอบวัน
          </div>
        </div>

        <!-- Metric 3: Face Enrolled -->
        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">ลงทะเบียนใบหน้าแล้ว</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              ${icons.scanFace}
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-bold text-emerald-700">${enrolledFaces}</span>
            <span class="text-xs text-slate-400">/ ${totalStudents} รูป</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            สกัด 128-d Vector ปลอดภาพถ่าย (PDPA)
          </div>
        </div>

        <!-- Metric 4: System Readiness -->
        <div class="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:border-amber-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">สถานะระบบตรวจจับ</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              ${icons.shieldCheck}
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-xl font-bold text-slate-800">พร้อมใช้งาน</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>เกณฑ์ตัดสิน: Dist &le; 0.50</span>
          </div>
        </div>
      </div>

      <!-- 7-Day Historical Attendance Chart -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
          <div>
            <h3 class="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="text-amber-600">${icons.layoutDashboard}</span>
              สถิติการเข้าเรียนย้อนหลัง ๗ วัน (7-Day Historical Attendance)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              แสดงจำนวนนิสิตบัณฑิตศึกษาที่เข้าชั้นเรียนในแต่ละวัน (High Contrast Projector Display)
            </p>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-2.5 h-2.5 rounded-xs bg-amber-400"></span> ย้อนหลัง
            </span>
            <span class="flex items-center gap-1.5 text-slate-900 font-semibold">
              <span class="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> วันนี้
            </span>
          </div>
        </div>

        <div class="flex items-end gap-3 sm:gap-6 pt-6 px-2">
          ${chartBars}
        </div>
      </div>

      <!-- 10 Most Recent Check-ins Table -->
      <div class="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="text-rose-600">${icons.clock}</span>
              รายการบันทึกเวลาเข้าเรียน ๑๐ รายการล่าสุด (Recent 10 Check-ins)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              แสดงข้อมูลการยืนยันตัวตนด้วยใบหน้าและการเช็คชื่อโดยคณาจารย์
            </p>
          </div>
          <button 
            type="button" 
            data-nav-tab="scan"
            class="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
          >
            บันทึกการเข้าเรียนเพิ่ม &rarr;
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-stone-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th class="py-2.5 px-3">เวลา / วันที่</th>
                <th class="py-2.5 px-3">รหัสนิสิต</th>
                <th class="py-2.5 px-3">ชื่อ-นามสกุล / สมณศักดิ์</th>
                <th class="py-2.5 px-3">สาขาวิชา / รุ่น</th>
                <th class="py-2.5 px-3">วิธีการตรวจ</th>
                <th class="py-2.5 px-3">คะแนนความคล้าย (Score)</th>
                <th class="py-2.5 px-3 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${checkinRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
