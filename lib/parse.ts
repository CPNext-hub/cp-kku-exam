import type { CsvRow } from "./csv";
import type { ExamBlock, Seat } from "./types";

const THAI_MONTH_MAP: Record<string, number> = {
  "ม.ค.": 1,
  "ก.พ.": 2,
  "มี.ค.": 3,
  "เม.ย.": 4,
  "พ.ค.": 5,
  "มิ.ย.": 6,
  "ก.ค.": 7,
  "ส.ค.": 8,
  "ก.ย.": 9,
  "ต.ค.": 10,
  "พ.ย.": 11,
  "ธ.ค.": 12,
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseThaiDate(text: string): { day: number; month: number; year: number } | null {
  const dateMatch = text.match(/(\d{1,2})[-.\s]+([ก-๙.]+)[-.\s]*(\d{2,4})/);
  if (!dateMatch) return null;

  const mKey = dateMatch[2].endsWith(".") ? dateMatch[2] : `${dateMatch[2]}.`;
  const month = THAI_MONTH_MAP[mKey] || THAI_MONTH_MAP[dateMatch[2]];
  if (!month) return null;

  let year = parseInt(dateMatch[3], 10);
  if (year < 100) year += 2500;
  if (year > 2400) year -= 543;

  return { day: parseInt(dateMatch[1], 10), month, year };
}

function inferFallbackYear(blocks: ExamBlock[], tabName: string): number {
  const counts = new Map<number, number>();
  const candidates = [
    ...blocks.map((block) => parseThaiDate(block.date)?.year ?? null),
    parseThaiDate(tabName)?.year ?? null,
  ];

  for (const year of candidates) {
    if (year !== null) counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  let fallbackYear = new Date().getFullYear();
  let highestCount = 0;
  for (const [year, count] of counts) {
    if (count > highestCount) {
      fallbackYear = year;
      highestCount = count;
    }
  }
  return fallbackYear;
}

export function parseDateTimeSortKey(
  dateStr: string,
  timeStr: string,
  tabName: string,
  fallbackYear = new Date().getFullYear()
): string {
  let day = 1;
  let month = 8;
  let year = fallbackYear;

  const parsedDate = parseThaiDate(dateStr) ?? parseThaiDate(tabName);
  if (parsedDate) {
    day = parsedDate.day;
    month = parsedDate.month;
    year = parsedDate.year;
  }

  let hour = 8;
  let minute = 30;
  const timeMatch = (timeStr || "").match(/(\d{1,2})[.:](\d{2})/);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
  } else if ((dateStr + " " + timeStr + " " + tabName).includes("บ่าย")) {
    hour = 13;
    minute = 0;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function parseSheetBlocks(
  gid: string,
  tabName: string,
  rows: CsvRow[]
): ExamBlock[] {
  const blocks: ExamBlock[] = [];
  let currentBlock: ExamBlock | null = null;

  for (const { row, cells } of rows) {
    // Strip leading tabs and trim whitespace from all cells
    const clean = cells.map((c) => (c ?? "").replace(/^\t+/, "").trim());
    const colA = clean[0] || "";
    const colB = clean[1] || "";

    if (colA === "ใบรายชื่อผู้เข้าสอบ") {
      if (currentBlock) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        id: `${gid}:${row}`,
        gid,
        tabName,
        headerRow: row,
        courseRaw: "",
        courseCode: "",
        courseName: "",
        courseSlug: "",
        sec: "",
        room: "",
        program: "",
        date: "",
        time: "",
        status: "normal",
        note: "",
        sortKey: "",
        source: {
          gid,
          tab: tabName,
          row,
        },
        seats: [],
      };
      continue;
    }

    if (!currentBlock) continue;

    if (colA === "รายวิชา") {
      currentBlock.courseRaw = colB;
      // Accept both the canonical code (SC101009) and codes spaced for display
      // in the source sheet (SC 101 009), while preserving the raw course name.
      const courseMatch = colB.match(/^\s*([A-Z]{2}(?:\s*\d){6})\s*:?\s*(.*)$/);
      if (courseMatch) {
        const normalizedCode = courseMatch[1].replace(/\s+/g, "");
        currentBlock.courseCode = normalizedCode;
        currentBlock.courseName = courseMatch[2].trim() || normalizedCode;
        currentBlock.courseSlug = normalizedCode;
      } else {
        currentBlock.courseCode = colB;
        currentBlock.courseName = colB;
        currentBlock.courseSlug = slugify(colB) || colB.toLowerCase();
      }

      // Check SEC in col F (index 5) or scan C-G
      let secVal = clean[5] || "";
      if (!secVal) {
        for (let i = 2; i <= 6; i++) {
          if (clean[i] && /SEC\.?\s*\d+/i.test(clean[i])) {
            secVal = clean[i];
            break;
          }
        }
      }
      currentBlock.sec = secVal;
      continue;
    }

    if (colA === "ห้องสอบ") {
      if (colB === "ยกเลิกการสอบ") {
        currentBlock.status = "cancelled";
        currentBlock.room = "—";
      } else {
        currentBlock.room = colB;
      }
      currentBlock.program = clean[3] || "";
      continue;
    }

    if (colA === "วันที่สอบ") {
      currentBlock.date = colB;
      if (clean[3]) {
        currentBlock.note = clean[3]; // e.g. "กักตัวสอบ"
      }
      continue;
    }

    if (colA === "เวลาสอบ") {
      currentBlock.time = colB;
      continue;
    }

    if (colA === "ลำดับที่") {
      continue;
    }

    // Check student seat row: column B matches /^\d{9}-\d$/
    if (/^\d{9}-\d$/.test(colB)) {
      const seatNo = parseInt(colA, 10) || currentBlock.seats.length + 1;
      const seat: Seat = {
        no: seatNo,
        studentId: colB,
        name: clean[2] || "",
        major: clean[3] || "",
        seat: clean[4] || "",
        row,
        blockId: currentBlock.id,
        source: {
          gid,
          tab: tabName,
          row,
        },
      };
      currentBlock.seats.push(seat);
      continue;
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Fallback for missing date/time (e.g. cancelled blocks)
  const fallbackYear = inferFallbackYear(blocks, tabName);
  for (const b of blocks) {
    if (!b.date || !b.time) {
      b.date = b.date || tabName;
      if (!b.time) {
        if (tabName.includes("เช้า") || tabName.includes("ช.")) {
          b.time = "08.30-11.30 น.";
        } else if (tabName.includes("บ่าย")) {
          b.time = "13.00-16.00 น.";
        } else {
          b.time = tabName;
        }
      }
    }
    b.sortKey = parseDateTimeSortKey(b.date, b.time, tabName, fallbackYear);
  }

  return blocks;
}
