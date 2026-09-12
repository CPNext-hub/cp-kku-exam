import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBoxProps {
  initialQuery?: string;
  autoFocus?: boolean;
  /** โหมดย่อ: ใช้ตอนมีผลการค้นหาแล้ว เพื่อดันผลลัพธ์ขึ้นมาให้เห็นโดยไม่ต้องเลื่อน */
  compact?: boolean;
}

export function SearchBox({
  initialQuery = "",
  autoFocus = false,
  compact = false,
}: SearchBoxProps) {
  const suggestions = [
    { label: "ตัวอย่างรหัส", value: "683380531-4" },
    { label: "วิชา", value: "LI101001" },
    { label: "วิชา", value: "CP352001" },
    { label: "ห้อง", value: "SC.7401" },
    { label: "ห้อง", value: "CP.9127" },
    { label: "สาขา", value: "CP-CS" },
  ];

  return (
    <div className={compact ? "w-full max-w-[720px]" : "w-full max-w-[720px] mx-auto"}>
      <form action="/" method="GET" className="relative">
        <div className="relative flex items-center">
          <div
            className={`absolute inset-y-0 left-0 flex items-center pointer-events-none text-muted-foreground ${
              compact ? "pl-4" : "pl-5"
            }`}
          >
            <Search className={compact ? "w-5 h-5" : "w-6 h-6"} />
          </div>
          <Input
            type="search"
            name="q"
            defaultValue={initialQuery}
            autoFocus={autoFocus}
            inputMode="text"
            enterKeyHint="search"
            placeholder="พิมพ์รหัสนักศึกษา เช่น 683380531-4"
            aria-label="ค้นหารหัสนักศึกษา รายวิชา ห้องสอบ หรือสาขาวิชา"
            className={
              compact
                ? "w-full h-12 pl-11 pr-24 rounded-full text-[15px] sm:text-[17px] border-border bg-background placeholder:text-muted-foreground focus-visible:ring-primary shadow-none"
                : "w-full h-14 sm:h-16 pl-14 pr-28 sm:pr-32 rounded-full text-[17px] sm:text-[21px] border-border bg-background placeholder:text-muted-foreground focus-visible:ring-primary shadow-none"
            }
          />
          <div className={compact ? "absolute right-1.5" : "absolute right-2"}>
            <Button
              type="submit"
              className={
                compact
                  ? "h-9 px-5 rounded-full text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-cp-blue-press transition-colors shadow-none"
                  : "h-10 sm:h-12 px-6 sm:px-8 rounded-full text-[15px] sm:text-[17px] font-semibold bg-primary text-primary-foreground hover:bg-cp-blue-press transition-colors shadow-none"
              }
            >
              ค้นหา
            </Button>
          </div>
        </div>
      </form>

      {compact ? null : (
      <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="font-normal">ยังไม่รู้รหัสตัวเอง? ลองกดดูตัวอย่าง:</span>
        {suggestions.map((s, idx) => (
          <Link
            key={idx}
            href={`/?q=${encodeURIComponent(s.value)}`}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <span className="text-muted-foreground mr-1">{s.label}:</span>
            <span className="font-num font-semibold">{s.value}</span>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
