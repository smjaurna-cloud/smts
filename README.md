# smts - Attendance Tracking System
### ระบบติดตามการเข้าเรียนของนิสิตระดับบัณฑิตศึกษา
**มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย (วส. มจร)**

---

## 🎯 เกี่ยวกับโครงการ (Overview)
ระบบติดตามการเข้าเรียนของนิสิตระดับบัณฑิตศึกษา (ปริญญาโท-ปริญญาเอก ๓ สาขาวิชา ๖ รุ่น) และระบบสารสนเทศสนับสนุนการศึกษาแบบบูรณาการ:
- **พุทธศาสตรดุษฎีบัณฑิต** สาขาวิชาพระไตรปิฎกศึกษา (รุ่นที่ ๑ และ ๒)
- **พุทธศาสตรมหาบัณฑิต** สาขาวิชาพระไตรปิฎกศึกษา (รุ่นที่ ๑ และ ๒)
- **พุทธศาสตรมหาบัณฑิต** สาขาวิชาพระอภิธรรมปิฎก (รุ่นที่ ๑ และ ๒)

---

## 🌟 คุณสมบัติหลัก (Key Features)

1. **Face Registration (PDPA 128-d Vector):**
   - ลงทะเบียนใบหน้านิสิตด้วยกล้อง Webcam หรือรูปถ่าย
   - สกัดเฉพาะเวกเตอร์ตัวเลข 128 มิติ (`Float32Array`)
   - **ไม่จัดเก็บไฟล์รูปภาพจริง** คุ้มครองความเป็นส่วนตัวตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) 100%

2. **Real-time Face-Scan Attendance:**
   - ตรวจจับใบหน้าเข้าเรียนแบบเรียลไทม์ (Auto Continuous & Manual Trigger)
   - สแกนซ้ำได้ไม่จำกัดครั้ง
   - ระบบ **Difference Score HUD**: หากไม่ผ่านเกณฑ์จะแสดงส่วนต่างคะแนนบนหน้าจออย่างเด่นชัด (เช่น `Difference: +0.180`)
   - ระบบเช็กชื่อสำรองด้วยมือ (Manual Attendance Check) สำหรับพระเถระและคณาจารย์

3. **Hybrid Classrooms & 4 Zoom Rooms:**
   - ผสานระบบห้องเรียนออนไซต์และออนไลน์ ๔ ห้อง Zoom ครอบคลุมทุกสาขาวิชา:
     - **ห้องที่ ๑ (ดุษฎีบัณฑิต พระไตรปิฎกศึกษา):** `mcu.bv352@gmail.com`
     - **ห้องที่ ๒ (มหาบัณฑิต พระไตรปิฎกศึกษา):** `palitheravad034352253@gmail.com`
     - **ห้องที่ ๓ (มหาบัณฑิต พระอภิธรรมปิฎก):** `palitheravad27042564@hotmail.com`
     - **ห้องที่ ๔ (ห้องสอบดุษฎีนิพนธ์ & สัมมนาวิชาการ):** `mcu.zoom515@mcu.ac.th`
   - มีปุ่มคลิกเปิดเข้าห้องเรียน Zoom โดยตรง และปุ่มคัดลอกรหัสผ่านในคลิกเดียว

4. **Finance & Tuition Payments:**
   - ชำระค่าเทอมด้วย PromptPay QR Code วส. มจร (`0-9940-00165-43-2`)
   - โอนเข้าบัญชีธนาคารกรุงไทย (`726-0-45892-1`)
   - ออกใบเสร็จรับเงินดิจิทัลทางการขนาด A4 สั่งพิมพ์ได้
   - แสดงข้อมูลติดต่อฝ่ายการเงินและบัญชีอย่างครบถ้วน

5. **Petitions & Grievance Tracker:**
   - ระบบยื่นคำร้องเรียนและข้อเสนอแนะ ๕ หมวดหมู่ (การเรียนการสอน, อาคารสถานที่, การเงิน, ไอที, ทั่วไป)
   - รองรับการยื่นแบบไม่เปิดเผยตัวตน (Anonymous)
   - แสดงสถานะคำร้องแบบเรียลไทม์ (PENDING, IN_PROGRESS, RESOLVED)

6. **Data Management & Backup:**
   - ระบบสำรองและกู้คืนข้อมูล JSON Export / Import แบบครบวงจร
   - ระบบล้างข้อมูลระบบใหม่ทั้งหมด (System Reset พร้อมการยืนยัน)
   - ข้อมูลจำลองเริ่มต้น (Seed Demo Data) สำหรับการสาธิต

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยี (Tech Stack)
- **Core Framework:** Vite + TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Sacred Royal Heritage Theme: Saffron Gold & Soft Sand `#faf8f2`)
- **Biometrics Engine:** `@vladmandic/face-api` (CDN loader + Spatial fallback)
- **Audio:** Web Audio API (Synthesized Chime Engine โดยไม่ต้องพึ่งพาไฟล์ MP3 ภายนอก)
- **Storage:** Client-side LocalStorage พร้อม Cascade Deletion

---

## 🚀 การติดตั้งและเปิดใช้งาน (Getting Started)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เปิดใช้งาน Development Server
npm run dev

# 3. บิลด์สำหรับ Production
npm run build

# 4. ทดสอบพรีวิว Production Build
npm run preview
```

---

## 🏛️ ผู้รับผิดชอบโครงการ
**มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย (วส. มจร)**  
Repository: [https://github.com/smjaurna-cloud/smts](https://github.com/smjaurna-cloud/smts)
