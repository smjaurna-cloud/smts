import { storageService } from '../services/storage';
import { TuitionReceipt, COHORTS } from '../types/index';
import { icons } from '../utils/icons';

export function renderFinanceTab(): string {
  const students = storageService.getStudents();
  const receipts = storageService.getTuitionReceipts();

  const studentOptions = students.map(s => {
    const cohort = COHORTS[s.programCohort]?.shortTitle || s.programCohort;
    return `<option value="${s.id}">${s.studentId} - ${s.fullName} (${cohort})</option>`;
  }).join('');

  // Render receipts list
  const receiptRows = receipts.length === 0
    ? `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
          ยังไม่มีรายการออกใบเสร็จรับเงิน กรุณากรอกแบบฟอร์มแจ้งชำระค่าเทอมด้านบน
        </td>
      </tr>
    `
    : receipts.map((r: TuitionReceipt) => {
        const cohortInfo = COHORTS[r.programCohort]?.shortTitle || r.programCohort;
        return `
          <tr class="border-b border-stone-100 hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-3 text-xs font-mono font-bold text-rose-700">
              ${r.receiptNumber}
            </td>
            <td class="py-3 px-3 text-xs">
              <div class="font-semibold text-slate-900">${r.studentName}</div>
              <div class="text-[11px] text-slate-400">รหัส: ${r.studentId} (${cohortInfo})</div>
            </td>
            <td class="py-3 px-3 text-xs text-slate-600">
              ${r.semester}
            </td>
            <td class="py-3 px-3 text-xs font-mono font-bold text-slate-900">
              ${r.totalAmount.toLocaleString('th-TH')} ฿
            </td>
            <td class="py-3 px-3 text-xs text-slate-500">
              ${r.paymentDate}
            </td>
            <td class="py-3 px-3 text-xs text-right">
              <button 
                type="button" 
                data-view-receipt="${r.id}"
                class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <span class="w-3.5 h-3.5">${icons.fileText}</span>
                ดูใบเสร็จ
              </button>
            </td>
          </tr>
        `;
      }).join('');

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Tuition Payment & Financial Services
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            ชำระค่าเทอม ใบเสร็จ และการเงินและบัญชี
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-0.5">
            มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย (วส. มจร) - บริการชำระค่าธรรมเนียมการศึกษาด้วย QR Code และออกใบเสร็จทางการ
          </p>
        </div>

        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          ระบบออกใบเสร็จรับเงินอิเล็กทรอนิกส์พร้อมใช้
        </span>
      </div>

      <!-- Payment & QR Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: PromptPay QR Code Box (5 cols) -->
        <div class="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div class="text-center pb-3 border-b border-stone-100">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              PromptPay / ธนาคารกรุงไทย
            </span>
            <h3 class="text-base font-bold text-slate-900 mt-2">
              สแกน QR Code ชำระค่าเทอม
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              ค่าลงทะเบียนเรียนและค่าบำรุงการศึกษา ระดับบัณฑิตศึกษา
            </p>
          </div>

          <!-- Stylized High-Resolution QR Card -->
          <div class="bg-gradient-to-b from-amber-500 to-amber-600 rounded-2xl p-4 text-white text-center shadow-sm">
            <div class="bg-white rounded-xl p-4 inline-block shadow-inner">
              <!-- Visual PromptPay QR representation with Logo in center -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="w-48 h-48 mx-auto">
                <!-- Background & Frame -->
                <rect width="200" height="200" fill="#ffffff" rx="8"/>
                
                <!-- Position Detection Patterns (Top-Left) -->
                <rect x="15" y="15" width="45" height="45" fill="#0f172a" rx="4"/>
                <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="2"/>
                <rect x="29" y="29" width="17" height="17" fill="#d97706" rx="2"/>

                <!-- Top-Right -->
                <rect x="140" y="15" width="45" height="45" fill="#0f172a" rx="4"/>
                <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="2"/>
                <rect x="154" y="29" width="17" height="17" fill="#d97706" rx="2"/>

                <!-- Bottom-Left -->
                <rect x="15" y="140" width="45" height="45" fill="#0f172a" rx="4"/>
                <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="2"/>
                <rect x="29" y="154" width="17" height="17" fill="#d97706" rx="2"/>

                <!-- Simulated Data Matrix Blocks -->
                <g fill="#0f172a">
                  <rect x="70" y="18" width="8" height="8"/>
                  <rect x="85" y="18" width="8" height="8"/>
                  <rect x="100" y="18" width="8" height="8"/>
                  <rect x="115" y="18" width="8" height="8"/>

                  <rect x="70" y="32" width="8" height="8"/>
                  <rect x="100" y="32" width="8" height="8"/>
                  <rect x="122" y="32" width="8" height="8"/>

                  <rect x="75" y="46" width="8" height="8"/>
                  <rect x="90" y="46" width="8" height="8"/>
                  <rect x="115" y="46" width="8" height="8"/>

                  <rect x="18" y="70" width="8" height="8"/>
                  <rect x="32" y="70" width="8" height="8"/>
                  <rect x="46" y="70" width="8" height="8"/>
                  <rect x="60" y="70" width="8" height="8"/>
                  <rect x="140" y="70" width="8" height="8"/>
                  <rect x="155" y="70" width="8" height="8"/>
                  <rect x="170" y="70" width="8" height="8"/>

                  <rect x="25" y="85" width="8" height="8"/>
                  <rect x="40" y="85" width="8" height="8"/>
                  <rect x="55" y="85" width="8" height="8"/>
                  <rect x="135" y="85" width="8" height="8"/>
                  <rect x="150" y="85" width="8" height="8"/>
                  <rect x="165" y="85" width="8" height="8"/>

                  <rect x="18" y="100" width="8" height="8"/>
                  <rect x="35" y="100" width="8" height="8"/>
                  <rect x="52" y="100" width="8" height="8"/>
                  <rect x="140" y="100" width="8" height="8"/>
                  <rect x="160" y="100" width="8" height="8"/>

                  <rect x="70" y="145" width="8" height="8"/>
                  <rect x="85" y="145" width="8" height="8"/>
                  <rect x="100" y="145" width="8" height="8"/>
                  <rect x="120" y="145" width="8" height="8"/>
                  <rect x="140" y="145" width="8" height="8"/>
                  <rect x="160" y="145" width="8" height="8"/>
                  <rect x="175" y="145" width="8" height="8"/>

                  <rect x="70" y="160" width="8" height="8"/>
                  <rect x="92" y="160" width="8" height="8"/>
                  <rect x="115" y="160" width="8" height="8"/>
                  <rect x="145" y="160" width="8" height="8"/>
                  <rect x="165" y="160" width="8" height="8"/>

                  <rect x="70" y="175" width="8" height="8"/>
                  <rect x="85" y="175" width="8" height="8"/>
                  <rect x="105" y="175" width="8" height="8"/>
                  <rect x="130" y="175" width="8" height="8"/>
                  <rect x="155" y="175" width="8" height="8"/>
                  <rect x="170" y="175" width="8" height="8"/>
                </g>

                <!-- Center Emblem Logo -->
                <circle cx="100" cy="100" r="22" fill="#ffffff" stroke="#d97706" stroke-width="3"/>
                <circle cx="100" cy="100" r="17" fill="#be185d"/>
                <text x="100" y="104" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">วส.มจร</text>
              </svg>
            </div>
            
            <div class="mt-3 text-xs font-medium">
              <div class="font-bold text-amber-100">บัญชี: มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย</div>
              <div class="text-[11px] opacity-90 font-mono mt-0.5">PromptPay ID: 0-9940-00165-43-2</div>
              <div class="text-[11px] opacity-90 font-mono">ธนาคารกรุงไทย เลขที่: 726-0-45892-1</div>
            </div>
          </div>

          <!-- Tuition Rates Info -->
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
            <div class="font-bold text-slate-800">อัตราค่าบำรุงการศึกษา (ภาคการศึกษาที่ ๑/๒๕๖๙):</div>
            <div class="flex justify-between text-slate-600 text-[11px]">
              <span>พุทธศาสตรดุษฎีบัณฑิต (เหมาจ่าย/เทอม)</span>
              <span class="font-mono font-semibold">23,000 ฿</span>
            </div>
            <div class="flex justify-between text-slate-600 text-[11px]">
              <span>พุทธศาสตรมหาบัณฑิต (เหมาจ่าย/เทอม)</span>
              <span class="font-mono font-semibold">17,100 ฿</span>
            </div>
          </div>
        </div>

        <!-- Right: Submit Payment & Receipt Generator (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div class="pb-3 border-b border-stone-100">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="text-rose-600">${icons.creditCard}</span>
              แจ้งชำระค่าเทอม & ออกใบเสร็จรับเงินทันที
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              บันทึกข้อมูลการชำระเงินเพื่อสร้างใบเสร็จรับเงินดิจิทัลที่มีตราประทับทางการ
            </p>
          </div>

          <form id="form-tuition-payment" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                เลือกนิสิตผู้ชำระเงิน <span class="text-rose-500">*</span>
              </label>
              <select id="pay-student-select" required class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                <option value="">-- กรุณาเลือกนิสิต --</option>
                ${studentOptions}
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนเงินที่ชำระ (บาท) <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  id="pay-amount" 
                  required 
                  min="1000" 
                  step="100" 
                  placeholder="เช่น 23000 หรือ 17100"
                  class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  ภาคการศึกษา / ปีการศึกษา <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="pay-semester" 
                  required 
                  value="๑/๒๕๖๙"
                  class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่ชำระเงิน <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="pay-date" 
                  required 
                  value="${new Date().toISOString().split('T')[0]}"
                  class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  ช่องทางการชำระ
                </label>
                <select id="pay-method" class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                  <option value="PROMPTPAY_QR">สแกน PromptPay QR Code</option>
                  <option value="BANK_TRANSFER">โอนผ่านเคาน์เตอร์/ตู้ ATM ธนาคาร</option>
                  <option value="CASH">ชำระเงินสด ณ สำนักงานการเงิน</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้โอน / บัญชีต้นทาง (สำหรับระบุในใบเสร็จ)
              </label>
              <input 
                type="text" 
                id="pay-payer-name" 
                placeholder="เช่น บัญชีวัด / มูลนิธิ หรือชื่อตนเอง"
                class="w-full bg-slate-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <button 
              type="submit" 
              class="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span class="w-4 h-4">${icons.checkCircle}</span>
              <span>ยืนยันการชำระเงินและออกใบเสร็จรับเงิน</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Issued Receipts Table -->
      <div class="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="text-amber-600">${icons.fileText}</span>
              ประวัติใบเสร็จรับเงินค่าลงทะเบียนเรียน (Digital Receipts)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              ใบเสร็จรับเงินที่ออกโดยฝ่ายการเงินและบัญชี สามารถพิมพ์เพื่อใช้เบิกจ่ายต้นสังกัดได้
            </p>
          </div>
          <span class="text-xs text-slate-400 font-mono">${receipts.length} ใบเสร็จ</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-stone-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th class="py-2.5 px-3">เลขที่ใบเสร็จ</th>
                <th class="py-2.5 px-3">นิสิต / สาขาวิชา</th>
                <th class="py-2.5 px-3">ภาคเรียน</th>
                <th class="py-2.5 px-3">ยอดเงินรวม</th>
                <th class="py-2.5 px-3">วันที่ชำระ</th>
                <th class="py-2.5 px-3 text-right">เอกสาร</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${receiptRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Contact Finance & Accounting Office -->
      <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div class="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            ${icons.phone}
          </span>
          <div>
            <h3 class="text-base font-bold text-slate-900">
              ติดต่อฝ่ายการเงินและบัญชี มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย
            </h3>
            <p class="text-xs text-slate-500">
              สำหรับการประสานงานใบเสร็จฉบับจริง ใบอนุโมทนาบัตร หรือทุนการศึกษาสงฆ์
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <span class="text-rose-600">${icons.phone}</span> หมายเลขโทรศัพท์:
            </div>
            <div class="font-mono text-slate-700 text-sm font-semibold">034-352-253</div>
            <div class="font-mono text-slate-600 text-xs">สายด่วน: 099-445-4256</div>
          </div>

          <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <span class="text-rose-600">${icons.mail}</span> อีเมลฝ่ายการเงิน:
            </div>
            <div class="font-mono text-slate-700 text-xs">finance.mvu@mcu.ac.th</div>
            <div class="font-mono text-slate-600 text-[11px]">smjaurna@gmail.com</div>
          </div>

          <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <span class="text-rose-600">${icons.mapPin}</span> สถานที่ติดต่อ:
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              อาคารสำนักงานการเงินและบัญชี ชั้น ๑ มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย ตำบลรางพิกุล อำเภอกำแพงแสน จังหวัดนครปฐม
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
