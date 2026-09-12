import { htmlViewUrl, SPREADSHEET_ID } from "../lib/sheet-source";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const RE = /items\.push\(\{name:\s*"((?:[^"\\]|\\.)*)"[^}]*?gid:\s*"(\d+)"/g;

async function syncSheets() {
  const url = htmlViewUrl();
  console.log(`Fetching tabs from ${url}...`);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheets HTML: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const found = [...html.matchAll(RE)].map(([, name, gid]) => ({
    gid,
    tab: JSON.parse(`"${name}"`) as string,
  }));

  if (found.length === 0) {
    throw new Error("No sheet tabs discovered from HTML!");
  }

  console.log(`Discovered ${found.length} tabs:`);
  for (const s of found) {
    console.log(`  - gid: ${s.gid} | tab: ${s.tab}`);
  }

  const outPath = resolve(process.cwd(), "lib/sheet-snapshot.json");
  const snapshot = {
    spreadsheetId: SPREADSHEET_ID,
    capturedAt: new Date().toISOString().slice(0, 10),
    tabs: found,
  };
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf-8");
  console.log(`Saved snapshot to ${outPath}`);
}

syncSheets().catch((err) => {
  console.error("Error syncing sheets:", err);
  process.exit(1);
});
