interface StatusBadgeProps {
  status: "normal" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  if (status === "cancelled") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-900 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        ยกเลิกการสอบ
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      จัดสอบปกติ
    </span>
  );
}

export function SecBadge({ sec }: { sec: string }) {
  if (!sec) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
      {sec}
    </span>
  );
}

export function MajorBadge({ major }: { major: string }) {
  if (!major) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
      {major}
    </span>
  );
}
