import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-sm shadow-red-600/30">
            CP
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-semibold tracking-tight leading-tight">
              ระบบค้นหาตารางสอบ KKU
            </span>
            <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
              กลางภาค ภาคการศึกษา 1/2569
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ค้นหา
          </Link>
          <a
            href="https://docs.google.com/spreadsheets/d/1QKxbCrHSy2NyUbMuJPw5UT36nouo8DKw/htmlview"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>Sheet ต้นฉบับ</span>
            <svg
              className="w-3 h-3 opacity-60"
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
        </nav>
      </div>
    </header>
  );
}
