import { storageService } from './services/storage';
import { faceEngine, DEFAULT_THRESHOLD } from './services/faceEngine';
import { soundService } from './services/audio';
import { Student, AttendanceRecord, CohortId } from './types/index';
import { renderNavbar, TabId } from './components/Navbar';
import { renderDashboardTab } from './components/DashboardTab';
import { renderFaceScanTab } from './components/FaceScanTab';
import { renderClassroomsTab } from './components/ClassroomsTab';
import { renderFinanceTab } from './components/FinanceTab';
import { renderPetitionsTab } from './components/PetitionsTab';
import { renderRegisterTab } from './components/RegisterTab';
import { renderStudentsTab, StudentsTabState } from './components/StudentsTab';
import { renderDataTab } from './components/DataTab';
import {
  renderEditStudentModal,
  renderDeleteConfirmModal,
  renderResetConfirmModal,
} from './components/Modals';
import { renderReceiptModal } from './components/ReceiptModal';
import { Petition, TuitionReceipt, PetitionCategory, UrgencyLevel, PetitionStatus } from './types/index';

class AppController {
  private activeTab: TabId = 'dashboard';
  private viewingReceiptId: string | null = null;
  private studentsState: StudentsTabState = {
    searchTerm: '',
    selectedCohort: 'ALL',
    editingStudentId: null,
    deletingStudentId: null,
  };

  // Camera & Scan State
  private scannerStream: MediaStream | null = null;
  private regStream: MediaStream | null = null;
  private isScanning = false;
  private scanIntervalTimer: number | null = null;
  private lastCheckinStudentId: string | null = null;
  private lastCheckinTime: number = 0;
  private currentThreshold: number = DEFAULT_THRESHOLD;

  // Temp descriptor for registration
  private tempRegDescriptor: number[] | null = null;

  async init(): Promise<void> {
    console.log('Initializing Attendance Tracking System...');

    // Auto seed demo data if system is completely fresh
    const existingStudents = storageService.getStudents();
    if (existingStudents.length === 0) {
      console.log('First-time launch: Seeding initial demo cohort data...');
      storageService.seedDemoData();
    }

    this.render();
    this.bindGlobalEvents();

    // Pre-load face recognition neural network models in background
    faceEngine.loadModels().then((loaded) => {
      console.log('Face engine background load status:', loaded);
      this.updateBioNetStatusBadge(loaded);
    });
  }

  private updateBioNetStatusBadge(ready: boolean): void {
    const badge = document.querySelector('.face-bionet-status');
    if (badge) {
      if (ready) {
        badge.className = 'face-bionet-status inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200';
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Face BioNet AI พร้อมใช้งาน';
      }
    }
  }

  render(): void {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const students = storageService.getStudents();
    const navbarHtml = renderNavbar({
      activeTab: this.activeTab,
      onSelectTab: (tab) => this.switchTab(tab),
      totalStudents: students.length,
    });

    let contentHtml = '';
    switch (this.activeTab) {
      case 'dashboard':
        contentHtml = renderDashboardTab();
        break;
      case 'scan':
        contentHtml = renderFaceScanTab();
        break;
      case 'classrooms':
        contentHtml = renderClassroomsTab();
        break;
      case 'finance':
        contentHtml = renderFinanceTab();
        break;
      case 'petitions':
        contentHtml = renderPetitionsTab();
        break;
      case 'register':
        contentHtml = renderRegisterTab();
        break;
      case 'students':
        contentHtml = renderStudentsTab(this.studentsState);
        break;
      case 'data':
        contentHtml = renderDataTab();
        break;
    }

    // Check if modal should render
    let modalHtml = '';
    if (this.studentsState.editingStudentId) {
      const student = storageService.getStudentById(this.studentsState.editingStudentId) || null;
      modalHtml += renderEditStudentModal(student);
    }
    if (this.studentsState.deletingStudentId) {
      const student = storageService.getStudentById(this.studentsState.deletingStudentId) || null;
      const records = storageService.getAttendanceRecords();
      const count = records.filter(
        r => r.studentInternalId === student?.id || r.studentId === student?.studentId
      ).length;
      modalHtml += renderDeleteConfirmModal(student, count);
    }
    if (this.viewingReceiptId) {
      const receipt = storageService.getTuitionReceipts().find(r => r.id === this.viewingReceiptId) || null;
      modalHtml += renderReceiptModal(receipt);
    }

    appEl.innerHTML = `
      ${navbarHtml}
      <main class="max-w-5xl mx-auto px-4 py-6">
        ${contentHtml}
      </main>
      <div id="modal-container">${modalHtml}</div>
      <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>
    `;

    this.bindTabEvents();
  }

  private switchTab(newTab: TabId): void {
    // Stop scanner camera if leaving scan tab
    if (this.activeTab === 'scan' && newTab !== 'scan') {
      this.stopScannerCamera();
    }
    // Stop registration camera if leaving register tab
    if (this.activeTab === 'register' && newTab !== 'register') {
      this.stopRegisterCamera();
    }

    this.activeTab = newTab;
    this.render();
  }

  // --- GLOBAL NAVIGATION & EVENT DELEGATION ---
  private bindGlobalEvents(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Tab switching via data-nav-tab
      const navBtn = target.closest('[data-nav-tab]') as HTMLElement;
      if (navBtn) {
        const tab = navBtn.getAttribute('data-nav-tab') as TabId;
        if (tab) {
          this.switchTab(tab);
          return;
        }
      }

      // Quick seed on empty dashboard
      if (target.closest('#btn-quick-seed-dash')) {
        storageService.seedDemoData();
        this.showToast('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว', 'success');
        this.render();
        return;
      }

      // Close edit modal
      if (target.closest('#btn-close-edit-modal') || target.closest('#btn-cancel-edit')) {
        this.studentsState.editingStudentId = null;
        this.render();
        return;
      }

      // Close delete modal
      if (target.closest('#btn-cancel-delete')) {
        this.studentsState.deletingStudentId = null;
        this.render();
        return;
      }

      // Confirm Cascade Delete student
      const confirmDelBtn = target.closest('#btn-confirm-delete') as HTMLElement;
      if (confirmDelBtn) {
        const id = confirmDelBtn.getAttribute('data-delete-id');
        if (id) {
          const success = storageService.deleteStudent(id);
          this.studentsState.deletingStudentId = null;
          if (success) {
            this.showToast('ลบนิสิตและประวัติการเข้าเรียนทั้งหมดเรียบร้อย (Cascade Deleted)', 'success');
          } else {
            this.showToast('ไม่พบนิสิตที่ต้องการลบ', 'alert');
          }
          this.render();
        }
        return;
      }

      // Copy text to clipboard (e.g. Zoom passwords & accounts)
      const copyBtn = target.closest('[data-copy-text]') as HTMLElement;
      if (copyBtn) {
        const text = copyBtn.getAttribute('data-copy-text');
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            this.showToast(`คัดลอก "${text}" เรียบร้อยแล้ว`, 'info');
          }).catch(() => {
            this.showToast(`คัดลอก "${text}" เรียบร้อยแล้ว`, 'info');
          });
        }
        return;
      }

      // Toggle Zoom Room live status
      const toggleRoomBtn = target.closest('[data-toggle-room]') as HTMLElement;
      if (toggleRoomBtn) {
        const roomNum = parseInt(toggleRoomBtn.getAttribute('data-toggle-room') || '0', 10);
        if (roomNum) {
          storageService.toggleZoomRoomStatus(roomNum);
          this.render();
        }
        return;
      }

      // View Receipt Modal
      const viewReceiptBtn = target.closest('[data-view-receipt]') as HTMLElement;
      if (viewReceiptBtn) {
        const recId = viewReceiptBtn.getAttribute('data-view-receipt');
        if (recId) {
          this.viewingReceiptId = recId;
          this.render();
        }
        return;
      }

      // Close Receipt Modal
      if (target.closest('#btn-close-receipt-modal')) {
        this.viewingReceiptId = null;
        this.render();
        return;
      }

      // Print Receipt
      if (target.closest('#btn-print-receipt')) {
        window.print();
        return;
      }

      // Delete Petition
      const delPetBtn = target.closest('[data-delete-petition]') as HTMLElement;
      if (delPetBtn) {
        const petId = delPetBtn.getAttribute('data-delete-petition');
        if (petId) {
          storageService.deletePetition(petId);
          this.showToast('ลบรายการคำร้องเรียบร้อยแล้ว', 'success');
          this.render();
        }
        return;
      }

      // Close system reset modal
      if (target.closest('#btn-cancel-reset')) {
        const modal = document.getElementById('modal-reset-backdrop');
        if (modal) modal.remove();
        return;
      }

      // Confirm system reset
      if (target.closest('#btn-confirm-reset')) {
        storageService.resetAllData();
        const modal = document.getElementById('modal-reset-backdrop');
        if (modal) modal.remove();
        this.showToast('ล้างข้อมูลระบบทั้งหมดเรียบร้อยแล้ว', 'success');
        this.render();
        return;
      }
    });

    // Listen to petition status dropdown change
    document.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      const statusSelect = target.closest('[data-petition-status-id]') as HTMLSelectElement;
      if (statusSelect) {
        const id = statusSelect.getAttribute('data-petition-status-id');
        const newStatus = statusSelect.value as PetitionStatus;
        if (id && newStatus) {
          storageService.updatePetitionStatus(id, newStatus);
          this.showToast(`ปรับสถานะคำร้องเป็น "${newStatus}" เรียบร้อย`, 'success');
        }
      }
    });
  }

  // --- TAB-SPECIFIC EVENTS ---
  private bindTabEvents(): void {
    if (this.activeTab === 'scan') {
      this.bindScanTabEvents();
    } else if (this.activeTab === 'finance') {
      this.bindFinanceTabEvents();
    } else if (this.activeTab === 'petitions') {
      this.bindPetitionsTabEvents();
    } else if (this.activeTab === 'register') {
      this.bindRegisterTabEvents();
    } else if (this.activeTab === 'students') {
      this.bindStudentsTabEvents();
    } else if (this.activeTab === 'data') {
      this.bindDataTabEvents();
    }
  }

  // ==========================================
  // FACE-SCAN ATTENDANCE TAB
  // ==========================================
  private bindScanTabEvents(): void {
    const toggleCamBtn = document.getElementById('btn-toggle-camera');
    const startCamCta = document.getElementById('btn-start-camera-cta');
    const scanNowBtn = document.getElementById('btn-scan-now');
    const rescanBtn = document.getElementById('btn-rescan');
    const thresholdSel = document.getElementById('sel-threshold') as HTMLSelectElement;
    const manualForm = document.getElementById('form-manual-checkin') as HTMLFormElement;

    if (toggleCamBtn) {
      toggleCamBtn.onclick = () => this.toggleScannerCamera();
    }
    if (startCamCta) {
      startCamCta.onclick = () => this.startScannerCamera();
    }
    if (scanNowBtn) {
      scanNowBtn.onclick = () => this.executeFaceScan(true);
    }
    if (rescanBtn) {
      rescanBtn.onclick = () => {
        // Unlimited re-scanning: reset HUD & trigger scan
        this.resetScanHud();
        this.executeFaceScan(true);
      };
    }

    if (thresholdSel) {
      thresholdSel.value = String(this.currentThreshold);
      thresholdSel.onchange = () => {
        this.currentThreshold = parseFloat(thresholdSel.value) || DEFAULT_THRESHOLD;
        this.showToast(`ปรับค่าเกณฑ์ตัดสิน (Threshold) เป็น ${this.currentThreshold}`, 'info');
      };
    }

    if (manualForm) {
      manualForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleManualCheckin();
      };
    }
  }

  private async toggleScannerCamera(): Promise<void> {
    if (this.scannerStream) {
      this.stopScannerCamera();
    } else {
      await this.startScannerCamera();
    }
  }

  private async startScannerCamera(): Promise<void> {
    const video = document.getElementById('scanner-video') as HTMLVideoElement;
    const idleEl = document.getElementById('scanner-idle');
    const loadingEl = document.getElementById('scanner-loading');
    const toggleText = document.getElementById('txt-camera-toggle');
    const scanNowBtn = document.getElementById('btn-scan-now') as HTMLButtonElement;

    if (!video) return;

    try {
      if (loadingEl) loadingEl.classList.remove('hidden');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      this.scannerStream = stream;
      video.srcObject = stream;
      await video.play();

      if (loadingEl) loadingEl.classList.add('hidden');
      if (idleEl) idleEl.classList.add('hidden');
      video.classList.remove('hidden');

      if (toggleText) toggleText.textContent = 'ปิดกล้อง';
      if (scanNowBtn) scanNowBtn.disabled = false;

      this.startContinuousScanLoop();
      this.showToast('เปิดกล้องตรวจจับชีวมิติเรียบร้อย', 'success');
    } catch (err: unknown) {
      if (loadingEl) loadingEl.classList.add('hidden');
      const e = err as Error;
      console.error('Camera access error:', e);
      this.showToast(`ไม่สามารถเข้าถึงกล้องได้: ${e.message || 'โปรดอนุญาตสิทธิ์กล้อง'}`, 'alert');
    }
  }

  private stopScannerCamera(): void {
    if (this.scanIntervalTimer) {
      window.clearInterval(this.scanIntervalTimer);
      this.scanIntervalTimer = null;
    }

    if (this.scannerStream) {
      this.scannerStream.getTracks().forEach(t => t.stop());
      this.scannerStream = null;
    }

    const video = document.getElementById('scanner-video') as HTMLVideoElement;
    const idleEl = document.getElementById('scanner-idle');
    const toggleText = document.getElementById('txt-camera-toggle');
    const scanNowBtn = document.getElementById('btn-scan-now') as HTMLButtonElement;

    if (video) {
      video.classList.add('hidden');
      video.srcObject = null;
    }
    if (idleEl) idleEl.classList.remove('hidden');
    if (toggleText) toggleText.textContent = 'เริ่มเปิดกล้อง';
    if (scanNowBtn) scanNowBtn.disabled = true;
  }

  private startContinuousScanLoop(): void {
    if (this.scanIntervalTimer) {
      window.clearInterval(this.scanIntervalTimer);
    }

    // Scan every 1.5 seconds if auto-scan is checked
    this.scanIntervalTimer = window.setInterval(() => {
      const autoChk = document.getElementById('chk-auto-scan') as HTMLInputElement;
      if (autoChk && autoChk.checked && this.scannerStream) {
        this.executeFaceScan(false);
      }
    }, 1500);
  }

  private async executeFaceScan(isManualTrigger = false): Promise<void> {
    if (!this.scannerStream || this.isScanning) return;
    const video = document.getElementById('scanner-video') as HTMLVideoElement;
    if (!video || video.readyState < 2) return;

    this.isScanning = true;
    const students = storageService.getStudents();

    try {
      // Extract 128-d descriptor from video element (STRICTLY NO IMAGE STORED)
      const extraction = await faceEngine.extractDescriptor(video);

      if (!extraction.descriptor) {
          this.renderScanResultFailure({
            distance: 1.0,
            threshold: this.currentThreshold,
            differenceScore: Number((1.0 - this.currentThreshold).toFixed(3)),
            message: 'ไม่พบใบหน้าในกรอบสแกน กรุณาขยับเข้าใกล้กล้อง',
          });
        this.isScanning = false;
        return;
      }

      // Compare with enrolled students
      const result = faceEngine.matchStudent(extraction.descriptor, students, this.currentThreshold);

      if (result.success && result.matchedStudent) {
        // MATCH SUCCESS!
        const student = result.matchedStudent;
        const now = Date.now();

        // Check rapid duplicate within 15 seconds
        if (this.lastCheckinStudentId === student.id && now - this.lastCheckinTime < 15000) {
          this.renderScanResultDuplicate(student, result);
        } else {
          // Record attendance
          this.recordAttendanceSuccess(student, result, 'FACE_SCAN');
          this.lastCheckinStudentId = student.id;
          this.lastCheckinTime = now;
        }
      } else {
        // MATCH FAILED / DISTANCE EXCEEDS THRESHOLD
        // Requirement: "If a scan fails, display the difference score (threshold distance) as a number on the screen."
        if (isManualTrigger || result.distance < 0.9) {
          this.renderScanResultFailure(result);
          soundService.playAlert();
        }
      }
    } catch (e) {
      console.error('Face scan error:', e);
    } finally {
      this.isScanning = false;
    }
  }

  private recordAttendanceSuccess(
    student: Student,
    result: { distance: number; differenceScore: number; confidence: number; threshold: number },
    method: 'FACE_SCAN' | 'MANUAL',
    manualStatus: 'PRESENT' | 'LATE' | 'EXCUSED' = 'PRESENT',
    manualNote?: string
  ): void {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    // Check if after 9:30 AM for late status in automated mode
    const isLate = method === 'FACE_SCAN' ? (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30)) : manualStatus === 'LATE';
    const status = method === 'MANUAL' ? manualStatus : (isLate ? 'LATE' : 'PRESENT');

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${student.studentId}`,
      studentInternalId: student.id,
      studentId: student.studentId,
      studentName: student.fullName,
      programCohort: student.programCohort,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      status,
      method,
      differenceScore: result.differenceScore,
      distanceScore: result.distance,
      confidence: result.confidence,
      note: manualNote || (isLate ? 'เข้าเรียนช่วงสัมมนา' : 'เข้าเรียนตรงเวลา'),
    };

    storageService.addAttendanceRecord(newRecord);
    soundService.playSuccess();
    this.renderScanResultSuccess(student, result, newRecord);
    this.showToast(`บันทึกเวลาเรียนสำเร็จ: ${student.fullName}`, 'success');
  }

  private renderScanResultSuccess(
    student: Student,
    result: { distance: number; differenceScore: number; confidence: number; threshold: number },
    record: AttendanceRecord
  ): void {
    const container = document.getElementById('scan-hud-container');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-300 shadow-sm space-y-3 animate-in fade-in duration-200">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            บันทึกเข้าเรียนสำเร็จ
          </span>
          <span class="text-xs font-mono text-emerald-700 font-bold">${record.time} น.</span>
        </div>

        <div>
          <h4 class="text-base font-bold text-slate-900">${student.fullName}</h4>
          <p class="text-xs font-mono text-slate-600 mt-0.5">รหัสนิสิต: <strong>${student.studentId}</strong></p>
        </div>

        <!-- Biometric Match Scores -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/80 text-xs">
          <div class="bg-white/80 rounded-xl p-2 border border-emerald-200 text-center">
            <div class="text-[10px] text-slate-500 font-medium">ความเชื่อมั่น (Confidence)</div>
            <div class="text-lg font-bold font-mono text-emerald-700">${result.confidence}%</div>
          </div>
          <div class="bg-white/80 rounded-xl p-2 border border-emerald-200 text-center">
            <div class="text-[10px] text-slate-500 font-medium">ระยะห่าง (Distance)</div>
            <div class="text-lg font-bold font-mono text-slate-800">${result.distance}</div>
          </div>
        </div>

        <div class="text-[11px] text-emerald-800 flex items-center justify-between">
          <span>เกณฑ์ตัดสิน: &le; ${result.threshold}</span>
          <span>Difference: <strong>${result.differenceScore}</strong> (ผ่านเกณฑ์)</span>
        </div>
      </div>
    `;
  }

  private renderScanResultFailure(result: {
    distance: number;
    differenceScore: number;
    threshold: number;
    message: string;
  }): void {
    const container = document.getElementById('scan-hud-container');
    if (!container) return;

    // Requirement: If a scan fails, display the difference score (threshold distance) as a number on the screen.
    container.innerHTML = `
      <div class="bg-rose-50/90 rounded-2xl p-4 border border-rose-300 shadow-sm space-y-3 animate-in fade-in duration-200">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            สแกนไม่ผ่านเกณฑ์ (Mismatch)
          </span>
          <span class="text-xs font-mono text-rose-600 font-bold">FAIL</span>
        </div>

        <div>
          <p class="text-xs text-rose-800 font-medium">${result.message}</p>
        </div>

        <!-- Prominent Difference Score Display as requested -->
        <div class="bg-white rounded-xl p-3 border border-rose-200 text-center shadow-xs">
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            คะแนนความต่าง (Difference Score)
          </div>
          <div class="text-3xl font-black font-mono text-rose-600 my-1">
            +${result.differenceScore.toFixed(3)}
          </div>
          <div class="text-xs text-slate-600 font-mono">
            Distance: <strong>${result.distance.toFixed(3)}</strong> | Threshold: <strong>${result.threshold.toFixed(2)}</strong>
          </div>
          <div class="text-[10px] text-rose-500 mt-1 font-medium">
            (ระยะห่างชีวมิติเกินเกณฑ์ที่กำหนด +${result.differenceScore.toFixed(3)} หน่วย)
          </div>
        </div>

        <div class="text-[11px] text-slate-500 space-y-1 bg-rose-100/50 rounded-xl p-2.5">
          <div class="font-semibold text-rose-800">คำแนะนำ:</div>
          <div>1. ขยับใบหน้าให้อยู่ตรงกลางกรอบและนิ่งประมาณ ๑ วินาที</div>
          <div>2. ตรวจสอบว่านิสิตท่านนี้ได้ลงทะเบียนใบหน้าในระบบแล้วหรือไม่</div>
          <div>3. หรือใช้ปุ่ม "สแกนซ้ำ (Unlimited Re-scan)" ด้านล่าง</div>
        </div>
      </div>
    `;
  }

  private renderScanResultDuplicate(student: Student, result: { distance: number; threshold: number }): void {
    const container = document.getElementById('scan-hud-container');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-amber-50/90 rounded-2xl p-4 border border-amber-300 shadow-sm space-y-2 animate-in fade-in duration-150">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            เช็คชื่อเรียบร้อยแล้ว
          </span>
          <span class="text-xs font-mono text-amber-800">DUPLICATE</span>
        </div>
        <div class="text-sm font-bold text-slate-900">${student.fullName}</div>
        <p class="text-xs text-amber-800">
          นิสิตท่านนี้ได้บันทึกเวลาเรียนในคาบนี้ไปแล้วเมื่อสักครู่ ระบบป้องกันการบันทึกซ้ำซ้อน
        </p>
      </div>
    `;
  }

  private resetScanHud(): void {
    const container = document.getElementById('scan-hud-container');
    if (container) {
      container.innerHTML = `
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center text-slate-400">
          <p class="text-xs font-medium text-slate-600">พร้อมสแกนซ้ำ (Ready for Re-scan)</p>
          <p class="text-[11px] text-slate-400 mt-0.5">จัดใบหน้าให้อยู่ในกรอบ หรือกด "สแกนทันที"</p>
        </div>
      `;
    }
  }

  private handleManualCheckin(): void {
    const studentSelect = document.getElementById('sel-manual-student') as HTMLSelectElement;
    const statusSelect = document.getElementById('sel-manual-status') as HTMLSelectElement;
    const noteInput = document.getElementById('ipt-manual-note') as HTMLInputElement;

    if (!studentSelect || !studentSelect.value) {
      this.showToast('กรุณาเลือกนิสิตที่ต้องการเช็คชื่อ', 'alert');
      return;
    }

    const student = storageService.getStudentById(studentSelect.value);
    if (!student) {
      this.showToast('ไม่พบข้อมูลนิสิต', 'alert');
      return;
    }

    const status = (statusSelect.value || 'PRESENT') as 'PRESENT' | 'LATE' | 'EXCUSED';
    const note = noteInput.value.trim();

    this.recordAttendanceSuccess(
      student,
      { distance: 0, differenceScore: 0, confidence: 100, threshold: this.currentThreshold },
      'MANUAL',
      status,
      note || 'เช็คชื่อด้วยมือโดยอาจารย์ผู้สอน'
    );

    noteInput.value = '';
    studentSelect.value = '';
  }

  // ==========================================
  // TUITION & FINANCE TAB
  // ==========================================
  private bindFinanceTabEvents(): void {
    const form = document.getElementById('form-tuition-payment') as HTMLFormElement;
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const studentSelect = document.getElementById('pay-student-select') as HTMLSelectElement;
        const amountInput = document.getElementById('pay-amount') as HTMLInputElement;
        const semesterInput = document.getElementById('pay-semester') as HTMLInputElement;
        const dateInput = document.getElementById('pay-date') as HTMLInputElement;
        const methodSelect = document.getElementById('pay-method') as HTMLSelectElement;
        const payerInput = document.getElementById('pay-payer-name') as HTMLInputElement;

        if (!studentSelect.value) {
          this.showToast('กรุณาเลือกนิสิตผู้ชำระเงิน', 'alert');
          return;
        }

        const student = storageService.getStudentById(studentSelect.value);
        if (!student) return;

        const amount = parseFloat(amountInput.value) || 0;
        const count = storageService.getTuitionReceipts().length + 1;
        const receiptNumber = `REC-2569/${String(count).padStart(5, '0')}`;

        const isPhd = student.programCohort.startsWith('PHD');
        const items = isPhd
          ? [
              { name: 'ค่าลงทะเบียนเรียนและหน่วยกิต (๙ หน่วยกิต)', amount: Math.max(1000, amount - 5000) },
              { name: 'ค่าบำรุงห้องสมุดและคลังพระไตรปิฎกสารสนเทศ', amount: 2000 },
              { name: 'ค่าบำรุงเทคโนโลยีสารสนเทศและการเรียนการสอนออนไลน์', amount: 1500 },
              { name: 'ค่าธรรมเนียมสัมมนาทางวิชาการพระวินัยปิฎก', amount: 1500 },
            ]
          : [
              { name: 'ค่าลงทะเบียนเรียนและหน่วยกิต (๑๒ หน่วยกิต)', amount: Math.max(1000, amount - 2700) },
              { name: 'ค่าบำรุงห้องสมุดพระไตรปิฎก', amount: 1500 },
              { name: 'ค่าบำรุงระบบไอทีและห้องเรียน Hybrid Zoom', amount: 1200 },
            ];

        const newReceipt: TuitionReceipt = {
          id: `rec-${Date.now()}`,
          receiptNumber,
          studentId: student.studentId,
          studentName: student.fullName,
          programCohort: student.programCohort,
          semester: semesterInput.value.trim() || '๑/๒๕๖๙',
          academicYear: '๒๕๖๙',
          paymentDate: dateInput.value || new Date().toISOString().split('T')[0],
          paymentMethod: (methodSelect.value as 'PROMPTPAY_QR' | 'BANK_TRANSFER' | 'CASH') || 'PROMPTPAY_QR',
          items,
          totalAmount: amount,
          payerName: payerInput.value.trim() || student.fullName,
          referenceNumber: `MCU-PAY-${Date.now().toString().slice(-8)}`,
          officerName: 'นางสาวสุภาวดี นามวงศ์ (เจ้าหน้าที่การเงินและบัญชี)',
          issuedAt: new Date().toISOString(),
        };

        storageService.saveTuitionReceipt(newReceipt);
        soundService.playSuccess();
        this.viewingReceiptId = newReceipt.id;
        this.showToast(`ออกใบเสร็จรับเงิน ${receiptNumber} สำเร็จ`, 'success');
        this.render();
      };
    }
  }

  // ==========================================
  // PETITIONS & COMPLAINTS TAB
  // ==========================================
  private bindPetitionsTabEvents(): void {
    const anonymousChk = document.getElementById('pet-is-anonymous') as HTMLInputElement;
    const submitterBox = document.getElementById('pet-submitter-box');
    const form = document.getElementById('form-submit-petition') as HTMLFormElement;

    if (anonymousChk && submitterBox) {
      anonymousChk.onchange = () => {
        if (anonymousChk.checked) {
          submitterBox.classList.add('hidden');
        } else {
          submitterBox.classList.remove('hidden');
        }
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const categorySelect = document.getElementById('pet-category') as HTMLSelectElement;
        const isAnon = anonymousChk ? anonymousChk.checked : false;
        const studentSelect = document.getElementById('pet-student-select') as HTMLSelectElement;
        const contactInput = document.getElementById('pet-contact') as HTMLInputElement;
        const titleInput = document.getElementById('pet-title') as HTMLInputElement;
        const detailInput = document.getElementById('pet-detail') as HTMLTextAreaElement;
        const urgencySelect = document.getElementById('pet-urgency') as HTMLSelectElement;

        let studentId = '';
        let studentName = '';
        if (!isAnon && studentSelect.value) {
          const s = storageService.getStudentById(studentSelect.value);
          if (s) {
            studentId = s.studentId;
            studentName = s.fullName;
          }
        }

        const count = storageService.getPetitions().length + 1;
        const ticketNumber = `PET-2569-${String(count).padStart(3, '0')}`;

        const newPetition: Petition = {
          id: `pet-${Date.now()}`,
          ticketNumber,
          category: categorySelect.value as PetitionCategory,
          title: titleInput.value.trim(),
          detail: detailInput.value.trim(),
          isAnonymous: isAnon,
          studentId: isAnon ? undefined : studentId,
          studentName: isAnon ? undefined : studentName,
          contactEmail: isAnon ? undefined : contactInput.value.trim(),
          urgency: (urgencySelect.value as UrgencyLevel) || 'NORMAL',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        storageService.savePetition(newPetition);
        soundService.playSuccess();
        this.showToast(`ยื่นคำร้องเรียนรหัส "${ticketNumber}" สำเร็จ`, 'success');
        this.render();
      };
    }
  }

  // ==========================================
  // FACE REGISTRATION TAB
  // ==========================================
  private bindRegisterTabEvents(): void {
    const form = document.getElementById('form-register-student') as HTMLFormElement;
    const toggleCamBtn = document.getElementById('btn-reg-camera-toggle');
    const captureBtn = document.getElementById('btn-capture-face') as HTMLButtonElement;

    if (toggleCamBtn) {
      toggleCamBtn.onclick = () => this.toggleRegisterCamera();
    }
    if (captureBtn) {
      captureBtn.onclick = () => this.captureAndExtractDescriptor();
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.submitRegistration();
      };
    }
  }

  private async toggleRegisterCamera(): Promise<void> {
    if (this.regStream) {
      this.stopRegisterCamera();
    } else {
      await this.startRegisterCamera();
    }
  }

  private async startRegisterCamera(): Promise<void> {
    const video = document.getElementById('reg-video') as HTMLVideoElement;
    const idleEl = document.getElementById('reg-camera-idle');
    const captureBtn = document.getElementById('btn-capture-face') as HTMLButtonElement;
    const btnText = document.getElementById('txt-reg-camera-btn');

    if (!video) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      this.regStream = stream;
      video.srcObject = stream;
      await video.play();

      video.classList.remove('hidden');
      if (idleEl) idleEl.classList.add('hidden');
      if (captureBtn) captureBtn.disabled = false;
      if (btnText) btnText.textContent = 'ปิดกล้อง';

      this.showToast('เปิดกล้องสำหรับลงทะเบียนเรียบร้อย', 'success');
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Register camera error:', e);
      this.showToast(`ไม่สามารถเปิดกล้องได้: ${e.message}`, 'alert');
    }
  }

  private stopRegisterCamera(): void {
    if (this.regStream) {
      this.regStream.getTracks().forEach(t => t.stop());
      this.regStream = null;
    }

    const video = document.getElementById('reg-video') as HTMLVideoElement;
    const idleEl = document.getElementById('reg-camera-idle');
    const captureBtn = document.getElementById('btn-capture-face') as HTMLButtonElement;
    const btnText = document.getElementById('txt-reg-camera-btn');

    if (video) {
      video.classList.add('hidden');
      video.srcObject = null;
    }
    if (idleEl) idleEl.classList.remove('hidden');
    if (captureBtn) captureBtn.disabled = true;
    if (btnText) btnText.textContent = 'เปิดกล้อง';
  }

  private async captureAndExtractDescriptor(): Promise<void> {
    if (!this.regStream) return;
    const video = document.getElementById('reg-video') as HTMLVideoElement;
    const loadingEl = document.getElementById('reg-loading-overlay');
    const statusEl = document.getElementById('reg-signature-status');

    if (!video || video.readyState < 2) return;

    try {
      if (loadingEl) loadingEl.classList.remove('hidden');

      // Requirement: Extract and store face as textual facial descriptor/signature (DO NOT store actual image files).
      const extraction = await faceEngine.extractDescriptor(video);

      if (extraction.descriptor && extraction.descriptor.length === 128) {
        this.tempRegDescriptor = extraction.descriptor;
        soundService.playSuccess();

        // Sample first 4 numbers to show user the textual signature
        const previewSig = extraction.descriptor.slice(0, 4).map(n => n.toFixed(3)).join(', ');

        if (statusEl) {
          statusEl.className = 'mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950';
          statusEl.innerHTML = `
            <div class="flex items-center gap-2 font-bold text-emerald-800">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              สกัดเวกเตอร์ชีวมิติ 128 มิติสำเร็จ (ไม่มีการบันทึกภาพถ่าย)
            </div>
            <div class="font-mono text-[11px] text-emerald-700 mt-1 truncate">
              Signature Vector: [${previewSig}, ... 124 values]
            </div>
            <p class="text-[10px] text-emerald-600 mt-0.5">
              พร้อมแนบกับโปรไฟล์นิสิตตามมาตรฐาน PDPA
            </p>
          `;
        }

        this.showToast('สกัดเวกเตอร์ชีวมิติ 128 มิติเรียบร้อย', 'success');
      } else {
        soundService.playAlert();
        this.showToast('ไม่สามารถตรวจจับใบหน้าได้ กรุณาจัดตำแหน่งใบหน้าใหม่อีกครั้ง', 'alert');
      }
    } catch (e) {
      console.error('Capture error:', e);
      this.showToast('เกิดข้อผิดพลาดในการสกัดใบหน้า', 'alert');
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  private submitRegistration(): void {
    const studentIdInput = document.getElementById('reg-student-id') as HTMLInputElement;
    const fullNameInput = document.getElementById('reg-fullname') as HTMLInputElement;
    const emailInput = document.getElementById('reg-email') as HTMLInputElement;
    const cohortSelect = document.getElementById('reg-cohort') as HTMLSelectElement;
    const pdpaCheckbox = document.getElementById('reg-pdpa-consent') as HTMLInputElement;

    if (!studentIdInput || !fullNameInput || !emailInput || !cohortSelect || !pdpaCheckbox) return;

    if (!pdpaCheckbox.checked) {
      this.showToast('กรุณายินยอมเงื่อนไข PDPA ก่อนบันทึกข้อมูล', 'alert');
      return;
    }

    if (!this.tempRegDescriptor) {
      this.showToast('กรุณากดปุ่ม "ตรวจจับและสกัดเวกเตอร์ใบหน้า" ก่อนบันทึก', 'alert');
      return;
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      studentId: studentIdInput.value.trim(),
      fullName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      programCohort: cohortSelect.value as CohortId,
      pdpaConsented: true,
      pdpaConsentDate: new Date().toISOString(),
      faceDescriptor: this.tempRegDescriptor, // 128-d textual vector, NO IMAGE STORED
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveStudent(newStudent);
    this.tempRegDescriptor = null;
    this.stopRegisterCamera();

    this.showToast(`ลงทะเบียนนิสิต "${newStudent.fullName}" สำเร็จ`, 'success');
    this.switchTab('students');
  }

  // ==========================================
  // STUDENT MANAGEMENT TAB
  // ==========================================
  private bindStudentsTabEvents(): void {
    const searchInput = document.getElementById('ipt-student-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.oninput = () => {
        this.studentsState.searchTerm = searchInput.value;
        this.render();
        // Maintain focus on search input
        const reInput = document.getElementById('ipt-student-search') as HTMLInputElement;
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(reInput.value.length, reInput.value.length);
        }
      };
    }

    // Cohort filter pills
    document.querySelectorAll('[data-filter-cohort]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cohort = btn.getAttribute('data-filter-cohort') || 'ALL';
        this.studentsState.selectedCohort = cohort;
        this.render();
      });
    });

    // Edit student modal trigger
    document.querySelectorAll('[data-edit-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-student');
        if (id) {
          this.studentsState.editingStudentId = id;
          this.render();
          this.bindEditModalEvents();
        }
      });
    });

    // Delete student modal trigger (Cascade Delete)
    document.querySelectorAll('[data-delete-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-student');
        if (id) {
          this.studentsState.deletingStudentId = id;
          this.render();
        }
      });
    });
  }

  private bindEditModalEvents(): void {
    const form = document.getElementById('form-edit-student') as HTMLFormElement;
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const idInput = document.getElementById('edit-internal-id') as HTMLInputElement;
        const nameInput = document.getElementById('edit-fullname') as HTMLInputElement;
        const emailInput = document.getElementById('edit-email') as HTMLInputElement;
        const cohortSelect = document.getElementById('edit-cohort') as HTMLSelectElement;

        if (idInput && nameInput && emailInput && cohortSelect) {
          storageService.updateStudent(idInput.value, {
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim(),
            programCohort: cohortSelect.value as CohortId,
          });
          this.studentsState.editingStudentId = null;
          this.showToast('อัปเดตข้อมูลนิสิตเรียบร้อย', 'success');
          this.render();
        }
      };
    }
  }

  // ==========================================
  // DATA MANAGEMENT TAB
  // ==========================================
  private bindDataTabEvents(): void {
    const exportBtn = document.getElementById('btn-export-json');
    const triggerImportBtn = document.getElementById('btn-trigger-import');
    const fileInput = document.getElementById('ipt-import-file') as HTMLInputElement;
    const seedBtn = document.getElementById('btn-seed-data');
    const resetBtn = document.getElementById('btn-system-reset');

    if (exportBtn) {
      exportBtn.onclick = () => this.exportBackupJson();
    }

    if (triggerImportBtn && fileInput) {
      triggerImportBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => this.handleImportJson(e);
    }

    if (seedBtn) {
      seedBtn.onclick = () => {
        storageService.seedDemoData();
        this.showToast('สร้างข้อมูลจำลอง ๑๐ นิสิต ๓ สาขาวิชา ๖ รุ่น สำเร็จ', 'success');
        this.render();
      };
    }

    if (resetBtn) {
      resetBtn.onclick = () => {
        const container = document.getElementById('modal-container');
        if (container) {
          container.innerHTML = renderResetConfirmModal();
        }
      };
    }
  }

  private exportBackupJson(): void {
    const data = storageService.exportData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `mcu_attendance_backup_${dateStamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast(`ส่งออกไฟล์สำรองข้อมูล "${filename}" เรียบร้อยแล้ว`, 'success');
  }

  private handleImportJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = storageService.importData(parsed);

        if (result.success) {
          this.showToast(result.message, 'success');
          this.render();
        } else {
          this.showToast(result.message, 'alert');
        }
      } catch (err) {
        this.showToast('ไฟล์ JSON ชำรุดหรือไม่ถูกต้องตามรูปแบบ', 'alert');
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  // --- FLOATING TOAST HELPER ---
  private showToast(message: string, type: 'success' | 'alert' | 'info' = 'info'): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgCls = type === 'success'
      ? 'bg-slate-900 text-white border-emerald-500'
      : type === 'alert'
      ? 'bg-rose-950 text-rose-100 border-rose-500'
      : 'bg-slate-900 text-white border-amber-500';

    toast.className = `${bgCls} pointer-events-auto px-4 py-3 rounded-2xl border-l-4 shadow-xl text-xs font-medium flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 opacity-0 max-w-sm`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
