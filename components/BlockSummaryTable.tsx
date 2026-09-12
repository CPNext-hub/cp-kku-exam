import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sourceUrl } from "@/lib/sheet-source";
import { hasDateMismatch } from "@/lib/date-mismatch";
import type { ExamBlock } from "@/lib/types";

export type BlockSummaryVariant = "room" | "session" | "course";

interface BlockSummaryTableProps {
  blocks: ExamBlock[];
  variant: BlockSummaryVariant;
  className?: string;
}

/**
 * Escapes characters to prevent HTML/XSS injection.
 * Single source of truth for HTML escaping across all summary tables.
 */
function escapeHtml(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function BlockSummaryTable({
  blocks,
  variant,
  className = "",
}: BlockSummaryTableProps) {
  let tbodyClasses =
    "[&_tr]:relative [&_tr]:cursor-pointer [&_tr]:border-b [&_tr]:border-border [&_tr:hover]:bg-muted/50 [&_tr]:transition-colors " +
    "[&_tr:has(a:focus-visible)]:outline [&_tr:has(a:focus-visible)]:outline-2 [&_tr:has(a:focus-visible)]:outline-ring " +
    "[&_td>a]:relative [&_td>a]:z-10";

  if (variant === "room") {
    tbodyClasses +=
      " [&_td:nth-child(1)>b]:font-semibold [&_td:nth-child(1)>span]:text-muted-foreground [&_td:nth-child(1)>span]:font-num " +
      "[&_td:nth-child(2)>a:hover]:text-primary " +
      "[&_td:nth-child(3)>a]:font-num [&_td:nth-child(3)>a]:font-semibold [&_td:nth-child(3)>a]:text-primary [&_td:nth-child(3)>a:hover]:underline " +
      "[&_td:nth-child(4)]:max-w-[280px] [&_td:nth-child(4)]:truncate " +
      "[&_td:nth-child(5)>a]:static [&_td:nth-child(5)>a]:after:absolute [&_td:nth-child(5)>a]:after:inset-0 [&_td:nth-child(5)>a]:after:content-[''] [&_td:nth-child(5)>a]:inline-flex [&_td:nth-child(5)>a]:rounded-full [&_td:nth-child(5)>a]:border [&_td:nth-child(5)>a]:border-border [&_td:nth-child(5)>a]:px-2 [&_td:nth-child(5)>a]:py-0.5 [&_td:nth-child(5)>a]:font-num [&_td:nth-child(5)>a:hover]:border-primary " +
      "[&_td:nth-child(6)]:text-right [&_td:nth-child(6)>a]:font-num [&_td:nth-child(6)>a]:font-semibold [&_td:nth-child(6)>a]:text-primary [&_td:nth-child(6)>a:hover]:underline " +
      "[&_td:nth-child(7)>span]:inline-block [&_td:nth-child(7)>span]:rounded-full [&_td:nth-child(7)>span]:px-2.5 [&_td:nth-child(7)>span]:py-0.5 [&_td:nth-child(7)>span]:bg-secondary [&_td:nth-child(7)>span]:text-muted-foreground " +
      "[&_td:nth-child(8)]:text-right [&_td:nth-child(8)>a]:text-muted-foreground [&_td:nth-child(8)>a:hover]:text-primary [&_td:nth-child(8)>a]:font-num";
  } else if (variant === "session") {
    tbodyClasses +=
      " [&_td:nth-child(1)>a]:font-num [&_td:nth-child(1)>a]:font-semibold [&_td:nth-child(1)>a]:text-primary [&_td:nth-child(1)>a:hover]:underline " +
      "[&_td:nth-child(2)]:max-w-[280px] [&_td:nth-child(2)]:truncate " +
      "[&_td:nth-child(3)>a]:static [&_td:nth-child(3)>a]:after:absolute [&_td:nth-child(3)>a]:after:inset-0 [&_td:nth-child(3)>a]:after:content-[''] [&_td:nth-child(3)>a]:inline-flex [&_td:nth-child(3)>a]:rounded-full [&_td:nth-child(3)>a]:border [&_td:nth-child(3)>a]:border-border [&_td:nth-child(3)>a]:px-2 [&_td:nth-child(3)>a]:py-0.5 [&_td:nth-child(3)>a]:font-num [&_td:nth-child(3)>a:hover]:border-primary " +
      "[&_td:nth-child(4)>a]:font-num [&_td:nth-child(4)>a]:font-semibold [&_td:nth-child(4)>a]:text-primary [&_td:nth-child(4)>a:hover]:underline [&_td:nth-child(4)>span]:text-muted-foreground [&_td:nth-child(4)>span]:font-num " +
      "[&_td:nth-child(5)>span]:text-muted-foreground [&_td:nth-child(5)>span]:font-num " +
      "[&_td:nth-child(6)]:text-right [&_td:nth-child(6)>a]:font-num [&_td:nth-child(6)>a]:font-semibold [&_td:nth-child(6)>a]:text-primary [&_td:nth-child(6)>a:hover]:underline " +
      "[&_td:nth-child(7)>span]:inline-block [&_td:nth-child(7)>span]:rounded-full [&_td:nth-child(7)>span]:px-2.5 [&_td:nth-child(7)>span]:py-0.5 [&_td:nth-child(7)>span]:bg-secondary [&_td:nth-child(7)>span]:text-muted-foreground " +
      "[&_td:nth-child(8)]:text-right [&_td:nth-child(8)>a]:text-muted-foreground [&_td:nth-child(8)>a:hover]:text-primary [&_td:nth-child(8)>a]:font-num";
  } else if (variant === "course") {
    tbodyClasses +=
      " [&_td:nth-child(1)>a]:static [&_td:nth-child(1)>a]:after:absolute [&_td:nth-child(1)>a]:after:inset-0 [&_td:nth-child(1)>a]:after:content-[''] [&_td:nth-child(1)>a]:inline-flex [&_td:nth-child(1)>a]:rounded-full [&_td:nth-child(1)>a]:border [&_td:nth-child(1)>a]:border-border [&_td:nth-child(1)>a]:px-2 [&_td:nth-child(1)>a]:py-0.5 [&_td:nth-child(1)>a]:font-num [&_td:nth-child(1)>a:hover]:border-primary " +
      "[&_td:nth-child(2)>a]:font-num [&_td:nth-child(2)>a]:font-semibold [&_td:nth-child(2)>a]:text-primary [&_td:nth-child(2)>a:hover]:underline [&_td:nth-child(2)>span]:text-muted-foreground [&_td:nth-child(2)>span]:font-num " +
      "[&_td:nth-child(3)>b]:font-semibold [&_td:nth-child(3)>span]:text-muted-foreground [&_td:nth-child(3)>span]:font-num " +
      "[&_td:nth-child(4)>a:hover]:text-primary " +
      "[&_td:nth-child(5)]:text-right [&_td:nth-child(5)>a]:font-num [&_td:nth-child(5)>a]:font-semibold [&_td:nth-child(5)>a]:text-primary [&_td:nth-child(5)>a:hover]:underline " +
      "[&_td:nth-child(6)>span]:inline-block [&_td:nth-child(6)>span]:rounded-full [&_td:nth-child(6)>span]:px-2.5 [&_td:nth-child(6)>span]:py-0.5 [&_td:nth-child(6)>span]:bg-secondary [&_td:nth-child(6)>span]:text-muted-foreground " +
      "[&_td:nth-child(7)]:text-right [&_td:nth-child(7)>a]:text-muted-foreground [&_td:nth-child(7)>a:hover]:text-primary [&_td:nth-child(7)>a]:font-num";
  }

  const rowsHtml = blocks
    .map((block) => {
      const blockUrl = `/block/${escapeHtml(block.gid)}/${escapeHtml(block.headerRow)}`;
      const sheetUrl = sourceUrl(block.source.gid, block.source.row);
      const isCancelled = block.status === "cancelled";
      const isMismatch = hasDateMismatch(block.date, block.tabName);

      const statusHtml = isCancelled
        ? `<span class="!bg-destructive/10 !text-destructive font-semibold">ยกเลิกการสอบ</span>`
        : `<span>จัดสอบปกติ</span>`;

      const mismatchBadgeRoomOrCourse = isMismatch
        ? `<br><span class="warn-badge" title="วันที่ใน Sheet (${escapeHtml(block.date)}) ไม่ตรงกับรอบสอบ (${escapeHtml(block.tabName)})">⚠️ วันที่ไม่ตรงรอบสอบ</span>`
        : "";

      const mismatchBadgeSession = isMismatch
        ? `<br><span class="warn-badge" title="วันที่ใน Sheet (${escapeHtml(block.date)}) ไม่ตรงกับรอบสอบ (${escapeHtml(block.tabName)})">⚠️ วันที่ ${escapeHtml(block.date)} ไม่ตรงรอบสอบ</span>`
        : "";

      const roomHtml =
        isCancelled || block.room === "—"
          ? `<span>—</span>`
          : `<a href="/room/${escapeHtml(encodeURIComponent(block.room))}">${escapeHtml(block.room)}</a>`;

      if (variant === "room") {
        return `<tr><td><b>${escapeHtml(block.date)}</b><br><span>${escapeHtml(block.time)}</span>${mismatchBadgeRoomOrCourse}<td><a href="/session/${escapeHtml(block.gid)}">${escapeHtml(block.tabName)}</a><td><a href="/course/${escapeHtml(block.courseSlug)}">${escapeHtml(block.courseCode)}</a><td>${escapeHtml(block.courseName)}<td><a href="${escapeHtml(blockUrl)}">${escapeHtml(block.sec)}</a><td><a href="${escapeHtml(blockUrl)}">${escapeHtml(block.seats.length)}</a><td>${statusHtml}<td><a href="${escapeHtml(sheetUrl)}" target="_blank">แถว ${escapeHtml(block.source.row)} ↗</a>`;
      }

      if (variant === "session") {
        return `<tr><td><a href="/course/${escapeHtml(block.courseSlug)}">${escapeHtml(block.courseCode)}</a><td>${escapeHtml(block.courseName)}<td><a href="${escapeHtml(blockUrl)}">${escapeHtml(block.sec)}</a><td>${roomHtml}<td><span>${escapeHtml(block.time)}</span>${mismatchBadgeSession}<td><a href="${escapeHtml(blockUrl)}">${escapeHtml(block.seats.length)}</a><td>${statusHtml}<td><a href="${escapeHtml(sheetUrl)}" target="_blank">แถว ${escapeHtml(block.source.row)} ↗</a>`;
      }

      // variant === "course"
      return `<tr><td><a href="${escapeHtml(blockUrl)}">${escapeHtml(block.sec)}</a><td>${roomHtml}<td><b>${escapeHtml(block.date)}</b><br><span>${escapeHtml(block.time)}</span>${mismatchBadgeRoomOrCourse}<td><a href="/session/${escapeHtml(block.gid)}">${escapeHtml(block.tabName)}</a><td><a href="${escapeHtml(blockUrl)}">${escapeHtml(block.seats.length)}</a><td>${statusHtml}<td><a href="${escapeHtml(sheetUrl)}" target="_blank">แถว ${escapeHtml(block.source.row)} ↗</a>`;
    })
    .join("");

  return (
    <div
      className={`rounded-[11px] border border-border bg-card overflow-hidden ${className}`}
    >
      <Table className="text-xs">
        <TableHeader>
          {variant === "room" && (
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>วันและเวลาสอบ</TableHead>
              <TableHead>รอบสอบ (Session)</TableHead>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="w-[80px]">SEC</TableHead>
              <TableHead className="text-right">จำนวนที่นั่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">ที่มา</TableHead>
            </TableRow>
          )}
          {variant === "session" && (
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[120px]">รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="w-[80px]">SEC</TableHead>
              <TableHead>ห้องสอบ</TableHead>
              <TableHead>เวลาสอบ</TableHead>
              <TableHead className="text-right">จำนวนที่นั่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">ที่มา</TableHead>
            </TableRow>
          )}
          {variant === "course" && (
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[90px]">กลุ่ม (SEC)</TableHead>
              <TableHead>ห้องสอบ</TableHead>
              <TableHead>วันและเวลาสอบ</TableHead>
              <TableHead>รอบสอบ (Session)</TableHead>
              <TableHead className="text-right">จำนวนที่นั่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">ที่มา</TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody
          className={tbodyClasses}
          dangerouslySetInnerHTML={{ __html: rowsHtml }}
        />
      </Table>
    </div>
  );
}
