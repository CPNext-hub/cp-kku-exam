import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SPREADSHEET_ID, htmlViewUrl } from "@/lib/sheet-source";
import { getAcademicYear, getExamData } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  academicYear?: number;
}

export async function Navbar({ academicYear }: NavbarProps = {}) {
  const resolvedAcademicYear = academicYear ?? getAcademicYear(await getExamData());

  return (
    <header className="sticky top-0 z-30 border-b border-nav-border bg-nav">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="หน้าแรก ระบบค้นหาตารางสอบ CP KKU"
        >
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold tracking-normal leading-tight text-nav-foreground">
              ระบบค้นหาตารางสอบ
            </span>
            <span className="text-xs text-nav-muted">กลางภาค 1/{resolvedAcademicYear}</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
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
