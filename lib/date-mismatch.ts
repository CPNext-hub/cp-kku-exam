const THAI_MONTHS: Record<string, number> = {
  "ม.ค.": 1,
  "ม.ค": 1,
  "มกราคม": 1,
  "ก.พ.": 2,
  "ก.พ": 2,
  "กุมภาพันธ์": 2,
  "มี.ค.": 3,
  "มี.ค": 3,
  "มีนาคม": 3,
  "เม.ย.": 4,
  "เม.ย": 4,
  "เมษายน": 4,
  "พ.ค.": 5,
  "พ.ค": 5,
  "พฤษภาคม": 5,
  "มิ.ย.": 6,
  "มิ.ย": 6,
  "มิถุนายน": 6,
  "ก.ค.": 7,
  "ก.ค": 7,
  "กรกฎาคม": 7,
  "ส.ค.": 8,
  "ส.ค": 8,
  "สิงหาคม": 8,
  "ก.ย.": 9,
  "ก.ย": 9,
  "กันยายน": 9,
  "ต.ค.": 10,
  "ต.ค": 10,
  "ตุลาคม": 10,
  "พ.ย.": 11,
  "พ.ย": 11,
  "พฤศจิกายน": 11,
  "ธ.ค.": 12,
  "ธ.ค": 12,
  "ธันวาคม": 12,
};

export interface ParsedThaiDate {
  day: number;
  month: number;
  year: number;
}

/**
 * Extracts day, month, and normalized 2-digit BE year from Thai date strings.
 * e.g. "24 ส.ค. 69 (เช้า)" -> { day: 24, month: 8, year: 69 }
 * e.g. "25-ส.ค.-68" -> { day: 25, month: 8, year: 68 }
 */
export function parseThaiDate(str: string): ParsedThaiDate | null {
  if (!str) return null;
  const match = str.match(/(\d{1,2})[-.\s]+([ก-๙.]+)[-.\s]+(\d{2,4})/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const mKey = match[2].trim();
  const month =
    THAI_MONTHS[mKey] ||
    THAI_MONTHS[mKey.endsWith(".") ? mKey : `${mKey}.`] ||
    0;

  if (!month) return null;

  let y = parseInt(match[3], 10);
  if (y > 2400) {
    y = y - 2500;
  } else if (y > 2000) {
    // CE year -> BE year -> 2-digit BE
    y = y + 543 - 2500;
  }

  return { day, month, year: y };
}

/**
 * Checks whether the date written in the block row differs from the date in the session tab name.
 */
export function hasDateMismatch(dateStr: string, tabName: string): boolean {
  if (!dateStr || !tabName) return false;
  const d1 = parseThaiDate(dateStr);
  const d2 = parseThaiDate(tabName);
  if (!d1 || !d2) return false;
  return d1.day !== d2.day || d1.month !== d2.month || d1.year !== d2.year;
}
