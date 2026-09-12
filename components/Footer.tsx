import { htmlViewUrl, SPREADSHEET_ID } from "@/lib/sheet-source";
import { ExternalLink } from "lucide-react";

interface FooterProps {
  fetchedAt?: string;
  termLabel: string;
}

export function Footer({ fetchedAt, termLabel }: FooterProps) {
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
    <footer className="mt-auto border-t border-border bg-secondary text-muted-foreground py-8 px-4 sm:px-6 text-xs">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-[15px]">
            ระบบค้นหาตารางสอบ{termLabel}
          </p>
          {formattedTime && (
            <p className="text-xs text-muted-foreground font-num">
              ข้อมูลซิงค์ล่าสุด: {formattedTime}
            </p>
          )}
        </div>

        <div className="space-y-1 text-left sm:text-right">
          <p className="text-muted-foreground">
            ประกาศ: หากตรวจสอบรหัสนักศึกษา/เลขที่นั่งสอบแล้วไม่พบ หรือมีข้อสงสัย
          </p>
          <p>
            ติดต่อเจ้าหน้าที่ได้ที่:{" "}
            <a
              href="mailto:benjch@kku.ac.th"
              className="text-primary font-semibold underline hover:underline"
            >
              benjch@kku.ac.th
            </a>
          </p>
          <p className="pt-1">
            <a
              href={htmlViewUrl(SPREADSHEET_ID)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors font-semibold"
            >
              <span>เปิดดู Google Sheet ต้นฉบับ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
