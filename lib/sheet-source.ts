export const SPREADSHEET_ID =
  process.env.EXAM_SHEET_ID ?? "1QKxbCrHSy2NyUbMuJPw5UT36nouo8DKw";

export const base = (id = SPREADSHEET_ID) =>
  `https://docs.google.com/spreadsheets/d/${id}`;

export const htmlViewUrl = (id = SPREADSHEET_ID) => `${base(id)}/htmlview`;

export const csvUrl = (gid: string, id = SPREADSHEET_ID) =>
  `${base(id)}/export?format=csv&gid=${gid}`;

// ลิงก์ ref กลับไปยังแถวจริงใน Sheet — gid อยู่ใน fragment ตามรูปแบบที่ Sheets เองใช้
export const sourceUrl = (gid: string, row: number, id = SPREADSHEET_ID) =>
  `${base(id)}/edit#gid=${gid}&range=A${row}`;

// Fallback link สำหรับเปิดแค่แท็บ (หาก range มีปัญหา)
export const sourceTabUrl = (gid: string, id = SPREADSHEET_ID) =>
  `${base(id)}/edit#gid=${gid}`;
