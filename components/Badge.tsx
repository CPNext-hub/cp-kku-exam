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
    <Badge
      variant="secondary"
      className={`rounded-full px-2.5 py-0.5 text-xs font-normal text-muted-foreground ${className}`}
    >
      จัดสอบปกติ
    </Badge>
  );
}

export function SecBadge({ sec, className = "" }: { sec: string; className?: string }) {
  if (!sec) return null;
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2 py-0.5 text-xs font-num font-medium text-foreground ${className}`}
    >
      {sec}
    </Badge>
  );
}

export function MajorBadge({ major, className = "" }: { major: string; className?: string }) {
  if (!major) return null;
  return (
    <Badge
      variant="secondary"
      className={`rounded-full px-2 py-0.5 text-xs font-num font-medium text-foreground ${className}`}
    >
      {major}
    </Badge>
  );
}
