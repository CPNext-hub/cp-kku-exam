export interface CsvRow {
  row: number;
  cells: string[];
}

/**
 * Lightweight RFC4180-compliant CSV parser.
 * Preserves empty rows to maintain 1:1 row alignment with Google Sheet line numbers.
 */
export function parseCsv(text: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuote = false;
  let rowNumber = 1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (insideQuote) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          insideQuote = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\r") {
        if (i + 1 < text.length && text[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentField);
        rows.push({ row: rowNumber++, cells: currentRow });
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField);
        rows.push({ row: rowNumber++, cells: currentRow });
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Handle trailing content if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push({ row: rowNumber++, cells: currentRow });
  }

  return rows;
}
