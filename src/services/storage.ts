import {
  Student,
  AttendanceRecord,
  BackupData,
  CohortId,
  COHORTS,
  Petition,
  TuitionReceipt,
  ZoomRoom,
  PetitionStatus
} from '../types/index';

const STORAGE_KEYS = {
  STUDENTS: 'mcu_attendance_students_v1',
  ATTENDANCE: 'mcu_attendance_records_v1',
  PETITIONS: 'mcu_attendance_petitions_v1',
  RECEIPTS: 'mcu_attendance_receipts_v1',
  ZOOM_ROOMS: 'mcu_attendance_zoom_rooms_v1',
  SETTINGS: 'mcu_attendance_settings_v1',
};


class StorageService {
  // --- STUDENTS ---
  getStudents(): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading students from localStorage:', e);
      return [];
    }
  }

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id || s.studentId === id);
  }

  saveStudent(student: Student): void {
    const students = this.getStudents();
    const existingIndex = students.findIndex(s => s.id === student.id || s.studentId === student.studentId);
    if (existingIndex >= 0) {
      students[existingIndex] = { ...student, updatedAt: new Date().toISOString() };
    } else {
      students.unshift(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  updateStudent(id: string, partial: Partial<Student>): boolean {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    students[idx] = {
      ...students[idx],
      ...partial,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return true;
  }

  /**
   * Cascade delete student and all their associated attendance history
   */
  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const target = students.find(s => s.id === id);
    if (!target) return false;

    // Filter out student
    const updatedStudents = students.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

    // Cascade delete attendance records
    const records = this.getAttendanceRecords();
    const updatedRecords = records.filter(
      r => r.studentInternalId !== id && r.studentId !== target.studentId
    );
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedRecords));

    return true;
  }

  // --- ATTENDANCE ---
  getAttendanceRecords(): AttendanceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading attendance from localStorage:', e);
      return [];
    }
  }

  addAttendanceRecord(record: AttendanceRecord): void {
    const records = this.getAttendanceRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  }

  getTodayAttendanceRecords(): AttendanceRecord[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAttendanceRecords().filter(r => r.date === today);
  }

  getRecentAttendanceRecords(limit = 10): AttendanceRecord[] {
    return this.getAttendanceRecords().slice(0, limit);
  }

  /**
   * Calculate 7-day historical attendance counts (today and previous 6 days)
   */
  get7DayHistoricalStats(): { date: string; label: string; count: number; dayName: string }[] {
    const records = this.getAttendanceRecords();
    const stats: { date: string; label: string; count: number; dayName: string }[] = [];
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();
      const thaiDay = thaiDays[dayIdx];
      const dayNum = d.getDate();
      const monthNum = d.getMonth() + 1;

      // Unique student count on that day
      const dayRecords = records.filter(r => r.date === dateStr);
      const uniqueAttendees = new Set(dayRecords.map(r => r.studentId)).size;

      stats.push({
        date: dateStr,
        label: `${dayNum}/${monthNum}`,
        dayName: thaiDay,
        count: uniqueAttendees,
      });
    }

    return stats;
  }

  // --- ZOOM CLASSROOMS (4 HYBRID ROOMS) ---
  getZoomRooms(): ZoomRoom[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ZOOM_ROOMS);
      if (raw) {
        const parsed: ZoomRoom[] = JSON.parse(raw);
        // Automatically migrate if schedules are missing
        if (parsed.length > 0 && parsed.every(r => r.schedules && r.schedules.length > 0)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const defaultRooms = this.getDefaultZoomRooms();
    this.saveZoomRooms(defaultRooms);
    return defaultRooms;
  }

  getDefaultZoomRooms(): ZoomRoom[] {
    return [
      {
        roomNumber: 1,
        name: 'ซูมห้องที่ ๑ (พธ.ม. พระไตรปิฎกเถรวาท)',
        targetProgram: 'พุทธศาสตรมหาบัณฑิต สาขาวิชาพระไตรปิฎกเถรวาท รุ่นที่ ๓ (ชั้นปีที่ ๑)',
        onSiteLocation: 'อาคารพระไตรปิฎกศึกษา ชั้น ๑ ห้อง ๑๐๑ (Smart Classroom 1)',
        zoomAccount: 'mcu.bv352@gmail.com',
        zoomPassword: 'MCU-034352253.zoom',
        zoomUrl: 'https://zoom.us/join',
        meetingId: '352-253-0001',
        isLive: true,
        activeTopic: '๖๒๐ ๑๐๑ หลักประมวลคำสอนของพระพุทธเจ้าในพระไตรปิฎกเถรวาท',
        schedules: [
          {
            id: 'sch-r1-1',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๖๒๐ ๑๐๑',
            courseNameTh: 'หลักประมวลคำสอนของพระพุทธเจ้าในพระไตรปิฎกเถรวาท',
            courseNameEn: 'The Nine Bases of Buddha Teaching in Theravada Tipitaka',
            courseType: 'วิชาบังคับ',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร และคณะ',
            teachingTeam: ['ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร', 'อ.ดร.ประสิทธิ์ อัครสุวรรณกุล', 'ดร.อวยพร ทิพย์สุวรรณ'],
            cohortPlan: 'พธ.ม. พระไตรปิฎกเถรวาท ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r1-2',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๖๒๐ ๑๐๔',
            courseNameTh: 'การวิเคราะห์พระวินัยปิฎกเถรวาท',
            courseNameEn: 'Theravada Vinaya Pitaka Analysis',
            courseType: 'วิชาเอก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'พระมหาอภิเชษฐ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.', 'พระมหาประสิทธิ์ ญาณรํสี, ผศ.ดร.'],
            cohortPlan: 'พธ.ม. พระไตรปิฎกเถรวาท ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r1-3',
            day: 'วันศุกร์',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๖๒๐ ๑๐๕',
            courseNameTh: 'ทฤษฎีและวิธีวิเคราะห์พระสุตตันตปิฎกเถรวาท',
            courseNameEn: 'Theravada Suttanta Pitaka Analysis',
            courseType: 'วิชาเอก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'รศ.ดร.เวทย์ บรรณกรกุล และคณะ',
            teachingTeam: ['รศ.ดร.เวทย์ บรรณกรกุล', 'พระมหาชาญชัย, ผศ.ดร.', 'ดร.อวยพร ทิพย์สุวรรณ'],
            cohortPlan: 'พธ.ม. พระไตรปิฎกเถรวาท ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r1-4',
            day: 'วันศุกร์',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๖๒๐ ๑๐๒',
            courseNameTh: 'ระเบียบวิธีวิจัยขั้นสูง',
            courseNameEn: 'Advanced Research Methodology in the Tipitaka',
            courseType: 'วิชาบังคับ',
            credits: '๓ (๓-๐-๖)',
            instructor: 'พระราชรัตนมุนี, รศ.ดร. และคณะ',
            teachingTeam: ['พระราชรัตนมุนี, รศ.ดร.', 'พระมหาบุญเลิศ อินฺทปญฺโญ, ศ.ดร.', 'ผศ.ดร.ประสิทธิ์ มีนวล'],
            cohortPlan: 'พธ.ม. พระไตรปิฎกเถรวาท ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
        ],
      },
      {
        roomNumber: 2,
        name: 'ซูมห้องที่ ๒ (พธ.ม. พระอภิธรรมปิฎก)',
        targetProgram: 'พุทธศาสตรมหาบัณฑิต สาขาวิชาพระอภิธรรมปิฎก รุ่นที่ ๑ และ ๒ (ชั้นปีที่ ๑ และ ๒)',
        onSiteLocation: 'อาคารพระไตรปิฎกศึกษา ชั้น ๑ ห้อง ๑๐๒ (Abhidhamma Hall)',
        zoomAccount: 'palitheravad034352253@gmail.com',
        zoomPassword: 'MCU-034352253.zoom',
        zoomUrl: 'https://zoom.us/join',
        meetingId: '352-253-0002',
        isLive: true,
        activeTopic: '๖๒๑ ๑๐๑ การศึกษาคัมภีร์ธัมมสังคณี / ๖๒๒ ๒๐๗ จิตวิทยาในพระอภิธรรม',
        schedules: [
          {
            id: 'sch-r2-1',
            day: 'วันพฤหัสบดี',
            period: 'คาบเช้า',
            timeRange: '๐๙.๐๐ - ๑๑.๓๐ น.',
            courseCode: '๖๒๑ ๑๐๐',
            courseNameTh: 'การใช้ภาษาบาลีเพื่อการศึกษาคัมภีร์',
            courseNameEn: 'Usage of Pali',
            courseType: 'วิชาปรับพื้นฐาน',
            credits: 'วิชาปรับพื้นฐานไม่นับหน่วยกิต',
            instructor: 'พระมหาปิยะพันธุ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาปิยะพันธุ์, รศ.ดร.'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๑ (รุ่นที่ ๒)',
          },
          {
            id: 'sch-r2-2',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๖๒๑ ๑๐๑',
            courseNameTh: 'การศึกษาคัมภีร์ธัมมสังคณี',
            courseNameEn: 'A Study of Dhammasangani',
            courseType: 'วิชาเอก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร และคณะ',
            teachingTeam: ['ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร', 'ดร.ประภา สุวรรณเกต และคณะครู'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๑ (รุ่นที่ ๒)',
          },
          {
            id: 'sch-r2-3',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๖๒๑ ๑๐๒',
            courseNameTh: 'การศึกษาวิเคราะห์คัมภีร์ปุคคลบัญญัติ กถาวัตถุ และยมก',
            courseNameEn: 'An Analytical Study of Puggalapannatti, Kathavatthu and Yamaka',
            courseType: 'วิชาเอก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'พระมหาอภิเชษฐ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๑ (รุ่นที่ ๒)',
          },
          {
            id: 'sch-r2-4',
            day: 'วันศุกร์',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๖๒๑ ๑๐๔',
            courseNameTh: 'การศึกษาพระอภิธรรมปิฎก',
            courseNameEn: 'Abhidhamma Pitaka Study',
            courseType: 'วิชาบังคับ',
            credits: '๒-๓ (๓-๐-๖)',
            instructor: 'ดร.ประภา และคณะครู',
            teachingTeam: ['ดร.ประภา สุวรรณเกต และคณะครู'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๑ (รุ่นที่ ๒)',
          },
          {
            id: 'sch-r2-5',
            day: 'วันศุกร์',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๖๒๑ ๑๐๓',
            courseNameTh: 'การศึกษาวิเคราะห์คัมภีร์วิภังค์และธาตุกถา',
            courseNameEn: 'An Analytical Study of Vibhanga and Dhatukatha',
            courseType: 'วิชาเอก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ดร.บุญชู พรหมเผ่าพันธุ์ และคณะ',
            teachingTeam: ['ดร.บุญชู พรหมเผ่าพันธุ์'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๑ (รุ่นที่ ๒)',
          },
          {
            id: 'sch-r2-6',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๖๒๒ ๒๐๗',
            courseNameTh: 'จิตวิทยาในพระอภิธรรม',
            courseNameEn: 'Psychology in the Abhidhamma',
            courseType: 'วิชาเลือก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ดร.ประภา และคณะครู',
            teachingTeam: ['ดร.ประภา สุวรรณเกต และคณะครู'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๒ (รุ่นที่ ๑)',
          },
          {
            id: 'sch-r2-7',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๖๒๒ ๒๐๒',
            courseNameTh: 'สัมมนาพระอภิธรรม',
            courseNameEn: 'Seminar on Abhidhamma',
            courseType: 'วิชาบังคับ',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร และคณะ',
            teachingTeam: ['ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๒ (รุ่นที่ ๑)',
          },
          {
            id: 'sch-r2-8',
            day: 'วันศุกร์',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๖๒๒ ๒๐๑',
            courseNameTh: 'กัมมัฏฐาน',
            courseNameEn: 'Buddhist Meditation',
            courseType: 'วิชาบังคับไม่นับหน่วยกิต',
            credits: '(๓) (๓-๐-๖)',
            instructor: 'พระมหาอภิเชษฐ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.'],
            cohortPlan: 'พธ.ม. พระอภิธรรมปิฎก ชั้นปีที่ ๒ (รุ่นที่ ๑)',
          },
        ],
      },
      {
        roomNumber: 3,
        name: 'ซูมห้องที่ ๓ (พธ.ด. พระไตรปิฎกเถรวาท)',
        targetProgram: 'พุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระไตรปิฎกเถรวาท (รุ่นที่ ๒ และ ๓ แผน ๑.๑ และ ๒.๑)',
        onSiteLocation: 'อาคารพระไตรปิฎกศึกษา ชั้น ๒ ห้อง ๒๐๑ (Doctoral Seminar Room)',
        zoomAccount: 'palitheravad27042564@hotmail.com',
        zoomPassword: 'palitheravad27042564',
        zoomUrl: 'https://zoom.us/join',
        meetingId: '270-425-6400',
        isLive: true,
        activeTopic: '๘๒๐ ๑๐๐ ดุษฎีนิพนธ์ / ๘๒๐ ๑๐๑ ระเบียบวิธีวิจัยทางพระไตรปิฎกขั้นสูง',
        schedules: [
          {
            id: 'sch-r3-1',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๘๒๐ ๑๐๐',
            courseNameTh: 'ดุษฎีนิพนธ์',
            courseNameEn: 'Dissertation',
            courseType: 'วิทยานิพนธ์/ดุษฎีนิพนธ์',
            credits: '๓๖ หน่วยกิต',
            instructor: 'พระมหาอภิเชษฐ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.', 'คณะกรรมการที่ปรึกษาดุษฎีนิพนธ์'],
            cohortPlan: 'พธ.ด. แผน ๑.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-2',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๘๒๐ ๑๐๑',
            courseNameTh: 'ระเบียบวิธีวิจัยทางพระไตรปิฎกขั้นสูง',
            courseNameEn: 'Advanced Research Methodology in the Tipitaka',
            courseType: 'วิชาบังคับไม่นับหน่วยกิต',
            credits: '(๓) (๓-๐-๖)',
            instructor: 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร และคณะ',
            teachingTeam: ['ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร'],
            cohortPlan: 'พธ.ด. แผน ๑.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-3',
            day: 'วันศุกร์',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๘๒๐ ๑๐๒',
            courseNameTh: 'พุทธปรัชญาวิทยาศาสตร์',
            courseNameEn: 'Buddhist Philosophy of Science',
            courseType: 'วิชาบังคับไม่นับหน่วยกิต',
            credits: '(๓) (๓-๐-๖)',
            instructor: 'รศ.ดร.เวทย์ บรรณกรกุล และคณะ',
            teachingTeam: ['รศ.ดร.เวทย์ บรรณกรกุล'],
            cohortPlan: 'พธ.ด. แผน ๑.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-4',
            day: 'วันศุกร์',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๘๒๐ ๒๐๑',
            courseNameTh: 'วิปัสสนากัมมัฏฐาน',
            courseNameEn: 'Insight Meditation',
            courseType: 'วิชาบังคับไม่นับหน่วยกิต',
            credits: '(๓) (๓-๐-๖)',
            instructor: 'อาจารย์สมบูรณ์, รศ.ดร. และคณะ',
            teachingTeam: ['อาจารย์สมบูรณ์, รศ.ดร.'],
            cohortPlan: 'พธ.ด. แผน ๑.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-5',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๔ - ๖',
            timeRange: '๑๒.๔๕ - ๑๕.๔๕ น.',
            courseCode: '๘๒๐ ๑๐๓',
            courseNameTh: 'สัมมนาพระพุทธศาสนากับสังคมไทย',
            courseNameEn: 'Seminar on Buddhist University and Thai Society',
            courseType: 'วิชาบังคับไม่นับหน่วยกิต',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ดร.บุญชู พรหมเผ่าพันธุ์ และคณะ',
            teachingTeam: ['ดร.บุญชู พรหมเผ่าพันธุ์'],
            cohortPlan: 'พธ.ด. แผน ๒.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-6',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๘๒๐ ๑๐๑',
            courseNameTh: 'ระเบียบวิธีวิจัยทางพระไตรปิฎกขั้นสูง',
            courseNameEn: 'Advanced Research Methodology in the Tipitaka',
            courseType: 'วิชาบังคับ',
            credits: '๓ (๓-๐-๖)',
            instructor: 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร และคณะ',
            teachingTeam: ['ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร'],
            cohortPlan: 'พธ.ด. แผน ๒.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-7',
            day: 'วันศุกร์',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๘๒๐ ๒๐๒',
            courseNameTh: 'สัมมนาพระไตรปิฎก',
            courseNameEn: 'Seminar on Tipitaka',
            courseType: 'วิชาเอก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'พระมหาอภิเชษฐ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.'],
            cohortPlan: 'พธ.ด. แผน ๒.๑ ชั้นปีที่ ๑ (รุ่นที่ ๓)',
          },
          {
            id: 'sch-r3-8',
            day: 'วันพฤหัสบดี',
            period: 'คาบที่ ๗ - ๙',
            timeRange: '๑๖.๐๐ - ๑๙.๐๐ น.',
            courseCode: '๘๒๐ ๒๐๕',
            courseNameTh: 'ศาสตร์และวิทยาการร่วมสมัยในพระไตรปิฎกเถรวาท',
            courseNameEn: 'The Hermeneutics in Theravada Tipitaka',
            courseType: 'วิชาเลือก',
            credits: '๓ (๓-๐-๖)',
            instructor: 'พระมหาอภิเชษฐ์, รศ.ดร. และคณะ',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.'],
            cohortPlan: 'พธ.ด. แผน ๒.๑ ชั้นปีที่ ๒ (รุ่นที่ ๒)',
          },
          {
            id: 'sch-r3-9',
            day: 'วันศุกร์',
            period: 'คาบที่ ๔ - ๙',
            timeRange: '๑๒.๔๕ - ๑๙.๐๐ น.',
            courseCode: '๘๒๐ ๕๐๐',
            courseNameTh: 'ดุษฎีนิพนธ์',
            courseNameEn: 'Dissertation',
            courseType: 'วิทยานิพนธ์/ดุษฎีนิพนธ์',
            credits: '๓๖ หน่วยกิต',
            instructor: 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร และคณะ',
            teachingTeam: ['ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร'],
            cohortPlan: 'พธ.ด. แผน ๒.๑ ชั้นปีที่ ๒ (รุ่นที่ ๒)',
          },
        ],
      },
      {
        roomNumber: 4,
        name: 'ซูมห้องที่ ๔ (ห้องสอบดุษฎีนิพนธ์ & สัมมนาวิชาการ)',
        targetProgram: 'ทุกสาขาวิชาบัณฑิตศึกษา / กองบริการวิชาการและงานวิจัย',
        onSiteLocation: 'ห้องประชุมสมเด็จพระสังฆราช ชั้น ๓ อาคารวิทยบริการ มจร',
        zoomAccount: 'mcu.zoom515@mcu.ac.th',
        zoomPassword: 'mcuzoom515',
        zoomUrl: 'https://zoom.us/join',
        meetingId: '515-034-3522',
        isLive: false,
        activeTopic: 'การสอบวัดคุณสมบัติดุษฎีบัณฑิต (QE) และการสอบป้องกันดุษฎีนิพนธ์',
        schedules: [
          {
            id: 'sch-r4-1',
            day: 'วันพฤหัสบดี',
            period: 'คาบเช้า',
            timeRange: '๐๙.๐๐ - ๑๒.๐๐ น.',
            courseCode: 'QE-800',
            courseNameTh: 'การสอบวัดคุณสมบัติดุษฎีบัณฑิต (Qualifying Examination)',
            courseNameEn: 'Ph.D. Qualifying Examination',
            courseType: 'วิทยานิพนธ์/ดุษฎีนิพนธ์',
            credits: 'เกณฑ์มาตรฐาน ผ่าน/ไม่ผ่าน',
            instructor: 'คณะกรรมการผู้ทรงคุณวุฒิประจำสาขาวิชา',
            teachingTeam: ['พระราชรัตนมุนี, รศ.ดร.', 'พระมหาสมบูรณ์ สุมงฺคโล, รศ.ดร.', 'ผศ.ดร.สุทธิพงษ์ พรชัยธนบวร'],
            cohortPlan: 'นิสิตดุษฎีบัณฑิตทุกสาขา',
          },
          {
            id: 'sch-r4-2',
            day: 'วันศุกร์',
            period: 'คาบบ่าย',
            timeRange: '๑๓.๐๐ - ๑๖.๓๐ น.',
            courseCode: 'DEF-800',
            courseNameTh: 'การสอบป้องกันดุษฎีนิพนธ์และวิทยานิพนธ์ (Final Defense)',
            courseNameEn: 'Doctoral Dissertation & Master Thesis Defense',
            courseType: 'วิทยานิพนธ์/ดุษฎีนิพนธ์',
            credits: 'ตามแผนหลักสูตร',
            instructor: 'คณะกรรมการผู้ทรงคุณวุฒิภายนอกและภายใน',
            teachingTeam: ['พระมหาอภิเชษฐ์, รศ.ดร.', 'รศ.ดร.เวทย์ บรรณกรกุล', 'ดร.บุญชู พรหมเผ่าพันธุ์'],
            cohortPlan: 'นิสิตผู้ยื่นขอสอบวิทยานิพนธ์',
          },
        ],
      },
    ];
  }

  saveZoomRooms(rooms: ZoomRoom[]): void {
    localStorage.setItem(STORAGE_KEYS.ZOOM_ROOMS, JSON.stringify(rooms));
  }

  toggleZoomRoomStatus(roomNumber: number): boolean {
    const rooms = this.getZoomRooms();
    const target = rooms.find(r => r.roomNumber === roomNumber);
    if (!target) return false;
    target.isLive = !target.isLive;
    this.saveZoomRooms(rooms);
    return true;
  }

  // --- PETITIONS & COMPLAINTS ---
  getPetitions(): Petition[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PETITIONS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  savePetition(petition: Petition): void {
    const petitions = this.getPetitions();
    petitions.unshift(petition);
    localStorage.setItem(STORAGE_KEYS.PETITIONS, JSON.stringify(petitions));
  }

  updatePetitionStatus(id: string, status: PetitionStatus, adminNote?: string): boolean {
    const petitions = this.getPetitions();
    const idx = petitions.findIndex(p => p.id === id);
    if (idx === -1) return false;
    petitions[idx] = {
      ...petitions[idx],
      status,
      adminNote: adminNote !== undefined ? adminNote : petitions[idx].adminNote,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PETITIONS, JSON.stringify(petitions));
    return true;
  }

  deletePetition(id: string): boolean {
    const petitions = this.getPetitions().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PETITIONS, JSON.stringify(petitions));
    return true;
  }

  // --- TUITION RECEIPTS ---
  getTuitionReceipts(): TuitionReceipt[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveTuitionReceipt(receipt: TuitionReceipt): void {
    const receipts = this.getTuitionReceipts();
    receipts.unshift(receipt);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  }

  // --- DATA MANAGEMENT ---
  exportData(): BackupData {
    const students = this.getStudents();
    const attendanceRecords = this.getAttendanceRecords();
    const petitions = this.getPetitions();
    const receipts = this.getTuitionReceipts();

    return {
      system: 'MCU_GRADUATE_ATTENDANCE_TRACKER',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalStudents: students.length,
        totalAttendanceRecords: attendanceRecords.length,
        totalPetitions: petitions.length,
        totalReceipts: receipts.length,
      },
      students,
      attendanceRecords,
      petitions,
      receipts,
    };
  }

  importData(data: unknown): { success: boolean; message: string; count?: { students: number; records: number } } {
    try {
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง (ไม่ใช่ JSON Object)' };
      }

      const payload = data as Partial<BackupData>;
      if (!Array.isArray(payload.students) || !Array.isArray(payload.attendanceRecords)) {
        return { success: false, message: 'โครงสร้างข้อมูลไม่สมบูรณ์ ขาดฟิลด์ students หรือ attendanceRecords' };
      }

      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(payload.students));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(payload.attendanceRecords));

      if (Array.isArray(payload.petitions)) {
        localStorage.setItem(STORAGE_KEYS.PETITIONS, JSON.stringify(payload.petitions));
      }
      if (Array.isArray(payload.receipts)) {
        localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(payload.receipts));
      }

      return {
        success: true,
        message: `นำเข้าข้อมูลเรียบร้อย: นิสิต ${payload.students.length} รูป/ท่าน, ประวัติเข้าเรียน ${payload.attendanceRecords.length} รายการ`,
        count: {
          students: payload.students.length,
          records: payload.attendanceRecords.length,
        }
      };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: `เกิดข้อผิดพลาดในการนำเข้า: ${err?.message || 'Unknown error'}` };
    }
  }

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.PETITIONS);
    localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
    localStorage.removeItem(STORAGE_KEYS.ZOOM_ROOMS);
  }

  /**
   * Seed authentic demonstration cohort data
   */
  seedDemoData(): void {
    const mockStudents: Student[] = [
      {
        id: 'seed-std-001',
        studentId: '6701102001',
        fullName: 'พระมหาดนัย ฉนฺทโสภโณ (ป.ธ.๙)',
        email: 'danai.cha@mcu.ac.th',
        programCohort: 'PHD_TIPITAKA_1',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-01T08:00:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(101),
        createdAt: '2026-06-01T08:00:00.000Z',
        updatedAt: '2026-06-01T08:00:00.000Z',
      },
      {
        id: 'seed-std-002',
        studentId: '6701102002',
        fullName: 'พระครูปลัดสุวัฒนศีลคุณ (สุนทร ฐิตธมฺโม)',
        email: 'sunthorn.thi@mcu.ac.th',
        programCohort: 'PHD_TIPITAKA_1',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-01T08:15:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(102),
        createdAt: '2026-06-01T08:15:00.000Z',
        updatedAt: '2026-06-01T08:15:00.000Z',
      },
      {
        id: 'seed-std-003',
        studentId: '6801102003',
        fullName: 'พระมหาภาณุวัฒน์ ญาณสมฺปนฺโน (ป.ธ.๗)',
        email: 'phanuwat.ya@mcu.ac.th',
        programCohort: 'PHD_TIPITAKA_2',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-02T09:00:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(103),
        createdAt: '2026-06-02T09:00:00.000Z',
        updatedAt: '2026-06-02T09:00:00.000Z',
      },
      {
        id: 'seed-std-004',
        studentId: '6702203004',
        fullName: 'พระคเชนทร์ วชิรเมธี (ป.ธ.๖)',
        email: 'kachain.va@mcu.ac.th',
        programCohort: 'MA_TIPITAKA_1',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-03T10:00:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(104),
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:00:00.000Z',
      },
      {
        id: 'seed-std-005',
        studentId: '6702203005',
        fullName: 'ดร.สมศักดิ์ วงศ์สวรรค์',
        email: 'somsak.w@mcu.ac.th',
        programCohort: 'MA_TIPITAKA_1',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-03T10:30:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(105),
        createdAt: '2026-06-03T10:30:00.000Z',
        updatedAt: '2026-06-03T10:30:00.000Z',
      },
      {
        id: 'seed-std-006',
        studentId: '6802203006',
        fullName: 'พระมหาอภิสิทธิ์ วฑฺฒโน (ป.ธ.๘)',
        email: 'aphisit.va@mcu.ac.th',
        programCohort: 'MA_TIPITAKA_2',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-04T11:00:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(106),
        createdAt: '2026-06-04T11:00:00.000Z',
        updatedAt: '2026-06-04T11:00:00.000Z',
      },
      {
        id: 'seed-std-007',
        studentId: '6703304007',
        fullName: 'พระอธิการประยุทธ์ สุทธิญาโณ',
        email: 'prayut.su@mcu.ac.th',
        programCohort: 'MA_ABHIDHAMMA_1',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-05T08:30:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(107),
        createdAt: '2026-06-05T08:30:00.000Z',
        updatedAt: '2026-06-05T08:30:00.000Z',
      },
      {
        id: 'seed-std-008',
        studentId: '6703304008',
        fullName: 'แม่ชีปิยวรรณ สิริรัตน์',
        email: 'piyawun.s@mcu.ac.th',
        programCohort: 'MA_ABHIDHAMMA_1',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-05T09:00:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(108),
        createdAt: '2026-06-05T09:00:00.000Z',
        updatedAt: '2026-06-05T09:00:00.000Z',
      },
      {
        id: 'seed-std-009',
        studentId: '6803304009',
        fullName: 'พระมหากิตติศักดิ์ ชินวโร (ป.ธ.๙)',
        email: 'kittisak.ch@mcu.ac.th',
        programCohort: 'MA_ABHIDHAMMA_2',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-06T13:00:00.000Z',
        faceDescriptor: this.generateSyntheticDescriptor(109),
        createdAt: '2026-06-06T13:00:00.000Z',
        updatedAt: '2026-06-06T13:00:00.000Z',
      },
      {
        id: 'seed-std-010',
        studentId: '6803304010',
        fullName: 'อาจารย์พรทิพย์ เมธาวรากร',
        email: 'porntip.m@mcu.ac.th',
        programCohort: 'MA_ABHIDHAMMA_2',
        pdpaConsented: true,
        pdpaConsentDate: '2026-06-06T13:30:00.000Z',
        faceDescriptor: null, // Test case: Student without face registered yet
        createdAt: '2026-06-06T13:30:00.000Z',
        updatedAt: '2026-06-06T13:30:00.000Z',
      },
    ];

    // Generate historical attendance for the last 7 days
    const mockAttendance: AttendanceRecord[] = [];
    const today = new Date();

    // Last 7 days history
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      // Select subset of students attending on this day
      const attendeesCount = dayOffset === 0 ? 6 : Math.floor(4 + (dayOffset * 7) % 5);
      const dayStudents = mockStudents.slice(0, attendeesCount);

      dayStudents.forEach((student, index) => {
        const hour = 8 + Math.floor(index / 3);
        const minute = 15 + ((index * 13) % 40);
        const second = 10 + ((index * 17) % 45);
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        const timestamp = `${dateStr}T${timeStr}.000Z`;

        const isLate = minute > 45;
        const isManual = index % 3 === 2;
        const distance = isManual ? null : 0.28 + (index * 0.03);
        const diff = distance !== null ? Number((distance - 0.50).toFixed(3)) : null;
        const confidence = distance !== null ? Math.round((1 - (distance / 0.50)) * 100) : null;

        mockAttendance.push({
          id: `att-${dateStr}-${student.studentId}`,
          studentInternalId: student.id,
          studentId: student.studentId,
          studentName: student.fullName,
          programCohort: student.programCohort,
          timestamp,
          date: dateStr,
          time: timeStr,
          status: isLate ? 'LATE' : 'PRESENT',
          method: isManual ? 'MANUAL' : 'FACE_SCAN',
          differenceScore: diff,
          distanceScore: distance ? Number(distance.toFixed(3)) : null,
          confidence: confidence ? Math.max(70, Math.min(99, confidence)) : null,
          note: isLate ? 'เข้าเรียนช่วงสัมมนาพิเศษ' : 'เข้าเรียนตามเวลาปกติ',
        });
      });
    }

    // Seed sample petitions
    const mockPetitions: Petition[] = [
      {
        id: 'pet-001',
        ticketNumber: 'PET-2569-001',
        category: 'ACADEMIC',
        title: 'ขอขยายเวลาส่งรายงานสัมมนาพระไตรปิฎกศึกษา ภาคการศึกษาที่ ๑',
        detail: 'เนื่องจากมีศาสนกิจจัดสอบบาลีสนามหลวงระดับจังหวัด จึงกราบขอขยายเวลาส่งรายงานสัมมนาออกไปอีก ๑ สัปดาห์',
        isAnonymous: false,
        studentId: '6701102001',
        studentName: 'พระมหาดนัย ฉนฺทโสภโณ (ป.ธ.๙)',
        contactEmail: 'danai.cha@mcu.ac.th',
        contactPhone: '081-234-5678',
        urgency: 'NORMAL',
        status: 'RESOLVED',
        adminNote: 'อาจารย์ผู้รับผิดชอบหลักสูตรอนุมัติให้ขยายเวลาส่งถึง ๓๐ กันยายน ๒๕๖๙',
        createdAt: '2026-06-10T10:00:00.000Z',
        updatedAt: '2026-06-12T14:30:00.000Z',
      },
      {
        id: 'pet-002',
        ticketNumber: 'PET-2569-002',
        category: 'FACILITIES',
        title: 'ขอปรับปรุงสัญญาณ Wi-Fi ณ อาคารพระไตรปิฎกศึกษา ห้องเรียน ๑๐๒',
        detail: 'ช่วงเวลา ๑๓:๐๐ - ๑๖:๐๐ น. มีการเชื่อมต่อสตรีมมิ่ง Zoom หลายอุปกรณ์ สัญญาณอินเทอร์เน็ตสะดุด',
        isAnonymous: true,
        urgency: 'URGENT',
        status: 'IN_PROGRESS',
        adminNote: 'ฝ่ายเทคโนโลยีสารสนเทศดำเนินการติดตั้ง Access Point เพิ่มเติม ๑ จุด',
        createdAt: '2026-06-15T09:30:00.000Z',
        updatedAt: '2026-06-16T11:00:00.000Z',
      },
      {
        id: 'pet-003',
        ticketNumber: 'PET-2569-003',
        category: 'FINANCE',
        title: 'ขอตรวจสอบการออกใบเสร็จรับเงินค่าลงทะเบียนเรียน ภาคเรียนที่ ๑/๒๕๖๙',
        detail: 'ได้ชำระเงินผ่าน PromptPay QR เรียบร้อยแล้ว ขอความอนุเคราะห์ออกใบเสร็จทางการเพื่อเบิกต้นสังกัด',
        isAnonymous: false,
        studentId: '6702203005',
        studentName: 'ดร.สมศักดิ์ วงศ์สวรรค์',
        contactEmail: 'somsak.w@mcu.ac.th',
        urgency: 'NORMAL',
        status: 'PENDING',
        createdAt: '2026-06-18T15:20:00.000Z',
        updatedAt: '2026-06-18T15:20:00.000Z',
      },
    ];

    // Seed sample tuition receipts
    const mockReceipts: TuitionReceipt[] = [
      {
        id: 'rec-001',
        receiptNumber: 'REC-2569/00018',
        studentId: '6701102001',
        studentName: 'พระมหาดนัย ฉนฺทโสภโณ (ป.ธ.๙)',
        programCohort: 'PHD_TIPITAKA_1',
        semester: '๑/๒๕๖๙',
        academicYear: '๒๕๖๙',
        paymentDate: '2026-06-05',
        paymentMethod: 'PROMPTPAY_QR',
        items: [
          { name: 'ค่าลงทะเบียนเรียนและหน่วยกิต (๙ หน่วยกิต)', amount: 18000 },
          { name: 'ค่าบำรุงห้องสมุดและคลังพระไตรปิฎกสารสนเทศ', amount: 2000 },
          { name: 'ค่าบำรุงเทคโนโลยีสารสนเทศและการเรียนการสอนออนไลน์', amount: 1500 },
          { name: 'ค่าธรรมเนียมสัมมนาทางวิชาการพระวินัยปิฎก', amount: 1500 },
        ],
        totalAmount: 23000,
        payerName: 'พระมหาดนัย ฉนฺทโสภโณ (บัญชีวัดพระปฐมเจดีย์)',
        referenceNumber: 'MCU-PAY-20260605-8821',
        officerName: 'นางสาวสุภาวดี นามวงศ์ (เจ้าหน้าที่การเงินและบัญชี)',
        issuedAt: '2026-06-05T11:45:00.000Z',
      },
      {
        id: 'rec-002',
        receiptNumber: 'REC-2569/00025',
        studentId: '6702203004',
        studentName: 'พระคเชนทร์ วชิรเมธี (ป.ธ.๖)',
        programCohort: 'MA_TIPITAKA_1',
        semester: '๑/๒๕๖๙',
        academicYear: '๒๕๖๙',
        paymentDate: '2026-06-08',
        paymentMethod: 'PROMPTPAY_QR',
        items: [
          { name: 'ค่าลงทะเบียนเรียนและหน่วยกิต (๑๒ หน่วยกิต)', amount: 14400 },
          { name: 'ค่าบำรุงห้องสมุดพระไตรปิฎก', amount: 1500 },
          { name: 'ค่าบำรุงระบบไอทีและห้องเรียน Hybrid Zoom', amount: 1200 },
        ],
        totalAmount: 17100,
        payerName: 'พระคเชนทร์ วชิรเมธี',
        referenceNumber: 'MCU-PAY-20260608-4109',
        officerName: 'นางสาวสุภาวดี นามวงศ์ (เจ้าหน้าที่การเงินและบัญชี)',
        issuedAt: '2026-06-08T14:15:00.000Z',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(mockStudents));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(mockAttendance));
    localStorage.setItem(STORAGE_KEYS.PETITIONS, JSON.stringify(mockPetitions));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(mockReceipts));
    localStorage.setItem(STORAGE_KEYS.ZOOM_ROOMS, JSON.stringify(this.getDefaultZoomRooms()));
  }

  private generateSyntheticDescriptor(seed: number): number[] {
    const vec: number[] = [];
    let s = seed;
    for (let i = 0; i < 128; i++) {
      s = (s * 9301 + 49297) % 233280;
      const rnd = (s / 233280) * 2 - 1;
      vec.push(Number(rnd.toFixed(4)));
    }
    // Normalize vector to unit sphere
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map(v => Number((v / norm).toFixed(4)));
  }

  // --- CSV DATA EXPORT METHODS (WITH UTF-8 BOM) ---
  generateAttendanceCSV(): string {
    const records = this.getAttendanceRecords();
    const headers = ['วันที่', 'เวลา', 'รหัสนิสิต', 'ชื่อ-นามสกุล', 'สาขาวิชา/รุ่น', 'สถานะการเข้าเรียน', 'วิธีการเช็กชื่อ', 'Diff Score', 'ความเชื่อมั่น (%)', 'หมายเหตุ'];
    const rows = records.map(r => [
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.studentId}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.programCohort}"`,
      `"${r.status === 'PRESENT' ? 'มาเรียน' : r.status === 'LATE' ? 'มาสาย' : r.status === 'EXCUSED' ? 'ลากิจ/ลาป่วย' : 'ขาดเรียน'}"`,
      `"${r.method === 'FACE_SCAN' ? 'สแกนใบหน้าอัตโนมัติ' : 'เช็กชื่อด้วยตนเอง'}"`,
      `"${r.differenceScore !== null ? r.differenceScore.toFixed(3) : '-'}"`,
      `"${r.confidence !== null ? `${r.confidence}%` : '-'}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ]);
    return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }

  generateStudentsCSV(): string {
    const students = this.getStudents();
    const headers = ['รหัสนิสิต', 'ชื่อ-นามสกุล/ฉายา', 'สาขาวิชา/รุ่น', 'อีเมล', 'สถานะเวกเตอร์ใบหน้า', 'ยินยอม PDPA', 'วันที่ลงทะเบียน'];
    const rows = students.map(s => [
      `"${s.studentId}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.programCohort}"`,
      `"${s.email}"`,
      `"${s.faceDescriptor ? 'ลงทะเบียนแล้ว (128-d)' : 'ยังไม่ลงทะเบียน'}"`,
      `"${s.pdpaConsented ? 'ยินยอมแล้ว' : 'ยังไม่ยินยอม'}"`,
      `"${s.createdAt ? s.createdAt.split('T')[0] : '-'}"`,
    ]);
    return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }

  generateTimetableCSV(): string {
    const rooms = this.getZoomRooms();
    const headers = ['ห้องเรียน Zoom', 'สถานที่ออนไซต์', 'วัน', 'เวลา', 'คาบ', 'รหัสวิชา', 'ชื่อวิชาภาษาไทย', 'ชื่อวิชาภาษาอังกฤษ', 'ประเภทวิชา', 'หน่วยกิต', 'อาจารย์ผู้สอนหลัก', 'คณะผู้สอนร่วม', 'หลักสูตรเป้าหมาย'];
    const rows: string[][] = [];
    rooms.forEach(room => {
      (room.schedules || []).forEach(sch => {
        rows.push([
          `"${room.name.replace(/"/g, '""')}"`,
          `"${room.onSiteLocation.replace(/"/g, '""')}"`,
          `"${sch.day}"`,
          `"${sch.timeRange}"`,
          `"${sch.period}"`,
          `"${sch.courseCode}"`,
          `"${sch.courseNameTh.replace(/"/g, '""')}"`,
          `"${(sch.courseNameEn || '').replace(/"/g, '""')}"`,
          `"${sch.courseType}"`,
          `"${sch.credits}"`,
          `"${sch.instructor.replace(/"/g, '""')}"`,
          `"${(sch.teachingTeam || []).join('; ').replace(/"/g, '""')}"`,
          `"${(sch.cohortPlan || room.targetProgram).replace(/"/g, '""')}"`,
        ]);
      });
    });
    return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }

  generateReceiptsCSV(): string {
    const receipts = this.getTuitionReceipts();
    const headers = ['เลขที่ใบเสร็จ', 'รหัสนิสิต', 'ชื่อผู้ชำระ/นิสิต', 'หลักสูตร/รุ่น', 'ภาคการศึกษา', 'ปีการศึกษา', 'ยอดชำระ (บาท)', 'วิธีชำระเงิน', 'เลขอ้างอิง', 'วันที่ออกใบเสร็จ'];
    const rows = receipts.map(r => [
      `"${r.receiptNumber}"`,
      `"${r.studentId}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.programCohort}"`,
      `"${r.semester}"`,
      `"${r.academicYear}"`,
      `"${r.totalAmount}"`,
      `"${r.paymentMethod}"`,
      `"${r.referenceNumber}"`,
      `"${r.paymentDate}"`,
    ]);
    return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }

  generatePetitionsCSV(): string {
    const petitions = this.getPetitions();
    const headers = ['รหัสคำร้อง', 'หมวดหมู่', 'หัวข้อคำร้อง', 'รายละเอียด', 'ผู้ยื่น', 'ระดับความเร่งด่วน', 'สถานะคำร้อง', 'วันที่ยื่น'];
    const rows = petitions.map(p => [
      `"${p.ticketNumber}"`,
      `"${p.category}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.detail.replace(/"/g, '""')}"`,
      `"${p.isAnonymous ? 'ไม่เปิดเผยตัวตน (Anonymous)' : (p.studentName || p.studentId || '-').replace(/"/g, '""')}"`,
      `"${p.urgency}"`,
      `"${p.status}"`,
      `"${p.createdAt.split('T')[0]}"`,
    ]);
    return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }
}

export const storageService = new StorageService();
