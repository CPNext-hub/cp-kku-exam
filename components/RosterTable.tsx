import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MajorBadge } from "@/components/Badge";
import { SourceRef } from "@/components/SourceRef";
import type { Seat } from "@/lib/types";

interface RosterTableProps {
  seats: Seat[];
  hasNames?: boolean;
  className?: string;
}

export function RosterTable({ seats, hasNames, className = "" }: RosterTableProps) {
  // Hide the "name" column if no seats in the block have names
  const showNames = hasNames ?? seats.some((s) => Boolean(s.name && s.name.trim()));

  if (seats.length === 0) {
    return (
      <div className="w-full max-w-[980px] mx-auto rounded-[11px] border border-border bg-background p-6 text-center text-sm text-muted-foreground">
        ไม่มีรายชื่อนักศึกษาในบล็อกนี้
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-[980px] mx-auto overflow-x-auto rounded-[11px] border border-border bg-background ${className}`}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[60px]">ลำดับ</TableHead>
            <TableHead className="w-[140px]">รหัสนักศึกษา</TableHead>
            {showNames && <TableHead className="w-[260px]">ชื่อ - สกุล</TableHead>}
            <TableHead className="w-[100px]">สาขาวิชา</TableHead>
            <TableHead className="w-[110px] text-center">เลขที่นั่งสอบ</TableHead>
            <TableHead className="w-[120px] text-right">แถวใน Sheet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seats.map((seat) => (
            <TableRow key={`${seat.blockId}:${seat.row}`} className="border-border">
              <TableCell className="font-num text-xs text-muted-foreground">
                {seat.no}
              </TableCell>
              <TableCell>
                <Link
                  href={`/student/${seat.studentId}`}
                  className="font-num font-semibold text-primary hover:underline text-sm"
                >
                  {seat.studentId}
                </Link>
              </TableCell>
              {showNames && (
                <TableCell className="text-sm text-foreground w-[260px] max-w-[260px] truncate">
                  {seat.name || "-"}
                </TableCell>
              )}
              <TableCell>
                {seat.major ? <MajorBadge major={seat.major} /> : "-"}
              </TableCell>
              <TableCell className="text-center font-num font-bold text-foreground">
                {seat.seat || "-"}
              </TableCell>
              <TableCell className="text-right">
                <SourceRef source={seat.source} compact />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
