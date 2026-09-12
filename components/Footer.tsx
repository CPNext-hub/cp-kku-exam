import { htmlViewUrl, SPREADSHEET_ID } from "@/lib/sheet-source";

interface FooterProps {
  fetchedAt?: string;
}

export function Footer({ fetchedAt }: FooterProps) {
  let formattedTime = "";
  if (fetchedAt) {
    try {
      const d = new Date(fetchedAt);
      formattedTime = d.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      formattedTime = fetchedAt;
    }
  }

  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 py-8 px-4 sm:px-6 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            ระบบค้นหาตารางสอบกลางภาค ภาคการศึกษา 1/2569
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น (CP KKU)
          </p>
          {formattedTime && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              ข้อมูลซิงค์ล่าสุด: {formattedTime}
            </p>
          )}
        </div>

        <div className="space-y-1 text-left sm:text-right">
          <p>
            ประกาศ: หากตรวจสอบรหัสนักศึกษา/เลขที่นั่งสอบแล้วไม่พบ หรือมีข้อสงสัย
          </p>
          <p>
            ติดต่อเจ้าหน้าที่ได้ที่:{" "}
            <a
              href="mailto:benjch@kku.ac.th"
              className="text-red-600 dark:text-red-400 font-medium underline hover:text-red-700 dark:hover:text-red-300"
            >
              benjch@kku.ac.th
            </a>
          </p>
          <p className="pt-1">
            <a
              href={htmlViewUrl(SPREADSHEET_ID)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 underline font-medium"
            >
              <span>เปิดดู Google Sheet ต้นฉบับ</span>
              <svg
                className="w-3 h-3"
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
          </p>
        </div>
      </div>
    </footer>
  );
}
