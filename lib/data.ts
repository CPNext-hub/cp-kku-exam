import { cacheLife, cacheTag } from "next/cache";
import { discoverSheets } from "./discover";
import { parseCsv } from "./csv";
import { parseSheetBlocks } from "./parse";
import { csvUrl } from "./sheet-source";
import snapshotTabs from "./sheet-snapshot.json";
import type {
  CourseGroup,
  ExamBlock,
  ExamDataset,
  ExamSummary,
  RoomSchedule,
  Seat,
  SessionGroup,
  SheetRef,
  StudentSchedule,
} from "./types";

/**
 * Fetch and parse all exam data from Google Sheets with caching.
 * Returns only plain serializable objects (no Map, Set, or class instances).
 */
export async function getExamData(): Promise<ExamDataset> {
  "use cache";
  cacheLife("hours");
  cacheTag("exam-data");

  let usedSnapshot = false;
  let sheets: SheetRef[] = [];

  try {
    sheets = await discoverSheets();
  } catch (err) {
    console.warn("discoverSheets failed, falling back to snapshot:", err);
    sheets = snapshotTabs as SheetRef[];
    usedSnapshot = true;
  }

  // Fetch CSV for all discovered tabs in parallel
  const tabResults = await Promise.all(
    sheets.map(async (sheet) => {
      try {
        const url = csvUrl(sheet.gid);
        const res = await fetch(url, {
          // Cache headers can be default
          next: { revalidate: 3600 },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch CSV for gid ${sheet.gid}: ${res.status}`);
        }
        const text = await res.text();
        const rows = parseCsv(text);
        const blocks = parseSheetBlocks(sheet.gid, sheet.tab, rows);
        return { blocks, error: null };
      } catch (e) {
        console.error(`Error processing gid ${sheet.gid}:`, e);
        return { blocks: [] as ExamBlock[], error: e };
      }
    })
  );

  const blocks: ExamBlock[] = [];
  const seats: Seat[] = [];

  for (const { blocks: tabBlocks } of tabResults) {
    for (const block of tabBlocks) {
      blocks.push(block);
      for (const seat of block.seats) {
        seats.push(seat);
      }
    }
  }

  return {
    blocks,
    seats,
    sheets,
    usedSnapshot,
    fetchedAt: new Date().toISOString(),
  };
}

export interface ExamIndexes {
  byStudent: Map<string, StudentSchedule>;
  byCourse: Map<string, CourseGroup>;
  byRoom: Map<string, RoomSchedule>;
  bySession: Map<string, SessionGroup>;
  byMajor: Map<string, { major: string; count: number; studentIds: Set<string> }>;
  summary: ExamSummary;
}

/**
 * Builds in-memory index maps from the cached ExamDataset.
 * Re-creating this per request takes < 2ms for ~5,000 rows.
 */
export function buildIndexes(dataset: ExamDataset): ExamIndexes {
  const byStudent = new Map<string, StudentSchedule>();
  const byCourse = new Map<string, CourseGroup>();
  const byRoom = new Map<string, RoomSchedule>();
  const bySession = new Map<string, SessionGroup>();
  const byMajor = new Map<string, { major: string; count: number; studentIds: Set<string> }>();

  const uniqueRooms = new Set<string>();
  const uniqueStudents = new Set<string>();
  const uniqueCourses = new Set<string>();

  // Initialize session map from sheet list to preserve order
  for (const s of dataset.sheets) {
    bySession.set(s.gid, {
      gid: s.gid,
      tab: s.tab,
      sortKey: "",
      blocks: [],
      totalSeats: 0,
    });
  }

  for (const block of dataset.blocks) {
    // Unique course
    if (block.courseCode) uniqueCourses.add(block.courseCode);

    // Unique room
    if (block.room) uniqueRooms.add(block.room);

    // Course index (index both by slug and code)
    const courseKey = block.courseSlug || block.courseCode;
    let courseGroup = byCourse.get(courseKey);
    if (!courseGroup) {
      courseGroup = {
        code: block.courseCode,
        name: block.courseName,
        slug: block.courseSlug,
        blocks: [],
        totalSeats: 0,
      };
      byCourse.set(courseKey, courseGroup);
      if (block.courseCode !== courseKey) {
        byCourse.set(block.courseCode, courseGroup);
      }
    }
    courseGroup.blocks.push(block);
    courseGroup.totalSeats += block.seats.length;

    // Room index
    let roomSched = byRoom.get(block.room);
    if (!roomSched) {
      roomSched = {
        room: block.room,
        isCancelled: block.status === "cancelled",
        blocks: [],
        totalSeats: 0,
      };
      byRoom.set(block.room, roomSched);
    }
    roomSched.blocks.push(block);
    roomSched.totalSeats += block.seats.length;

    // Session index
    let sessionGroup = bySession.get(block.gid);
    if (!sessionGroup) {
      sessionGroup = {
        gid: block.gid,
        tab: block.tabName,
        sortKey: block.sortKey,
        blocks: [],
        totalSeats: 0,
      };
      bySession.set(block.gid, sessionGroup);
    }
    sessionGroup.blocks.push(block);
    sessionGroup.totalSeats += block.seats.length;
    if (!sessionGroup.sortKey || block.sortKey < sessionGroup.sortKey) {
      sessionGroup.sortKey = block.sortKey;
    }

    // Seats & Student index
    for (const seat of block.seats) {
      uniqueStudents.add(seat.studentId);

      let student = byStudent.get(seat.studentId);
      if (!student) {
        student = {
          studentId: seat.studentId,
          name: seat.name,
          major: seat.major,
          exams: [],
        };
        byStudent.set(seat.studentId, student);
      } else {
        if (!student.name && seat.name) student.name = seat.name;
        if (!student.major && seat.major) student.major = seat.major;
      }

      student.exams.push({ seat, block });

      // Major index
      if (seat.major) {
        let m = byMajor.get(seat.major);
        if (!m) {
          m = { major: seat.major, count: 0, studentIds: new Set() };
          byMajor.set(seat.major, m);
        }
        m.count++;
        m.studentIds.add(seat.studentId);
      }
    }
  }

  // Sort student exams by block sortKey
  for (const student of byStudent.values()) {
    student.exams.sort((a, b) => a.block.sortKey.localeCompare(b.block.sortKey));
  }

  // Sort course blocks by sortKey
  for (const cg of byCourse.values()) {
    cg.blocks.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  // Sort room blocks by sortKey
  for (const rg of byRoom.values()) {
    rg.blocks.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  const allBlocksHaveSec = dataset.blocks.every((b) => Boolean(b.sec && b.sec.trim()));

  const summary: ExamSummary = {
    totalBlocks: dataset.blocks.length,
    totalSeats: dataset.seats.length,
    uniqueStudents: uniqueStudents.size,
    uniqueCourses: uniqueCourses.size,
    uniqueRooms: uniqueRooms.size,
    allBlocksHaveSec,
  };

  return {
    byStudent,
    byCourse,
    byRoom,
    bySession,
    byMajor,
    summary,
  };
}

export interface SearchResults {
  query: string;
  students: {
    studentId: string;
    name: string;
    major: string;
    examCount: number;
  }[];
  courses: CourseGroup[];
  rooms: RoomSchedule[];
  majors: { major: string; studentCount: number; seatCount: number }[];
  privacyNotice?: string;
}

export function searchExam(rawQuery: string, indexes: ExamIndexes): SearchResults {
  const q = rawQuery.trim();
  const qLower = q.toLowerCase();

  const results: SearchResults = {
    query: q,
    students: [],
    courses: [],
    rooms: [],
    majors: [],
  };

  if (!q) return results;

  // 1. Student search (Strict Privacy Rule: at least 8 digits if searching by student ID)
  const digitsOnly = q.replace(/[^\d]/g, "");
  const hasDigits = digitsOnly.length > 0;

  if (hasDigits) {
    if (digitsOnly.length >= 8) {
      for (const [studentId, student] of indexes.byStudent.entries()) {
        const cleanId = studentId.replace(/[^\d]/g, "");
        if (cleanId.includes(digitsOnly)) {
          results.students.push({
            studentId,
            name: student.name,
            major: student.major,
            examCount: student.exams.length,
          });
        }
      }
    } else if (hasDigits && /^\d+$/.test(q.replace(/-/g, ""))) {
      results.privacyNotice = "กรุณาระบุรหัสนักศึกษาอย่างน้อย 8 หลักเพื่อความปลอดภัยของข้อมูล";
    }
  }

  // Search by student name if present
  if (q.length >= 2 && !results.privacyNotice) {
    for (const [studentId, student] of indexes.byStudent.entries()) {
      if (student.name && student.name.toLowerCase().includes(qLower)) {
        if (!results.students.some((s) => s.studentId === studentId)) {
          results.students.push({
            studentId,
            name: student.name,
            major: student.major,
            examCount: student.exams.length,
          });
        }
      }
    }
  }

  // 2. Course search (distinct by course slug)
  const seenCourseSlugs = new Set<string>();
  for (const cg of indexes.byCourse.values()) {
    if (seenCourseSlugs.has(cg.slug)) continue;
    if (
      cg.code.toLowerCase().includes(qLower) ||
      cg.name.toLowerCase().includes(qLower) ||
      cg.slug.toLowerCase().includes(qLower)
    ) {
      seenCourseSlugs.add(cg.slug);
      results.courses.push(cg);
    }
  }

  // 3. Room search
  for (const rg of indexes.byRoom.values()) {
    if (rg.room.toLowerCase().includes(qLower)) {
      results.rooms.push(rg);
    }
  }

  // 4. Major search
  for (const [majorName, mData] of indexes.byMajor.entries()) {
    if (majorName.toLowerCase().includes(qLower)) {
      results.majors.push({
        major: majorName,
        studentCount: mData.studentIds.size,
        seatCount: mData.count,
      });
    }
  }

  return results;
}
