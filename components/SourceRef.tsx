import { sourceUrl } from "@/lib/sheet-source";
import type { SourceRefData } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface SourceRefProps {
  source: SourceRefData;
  className?: string;
  compact?: boolean;
}

export function SourceRef({ source, className = "", compact = false }: SourceRefProps) {
  const url = sourceUrl(source.gid, source.row);

  const icon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </svg>
  );

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`เปิด Google Sheet แท็บ "${source.tab}" แถวที่ ${source.row}`}
        className={`text-xs text-muted-foreground hover:text-primary transition-colors font-num inline-flex items-center gap-1 ${className}`}
      >
        <span>แถว {source.row}</span>
        {icon}
      </a>
    );
  }

  return (
    <Button
      variant="link"
      size="sm"
      asChild
      className={`h-auto p-0 text-xs text-muted-foreground hover:text-primary transition-colors font-num inline-flex items-center gap-1 ${className}`}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`เปิด Google Sheet แท็บ "${source.tab}" แถวที่ ${source.row}`}
      >
        <span>ที่มา: {source.tab} แถว {source.row}</span>
        {icon}
      </a>
    </Button>
  );
}
