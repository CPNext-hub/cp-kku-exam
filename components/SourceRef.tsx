import { sourceUrl } from "@/lib/sheet-source";
import type { SourceRefData } from "@/lib/types";

interface SourceRefProps {
  source: SourceRefData;
  className?: string;
  compact?: boolean;
}

export function SourceRef({ source, className = "", compact = false }: SourceRefProps) {
  const url = sourceUrl(source.gid, source.row);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`เปิดแถวที่ ${source.row} ใน Google Sheet (${source.tab})`}
      className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-md transition-colors px-2 py-0.5 ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      <span>
        {compact ? `แถว ${source.row}` : `${source.tab} · แถว ${source.row}`}
      </span>
      <svg
        className="w-3 h-3 shrink-0 opacity-70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
