interface SnapshotBannerProps {
  usedSnapshot: boolean;
}

export function SnapshotBanner({ usedSnapshot }: SnapshotBannerProps) {
  if (!usedSnapshot) return null;

  return (
    <div
      role="alert"
      className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
    >
      <svg
        className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>
        <strong>คำเตือน:</strong> ไม่สามารถดึงรายชื่อแท็บล่าสุดจาก Google Sheets ได้ จึงกำลังใช้รายชื่อแท็บสำรอง (Snapshot) ของระบบ
      </span>
    </div>
  );
}
