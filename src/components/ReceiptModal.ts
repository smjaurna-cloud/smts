import { TuitionReceipt, COHORTS } from '../types/index';
import { icons } from '../utils/icons';

export function renderReceiptModal(receipt: TuitionReceipt | null): string {
  if (!receipt) return '';

  const cohortInfo = COHORTS[receipt.programCohort]?.title || receipt.programCohort;

  const itemRows = receipt.items.map((item, idx) => `
    <tr class="border-b border-stone-200">
      <td class="py-2.5 px-3 text-xs text-center text-slate-500 font-mono">${idx + 1}</td>
      <td class="py-2.5 px-3 text-xs text-slate-800">${item.name}</td>
      <td class="py-2.5 px-3 text-xs text-right font-mono font-semibold text-slate-900">${item.amount.toLocaleString('th-TH')}.00</td>
    </tr>
  `).join('');

  return `
    <div id="modal-receipt-backdrop" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150 print:m-0 print:p-0 print:border-none print:shadow-none">
        <!-- Top Toolbar (Hidden on print) -->
        <div class="flex items-center justify-between pb-3 border-b border-stone-100 print:hidden">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              ${icons.fileText}
            </span>
            <h3 class="text-sm font-bold text-slate-900">ใบเสร็จรับเงินค่าลงทะเบียนเรียนอิเล็กทรอนิกส์</h3>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              id="btn-print-receipt"
              class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span class="w-3.5 h-3.5">${icons.printer}</span>
              พิมพ์ใบเสร็จ (Print / PDF)
            </button>
            <button type="button" id="btn-close-receipt-modal" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
              ✕
            </button>
          </div>
        </div>

        <!-- Official Printable Document Body (A4 Style) -->
        <div id="printable-receipt-area" class="space-y-5 bg-white p-2">
          <!-- Letterhead Header -->
          <div class="text-center pb-4 border-b-2 border-amber-600 space-y-1">
            <div class="w-16 h-16 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              วส.มจร
            </div>
            <h2 class="text-lg font-bold text-slate-900 tracking-tight mt-2">
              มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย
            </h2>
            <p class="text-xs text-slate-600">
              วิทยาลัยสงฆ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (วส. มจร)
            </p>
            <p class="text-[11px] text-slate-500">
              ตำบลรางพิกุล อำเภอกำแพงแสน จังหวัดนครปฐม ๗๓๑๔๐ | โทร. ๐๓๔-๓๕๒-๒๕๓
            </p>
            <div class="pt-2">
              <span class="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-sm tracking-wide border border-amber-300">
                ใบเสร็จรับเงินค่าลงทะเบียนเรียน (OFFICIAL RECEIPT)
              </span>
            </div>
          </div>

          <!-- Receipt Meta Details -->
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="space-y-1">
              <div><span class="text-slate-500">เลขที่ใบเสร็จ:</span> <strong class="font-mono text-rose-700">${receipt.receiptNumber}</strong></div>
              <div><span class="text-slate-500">รหัสนิสิต:</span> <strong class="font-mono text-slate-900">${receipt.studentId}</strong></div>
              <div><span class="text-slate-500">ชื่อ-นามสกุล / สมณศักดิ์:</span> <strong class="text-slate-900">${receipt.studentName}</strong></div>
              <div><span class="text-slate-500">หลักสูตร:</span> <span class="text-slate-800">${cohortInfo}</span></div>
            </div>

            <div class="space-y-1 text-right">
              <div><span class="text-slate-500">วันที่ออกใบเสร็จ:</span> <strong class="text-slate-800">${receipt.paymentDate}</strong></div>
              <div><span class="text-slate-500">ภาคการศึกษา:</span> <strong class="text-slate-800">${receipt.semester}</strong></div>
              <div><span class="text-slate-500">วิธีการชำระ:</span> <span class="text-emerald-700 font-medium">PromptPay QR / e-Payment</span></div>
              <div><span class="text-slate-500">เลขอ้างอิง:</span> <span class="font-mono text-[11px] text-slate-600">${receipt.referenceNumber}</span></div>
            </div>
          </div>

          <!-- Items Breakdown Table -->
          <div class="border border-stone-200 rounded-xl overflow-hidden mt-3">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-amber-50/70 border-b border-stone-200 text-[11px] font-bold text-slate-700">
                  <th class="py-2 px-3 text-center w-12">ลำดับ</th>
                  <th class="py-2 px-3">รายการค่าธรรมเนียมการศึกษา</th>
                  <th class="py-2 px-3 text-right w-32">จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
              <tfoot>
                <tr class="bg-slate-50 font-bold border-t-2 border-stone-300">
                  <td colspan="2" class="py-3 px-3 text-xs text-right text-slate-700">
                    ยอดรวมสุทธิทั้งสิ้น (Total Net Amount):
                  </td>
                  <td class="py-3 px-3 text-sm text-right font-mono text-rose-700">
                    ${receipt.totalAmount.toLocaleString('th-TH')}.00 ฿
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Signatures Section -->
          <div class="grid grid-cols-2 gap-6 pt-6 text-xs text-center">
            <div class="space-y-4">
              <div class="text-slate-500">ลงชื่อผู้ชำระเงิน</div>
              <div class="font-semibold text-slate-900 border-b border-dotted border-stone-300 pb-1 max-w-[200px] mx-auto">
                ${receipt.payerName || receipt.studentName}
              </div>
              <div class="text-[11px] text-slate-400">นิสิต / ผู้แทนชำระ</div>
            </div>

            <div class="space-y-4">
              <div class="text-slate-500">ลงชื่อเจ้าหน้าที่การเงินและบัญชี</div>
              <div class="font-semibold text-slate-900 border-b border-dotted border-stone-300 pb-1 max-w-[200px] mx-auto">
                ${receipt.officerName}
              </div>
              <div class="text-[11px] text-slate-400">ฝ่ายการเงินและบัญชี วส.มจร</div>
            </div>
          </div>

          <!-- Footer Stamp -->
          <div class="pt-4 border-t border-stone-100 text-center text-[10px] text-slate-400 flex items-center justify-between">
            <span>เอกสารนี้ออกโดยระบบบริหารจัดการสารสนเทศ วส. มจร (SMST ERP)</span>
            <span>ตรวจสอบย้อนหลังได้ที่งานการเงินและบัญชี โทร. 034-352-253</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
