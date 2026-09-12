import Link from "next/link";

interface SearchBoxProps {
  initialQuery?: string;
  autoFocus?: boolean;
}

export function SearchBox({ initialQuery = "", autoFocus = false }: SearchBoxProps) {
  const suggestions = [
    { label: "ตัวอย่างรหัส", value: "683380531-4" },
    { label: "วิชา", value: "LI101001" },
    { label: "วิชา", value: "CP352001" },
    { label: "ห้อง", value: "SC.7401" },
    { label: "ห้อง", value: "CP.9127" },
    { label: "สาขา", value: "CP-CS" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form action="/" method="GET" className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="search"
            name="q"
            defaultValue={initialQuery}
            autoFocus={autoFocus}
            placeholder="ค้นหาด้วยรหัสนักศึกษา (เช่น 683380531-4), รหัสวิชา, ห้องสอบ หรือ สาขา..."
            className="w-full pl-11 pr-24 py-3.5 text-sm sm:text-base rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-sm"
          >
            ค้นหา
          </button>
        </div>
      </form>

      <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">ลองค้นหา:</span>
        {suggestions.map((s, idx) => (
          <Link
            key={idx}
            href={`/?q=${encodeURIComponent(s.value)}`}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <span className="opacity-60 mr-1">{s.label}:</span>
            <span className="font-mono font-medium">{s.value}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
