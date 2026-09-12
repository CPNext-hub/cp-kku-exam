import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { StatusBadge, SecBadge, MajorBadge } from "@/components/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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

interface CoursePageProps {
  params: Promise<{ code: string }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<CourseSkeleton />}>
        <CourseContent params={params} />
      </Suspense>
    </div>
  );
}

async function CourseContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code).trim().toLowerCase();

  const data = await getExamData();
  const indexes = buildIndexes(data);

  // Search course by slug or code
  let courseGroup = indexes.byCourse.get(decodedCode);
  if (!courseGroup) {
    for (const cg of indexes.byCourse.values()) {
      if (
        cg.code.toLowerCase() === decodedCode ||
        cg.slug.toLowerCase() === decodedCode
      ) {
        courseGroup = cg;
        break;
      }
    }
  }

  if (!courseGroup) {
    notFound();
  }

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
                  {courseGroup.code}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="text-xs text-muted-foreground font-num">
            {courseGroup.blocks.length} กลุ่มสอบ/ห้องสอบ
          </span>
        </div>

        {/* Course Header Card */}
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-semibold text-muted-foreground">
                  ข้อมูลรายวิชา
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold font-num text-foreground">
                    {courseGroup.code}
                  </h1>
                </div>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {courseGroup.name}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-muted-foreground">จำนวนที่นั่งสอบรวม</span>
                <p className="text-3xl font-semibold font-num text-foreground">
                  {courseGroup.totalSeats.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">ที่นั่ง</span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Exam Blocks Overview Table */}
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-semibold text-foreground">
              รายการกลุ่มสอบทั้งหมดในรายวิชานี้ ({courseGroup.blocks.length} บล็อก)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              แสดงแยกกลุ่มและห้องสอบตามประกาศจริง
            </p>
          </div>

          <div className="overflow-x-auto rounded-[11px] border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[90px]">กลุ่ม (SEC)</TableHead>
                  <TableHead>ห้องสอบ</TableHead>
                  <TableHead>วันและเวลาสอบ</TableHead>
                  <TableHead>รอบสอบ (Session)</TableHead>
                  <TableHead className="text-right">จำนวนที่นั่ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">ที่มา</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseGroup.blocks.map((block) => (
                  <TableRow key={block.id} className="border-border">
                    <TableCell>
                      <SecBadge sec={block.sec} />
                    </TableCell>
                    <TableCell>
                      {block.status === "cancelled" || block.room === "—" ? (
                        <span className="text-muted-foreground font-num">—</span>
                      ) : (
                        <Link
                          href={`/room/${encodeURIComponent(block.room)}`}
                          className="font-num font-semibold text-primary hover:underline"
                        >
                          {block.room}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-foreground block">{block.date}</span>
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

        {/* Detailed Block List with Seat Tables */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-semibold text-foreground">
            รายชื่อผู้เข้าสอบในแต่ละกลุ่ม
          </h2>

          <div className="space-y-6">
            {courseGroup.blocks.map((block) => {
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
                          <SecBadge sec={block.sec} />
                          <StatusBadge status={block.status} />
                          {block.program && (
                            <span className="text-xs text-muted-foreground">
                              {block.program}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground pt-1">
                          <span>
                            ห้องสอบ:{" "}
                            {isCancelled || block.room === "—" ? (
                              <span className="text-muted-foreground font-num">—</span>
                            ) : (
                              <Link
                                href={`/room/${encodeURIComponent(block.room)}`}
                                className="font-num font-semibold text-primary hover:underline"
                              >
                                {block.room}
                              </Link>
                            )}
                          </span>
                          <span>•</span>
                          <span>วันสอบ: {block.date}</span>
                          <span>•</span>
                          <span className="font-num">เวลา: {block.time}</span>
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

function CourseSkeleton() {
  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-32 w-full rounded-[18px]" />
      <Skeleton className="h-64 w-full rounded-[18px]" />
    </main>
  );
}
