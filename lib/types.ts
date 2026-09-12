export interface SheetRef {
  gid: string;
  tab: string;
}

export interface SheetSnapshot {
  spreadsheetId: string;
  capturedAt: string;
  tabs: SheetRef[];
}

export interface SourceRefData {
  gid: string;
  tab: string;
  row: number;
}

export interface Seat {
  no: number;
  studentId: string;
  name: string;
  major: string;
  seat: string;
  row: number;
  blockId: string;
  source: SourceRefData;
}

export interface ExamBlock {
  id: string; // `${gid}:${headerRow}`
  gid: string;
  tabName: string;
  headerRow: number;
  courseRaw: string;
  courseCode: string;
  courseName: string;
  courseSlug: string;
  sec: string;
  room: string;
  program: string;
  date: string;
  time: string;
  status: "normal" | "cancelled";
  note?: string;
  sortKey: string;
  source: SourceRefData;
  seats: Seat[];
}

export interface ExamDataset {
  blocks: ExamBlock[];
  seats: Seat[];
  sheets: SheetRef[];
  usedSnapshot: boolean;
  fetchedAt: string;
}

export interface StudentSchedule {
  studentId: string;
  name: string;
  major: string;
  exams: {
    seat: Seat;
    block: ExamBlock;
  }[];
}

export interface CourseGroup {
  code: string;
  name: string;
  slug: string;
  blocks: ExamBlock[];
  totalSeats: number;
}

export interface RoomSchedule {
  room: string;
  isCancelled: boolean;
  blocks: ExamBlock[];
  totalSeats: number;
}

export interface SessionGroup {
  gid: string;
  tab: string;
  sortKey: string;
  blocks: ExamBlock[];
  totalSeats: number;
}

export interface ExamSummary {
  totalBlocks: number;
  totalSeats: number;
  uniqueStudents: number;
  uniqueCourses: number;
  uniqueRooms: number;
  allBlocksHaveSec: boolean;
}
