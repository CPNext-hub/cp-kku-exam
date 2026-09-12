import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { StatusBadge, SecBadge, MajorBadge } from "@/components/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RoomPageProps {
  params: Promise<{ room: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<RoomSkeleton />}>
        <RoomContent params={params} />
      </Suspense>
    </div>
  );
}

async function RoomContent({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const decodedRoom = decodeURIComponent(room).trim();

  const data = await getExamData();
  const indexes = buildIndexes(data);
  const roomSchedule = indexes.byRoom.get(decodedRoom);

  if (!roomSchedule) {
    notFound();
  }

  const isCancelledRoom = roomSchedule.room === "ยกเลิกการสอบ" || roomSchedule.isCancelled;

  return (
    <>
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb navigation */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-sm font-semibold text-primary hover:underline">
                  หน้าหลัก
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm text-muted-foreground font-num">
                  ห้อง {roomSchedule.room}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="text-xs text-muted-foreground font-num">
            {roomSchedule.blocks.length} บล็อกวิชา
          </span>
        </div>

        {/* Room Header Card */}
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">
                    ตารางการใช้ห้องสอบ
                  </span>
                  {isCancelledRoom && <StatusBadge status="cancelled" />}
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold font-num text-foreground mt-1">
                  {roomSchedule.room}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isCancelledRoom
                    ? "รายการวิชาที่มีการประกาศยกเลิกการจัดสอบในห้องนี้"
                    : `จัดสอบทั้งหมด ${roomSchedule.blocks.length} บล็อกวิชา`}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-muted-foreground">จำนวนที่นั่งสอบรวม</span>
                <p className="text-3xl font-semibold font-num text-foreground">
                  {roomSchedule.totalSeats.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">ที่นั่ง</span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Overview Table of blocks in this room */}
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-semibold text-foreground">
              รายการสอบในห้องนี้ (เรียงตามวัน-เวลา)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              แสดงรอบสอบและวิชาที่ใช้ห้องสอบนี้
            </p>
          </div>

          <div className="overflow-x-auto rounded-[11px] border border-border bg-card">
            <Table>
              <TableHeader>
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
              </TableHeader>
              <TableBody>
                {roomSchedule.blocks.map((block) => (
                  <TableRow key={block.id} className="border-border">
                    <TableCell>
                      <span className="text-xs text-foreground block font-semibold">{block.date}</span>
                      <span className="text-xs text-muted-foreground font-num block">{block.time}</span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/session/${block.gid}`}
                        className="text-xs font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {block.tabName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/course/${block.courseSlug}`}
                        className="font-num font-semibold text-primary hover:underline text-sm"
                      >
                        {block.courseCode}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-foreground max-w-[280px] truncate">
                      {block.courseName}
                    </TableCell>
                    <TableCell>
                      <SecBadge sec={block.sec} />
                    </TableCell>
                    <TableCell className="text-right font-num font-semibold">
                      {block.seats.length}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={block.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <SourceRef source={block.source} compact />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Detailed Block List with Student Lists */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-semibold text-foreground">
            รายชื่อผู้เข้าสอบในห้องนี้แยกตามกลุ่ม
          </h2>

          <div className="space-y-6">
            {roomSchedule.blocks.map((block) => {
              const isCancelled = block.status === "cancelled";

              return (
                <Card
                  key={block.id}
                  className={`border shadow-none ${
                    isCancelled
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-card"
                  }`}
                >
                  <CardHeader className="p-6 pb-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/course/${block.courseSlug}`}
                            className="font-num text-base font-semibold text-primary hover:underline"
                          >
                            {block.courseCode}
                          </Link>
                          <SecBadge sec={block.sec} />
                          <StatusBadge status={block.status} />
                          {block.program && (
                            <span className="text-xs text-muted-foreground">
                              {block.program}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mt-1">
                          {block.courseName}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span>วันสอบ: {block.date}</span>
                          <span>•</span>
                          <span className="font-num">เวลา: {block.time}</span>
                          <span>•</span>
                          <Link
                            href={`/session/${block.gid}`}
                            className="hover:text-primary transition-colors underline"
                          >
                            รอบสอบ: {block.tabName}
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-num text-muted-foreground">
                          {block.seats.length} คน
                        </span>
                        <SourceRef source={block.source} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {block.seats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        ไม่มีรายชื่อนักศึกษาในบล็อกนี้
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-[11px] border border-border bg-background">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                              <TableHead className="w-[60px]">ลำดับ</TableHead>
                              <TableHead className="w-[140px]">รหัสนักศึกษา</TableHead>
                              <TableHead>ชื่อ - สกุล</TableHead>
                              <TableHead className="w-[100px]">สาขาวิชา</TableHead>
                              <TableHead className="w-[110px] text-center">เลขที่นั่งสอบ</TableHead>
                              <TableHead className="w-[120px] text-right">แถวใน Sheet</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {block.seats.map((seat) => (
                              <TableRow key={`${block.id}:${seat.row}`} className="border-border">
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
                                <TableCell className="text-sm text-foreground">
                                  {seat.name || "-"}
                                </TableCell>
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
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} />
    </>
  );
}

function RoomSkeleton() {
  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-32 w-full rounded-[18px]" />
      <Skeleton className="h-64 w-full rounded-[18px]" />
    </main>
  );
}
