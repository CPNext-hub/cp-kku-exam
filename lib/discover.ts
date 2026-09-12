import { cacheLife, cacheTag } from "next/cache";
import { htmlViewUrl } from "./sheet-source";
import type { SheetRef } from "./types";

export class SheetDiscoveryError extends Error {
  constructor(message = "Failed to discover sheet tabs from Google Sheets") {
    super(message);
    this.name = "SheetDiscoveryError";
  }
}

const RE = /items\.push\(\{name:\s*"((?:[^"\\]|\\.)*)"[^}]*?gid:\s*"(\d+)"/g;

export async function discoverSheets(): Promise<SheetRef[]> {
  "use cache";
  cacheLife("days");
  cacheTag("exam-sheets");

  const res = await fetch(htmlViewUrl(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    throw new SheetDiscoveryError(`Fetch failed with HTTP status ${res.status}`);
  }

  const html = await res.text();
  const found = [...html.matchAll(RE)].map(([, name, gid]) => ({
    gid,
    tab: JSON.parse(`"${name}"`) as string,
  }));

  if (found.length === 0) {
    throw new SheetDiscoveryError("No tabs matched the regular expression in HTML");
  }

  return found;
}
