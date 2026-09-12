import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <Input
            type="search"
            name="q"
            defaultValue={initialQuery}
            autoFocus={autoFocus}
            placeholder="ค้นหารหัสนักศึกษา (เช่น 683380531-4), วิชา, ห้องสอบ หรือ สาขา..."
            className="w-full h-12 pl-11 pr-28 rounded-full text-[17px] border-border bg-background placeholder:text-muted-foreground focus-visible:ring-primary shadow-none"
          />
          <div className="absolute right-1.5">
            <Button
              type="submit"
              className="h-9 px-6 rounded-full text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-cp-blue-press transition-colors shadow-none"
            >
              ค้นหา
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="font-normal">ลองค้นหา:</span>
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
    </div>
  );
}
