import { sourceUrl } from "@/lib/sheet-source";
import type { SourceRefData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SourceRefProps {
  source: SourceRefData;
  className?: string;
  compact?: boolean;
}

export function SourceRef({ source, className = "", compact = false }: SourceRefProps) {
  const url = sourceUrl(source.gid, source.row);

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
        <span>
          {compact ? `แถว ${source.row}` : `ที่มา: ${source.tab} แถว ${source.row}`}
        </span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
    </Button>
  );
}
