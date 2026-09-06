export type CohortId =
  | 'PHD_TIPITAKA_1'
  | 'PHD_TIPITAKA_2'
  | 'MA_TIPITAKA_1'
  | 'MA_TIPITAKA_2'
  | 'MA_ABHIDHAMMA_1'
  | 'MA_ABHIDHAMMA_2';

export interface CohortInfo {
  id: CohortId;
  degree: 'พุทธศาสตรดุษฎีบัณฑิต' | 'พุทธศาสตรมหาบัณฑิต';
  major: 'สาขาวิชาพระไตรปิฎกศึกษา' | 'สาขาวิชาพระอภิธรรมปิฎก';
  batch: 1 | 2;
  title: string;
  shortTitle: string;
  badgeColor: string;
}

export const COHORTS: Record<CohortId, CohortInfo> = {
  PHD_TIPITAKA_1: {
    id: 'PHD_TIPITAKA_1',
    degree: 'พุทธศาสตรดุษฎีบัณฑิต',
    major: 'สาขาวิชาพระไตรปิฎกศึกษา',
    batch: 1,
    title: 'พุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระไตรปิฎกศึกษา รุ่นที่ 1',
    shortTitle: 'พธ.ด. พระไตรปิฎกศึกษา รุ่น 1',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  PHD_TIPITAKA_2: {
    id: 'PHD_TIPITAKA_2',
    degree: 'พุทธศาสตรดุษฎีบัณฑิต',
    major: 'สาขาวิชาพระไตรปิฎกศึกษา',
    batch: 2,
    title: 'พุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระไตรปิฎกศึกษา รุ่นที่ 2',
    shortTitle: 'พธ.ด. พระไตรปิฎกศึกษา รุ่น 2',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  MA_TIPITAKA_1: {
    id: 'MA_TIPITAKA_1',
    degree: 'พุทธศาสตรมหาบัณฑิต',
    major: 'สาขาวิชาพระไตรปิฎกศึกษา',
    batch: 1,
    title: 'พุทธศาสตรมหาบัณฑิต สาขาวิชาพระไตรปิฎกศึกษา รุ่นที่ 1',
    shortTitle: 'พธ.ม. พระไตรปิฎกศึกษา รุ่น 1',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300',
  },
  MA_TIPITAKA_2: {
    id: 'MA_TIPITAKA_2',
    degree: 'พุทธศาสตรมหาบัณฑิต',
    major: 'สาขาวิชาพระไตรปิฎกศึกษา',
    batch: 2,
    title: 'พุทธศาสตรมหาบัณฑิต สาขาวิชาพระไตรปิฎกศึกษา รุ่นที่ 2',
    shortTitle: 'พธ.ม. พระไตรปิฎกศึกษา รุ่น 2',
    badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
  },
  MA_ABHIDHAMMA_1: {
    id: 'MA_ABHIDHAMMA_1',
    degree: 'พุทธศาสตรมหาบัณฑิต',
    major: 'สาขาวิชาพระอภิธรรมปิฎก',
    batch: 1,
    title: 'พุทธศาสตรมหาบัณฑิต สาขาวิชาพระอภิธรรมปิฎก รุ่นที่ 1',
    shortTitle: 'พธ.ม. พระอภิธรรมปิฎก รุ่น 1',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  MA_ABHIDHAMMA_2: {
    id: 'MA_ABHIDHAMMA_2',
    degree: 'พุทธศาสตรมหาบัณฑิต',
    major: 'สาขาวิชาพระอภิธรรมปิฎก',
    batch: 2,
    title: 'พุทธศาสตรมหาบัณฑิต สาขาวิชาพระอภิธรรมปิฎก รุ่นที่ 2',
    shortTitle: 'พธ.ม. พระอภิธรรมปิฎก รุ่น 2',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export interface Student {
  id: string; // Unique internal ID
  studentId: string; // Official Student ID (รหัสนิสิต)
  fullName: string; // Title/Rank + Pali name + Secular name
  email: string;
  programCohort: CohortId;
  pdpaConsented: boolean;
  pdpaConsentDate: string;
  faceDescriptor: number[] | null; // 128-dimensional Float vector (NO IMAGE STORED)
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
export type AttendanceMethod = 'FACE_SCAN' | 'MANUAL';

export interface AttendanceRecord {
  id: string;
  studentInternalId: string;
  studentId: string;
  studentName: string;
  programCohort: CohortId;
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: AttendanceStatus;
  method: AttendanceMethod;
  differenceScore: number | null; // Threshold difference on scan
  distanceScore: number | null; // Raw Euclidean distance
  confidence: number | null; // Confidence percentage (0-100%)
  note?: string;
}

export interface FaceScanResult {
  success: boolean;
  matchedStudent: Student | null;
  distance: number;
  threshold: number;
  differenceScore: number; // distance - threshold (negative or positive)
  confidence: number; // 0 - 100%
  message: string;
  detectionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type PetitionCategory =
  | 'ACADEMIC'
  | 'FACILITIES'
  | 'FINANCE'
  | 'IT_SYSTEM'
  | 'GENERAL';

export type PetitionStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type UrgencyLevel = 'NORMAL' | 'URGENT' | 'HIGH_PRIORITY';

export interface Petition {
  id: string;
  ticketNumber: string; // e.g. PET-2569-001
  category: PetitionCategory;
  title: string;
  detail: string;
  isAnonymous: boolean;
  studentId?: string;
  studentName?: string;
  contactEmail?: string;
  contactPhone?: string;
  urgency: UrgencyLevel;
  status: PetitionStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionItem {
  name: string;
  amount: number;
}

export interface TuitionReceipt {
  id: string;
  receiptNumber: string; // e.g. REC-2569/0042
  studentId: string;
  studentName: string;
  programCohort: CohortId;
  semester: string; // e.g. 1/2569
  academicYear: string; // 2569
  paymentDate: string;
  paymentMethod: 'PROMPTPAY_QR' | 'BANK_TRANSFER' | 'CASH';
  items: TuitionItem[];
  totalAmount: number;
  payerName: string;
  referenceNumber: string;
  officerName: string;
  issuedAt: string;
}

export interface ZoomRoom {
  roomNumber: 1 | 2 | 3 | 4;
  name: string;
  targetProgram: string;
  onSiteLocation: string;
  zoomAccount: string;
  zoomPassword: string;
  zoomUrl: string;
  meetingId: string;
  isLive: boolean;
  activeTopic?: string;
}

export interface BackupData {
  system: string;
  version: string;
  exportedAt: string;
  metadata: {
    totalStudents: number;
    totalAttendanceRecords: number;
    totalPetitions?: number;
    totalReceipts?: number;
  };
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  petitions?: Petition[];
  receipts?: TuitionReceipt[];
}

