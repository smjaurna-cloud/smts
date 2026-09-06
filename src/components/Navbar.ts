import { icons } from '../utils/icons';

export type TabId =
  | 'dashboard'
  | 'scan'
  | 'classrooms'
  | 'finance'
  | 'petitions'
  | 'register'
  | 'students'
  | 'data';

export interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  totalStudents: number;
}

export function renderNavbar(props: NavbarProps): string {
  const { activeTab } = props;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'แดชบอร์ดสรุป', icon: icons.layoutDashboard },
    { id: 'scan', label: 'สแกนใบหน้าเข้าเรียน', icon: icons.scanFace },
    { id: 'classrooms', label: 'ห้องเรียน Hybrid & Zoom', icon: icons.video },
    { id: 'finance', label: 'ค่าเทอม & การเงิน', icon: icons.creditCard },
    { id: 'petitions', label: 'ยื่นคำร้องเรียน', icon: icons.messageSquare },
    { id: 'register', label: 'ลงทะเบียนใบหน้า', icon: icons.userPlus },
    { id: 'students', label: 'จัดการข้อมูลนิสิต', icon: icons.users },
    { id: 'data', label: 'ศูนย์ดาวน์โหลด & ข้อมูล', icon: icons.download },
  ];

  const tabButtons = tabs.map(t => {
    const isActive = activeTab === t.id;
    const baseClass = "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer select-none whitespace-nowrap";
    const activeClass = isActive
      ? "bg-rose-600 text-white shadow-sm shadow-rose-200"
      : "text-slate-600 hover:text-slate-900 hover:bg-amber-100/50";

    return `
      <button 
        type="button" 
        data-nav-tab="${t.id}"
        class="${baseClass} ${activeClass}"
      >
        <span class="w-4 h-4">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `;
  }).join('');

  return `
    <header class="bg-[#ffffff]/90 backdrop-blur-md border-b border-amber-200/60 sticky top-0 z-30 shadow-xs">
      <div class="max-w-5xl mx-auto px-4 py-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <!-- Logo & System Brand -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-rose-600 text-white flex items-center justify-center shadow-sm">
              <span class="w-6 h-6">${icons.shieldCheck}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  Attendance Tracking System
                </h1>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  บัณฑิตศึกษา วส.มจร
                </span>
              </div>
              <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>ระบบติดตามการเข้าเรียนนิสิตระดับปริญญาโท - ปริญญาเอก (๖ รุ่น)</span>
              </p>
            </div>
          </div>

          <!-- Quick Status & Admin Profile -->
          <div class="flex items-center gap-2.5">
            <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Face BioNet พร้อมใช้งาน
            </span>

            <div class="flex items-center gap-2 pl-2.5 border-l border-amber-200">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-amber-300/50">
                SB
              </div>
              <div class="text-left text-xs">
                <div class="flex items-center gap-1">
                  <span class="font-bold text-slate-900">Somboon</span>
                  <span class="px-1.5 py-0.2 bg-purple-100 text-purple-900 text-[9px] font-bold rounded">
                    Admin
                  </span>
                </div>
                <span class="text-[10px] text-slate-500">Super Administrator</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 border-t border-amber-100/70 mt-3 no-scrollbar">
          ${tabButtons}
        </nav>
      </div>
    </header>
  `;
}
