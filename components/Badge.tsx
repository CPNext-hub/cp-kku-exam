import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "normal" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  if (status === "cancelled") {
    return (
      <Badge
        variant="destructive"
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      >
        ยกเลิกการสอบ
      </Badge>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-normal text-muted-foreground border border-transparent ${className}`}
    >
      จัดสอบปกติ
    </span>
  );
}

export function SecBadge({ sec, className = "" }: { sec: string; className?: string }) {
  if (!sec) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-num text-foreground ${className}`}
    >
      {sec}
    </span>
  );
}

export function MajorBadge({ major, className = "" }: { major: string; className?: string }) {
  if (!major) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-num text-foreground border border-transparent ${className}`}
    >
      {major}
    </span>
  );
}
