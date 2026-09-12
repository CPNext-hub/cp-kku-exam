import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { SPREADSHEET_ID, htmlViewUrl } from "@/lib/sheet-source";
import { getExamData, getExamTermLabel } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  termLabel?: string;
}

export async function Navbar({ termLabel }: NavbarProps = {}) {
  const resolvedTermLabel = termLabel ?? getExamTermLabel(await getExamData());

  return (
    <header className="sticky top-0 z-30 border-b border-nav-border bg-nav">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="min-w-0 flex-1 flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
          aria-label="หน้าแรก ระบบค้นหาตารางสอบ CP KKU"
        >
          {/* CI: พื้นแถบเป็น CP Black (>=50% black) จึงต้องใช้โลโก้สีเดียวสีขาว
              clear area = 1/4 ของความสูงโลโก้ (36px / 4 = 9px) */}
          <div className="hidden sm:flex shrink-0 items-center py-[9px] pr-[9px]">
            <Image
              src="/cp-logo-white.png"
              alt="วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น"
              width={123}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>

          <div className="min-w-0 flex flex-col border-l border-nav-border pl-2 sm:pl-3">
            <span className="text-sm sm:text-[15px] font-semibold tracking-normal leading-tight text-nav-foreground whitespace-nowrap">
              ระบบค้นหาตารางสอบ
            </span>
            <span className="block truncate text-xs text-nav-muted">{resolvedTermLabel}</span>
          </div>
        </Link>

        <nav className="shrink-0 flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="text-[15px] font-semibold px-3 py-1.5 rounded-full text-nav-foreground hover:bg-nav-hover transition-colors"
          >
            ค้นหา
          </Link>
          <a
            href={htmlViewUrl(SPREADSHEET_ID)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[15px] font-semibold px-3 py-1.5 rounded-full text-nav-foreground hover:bg-nav-hover transition-colors"
          >
            <span>Sheet ต้นฉบับ</span>
            <ExternalLink className="w-4 h-4 text-nav-muted" />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
