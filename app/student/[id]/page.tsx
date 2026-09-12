import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, getAcademicYear, buildIndexes } from "@/lib/data";
import { hasDateMismatch } from "@/lib/date-mismatch";
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
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

interface StudentPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentPage({ params }: StudentPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<StudentSkeleton />}>
        <StudentContent params={params} />
      </Suspense>
    </div>
  );
}

async function StudentContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();

  const data = await getExamData();
  const indexes = buildIndexes(data);
  const student = indexes.byStudent.get(decodedId);

  if (!student) {
    notFound();
  }

  return (
    <>
      <main className="flex-1 w-full max-w-[980px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
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
                  {student.studentId}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="text-xs text-muted-foreground font-num">
            {student.exams.length} วิชาที่สอบ
          </span>
        </div>

        {/* Student Profile Card (Hairline border, NO shadow) */}
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">
                    ตารางสอบนักศึกษา
                  </span>
                  {student.major && <MajorBadge major={student.major} />}
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold font-num text-foreground mt-1">
                  {student.studentId}
                </h1>
                {student.name ? (
                  <p className="text-base font-semibold text-foreground mt-1">
                    {student.name}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    (ไม่มีการระบุชื่อ-สกุลในไฟล์ประกาศ ให้ยึดรหัสนักศึกษาเป็นหลัก)
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-muted-foreground">จำนวนวิชาสอบทั้งหมด</span>
                <p className="text-3xl font-semibold font-num text-foreground">
                  {student.exams.length}{" "}
                  <span className="text-sm font-normal text-muted-foreground">วิชา</span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Exam Schedule List */}
        <div className="space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-semibold text-foreground">
              กำหนดการสอบเรียงตามวันและเวลา
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              ตรวจสอบเลขที่นั่งสอบ ห้องสอบ และเวลาก่อนเข้าห้องสอบ
            </p>
          </div>

          <div className="space-y-6">
            {student.exams.map(({ seat, block }) => {
              const isCancelled = block.status === "cancelled";
              const isMismatch = hasDateMismatch(block.date, block.tabName);

              return (
                <Card
                  key={block.id}
                  className={`border transition-colors shadow-none ${
                    isCancelled
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-card"
                  }`}
                >
                  <CardHeader className="p-6 pb-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/course/${block.courseSlug}`}
                            className="font-num text-base font-semibold text-primary hover:underline"
                          >
                            {block.courseCode}
                          </Link>
                          <SecBadge sec={block.sec} />
                          <StatusBadge status={block.status} />
                          {block.note && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                              {block.note}
                            </span>
                          )}
                          {isMismatch && (
                            <span
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border"
                              title={`ข้อมูลวันที่ใน Sheet (${block.date}) ไม่ตรงกับรอบสอบ (${block.tabName})`}
                            >
                              ⚠️ วันที่ต้นทางไม่ตรงกับรอบสอบ
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground mt-1.5">
                          {block.courseName}
                        </CardTitle>
                        {block.program && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {block.program}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <SourceRef source={seat.source} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-4">
                    {/* The 3 info columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* 1. Seat Number: Product Imagery! EXACTLY ONE DROP SHADOW IN THE ENTIRE SYSTEM */}
                      <div className="p-6 rounded-[18px] bg-background border border-border seat-card-shadow text-center flex flex-col justify-center items-center">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          เลขที่นั่งสอบ
                        </span>
                        {/* Seat token: 44-56px, weight 700, line-height 1.0, tracking: -0.02em */}
                        <p className="text-5xl font-bold font-num text-foreground tracking-tight leading-none my-2">
                          {seat.seat || "-"}
                        </p>
                        <span className="text-xs text-muted-foreground font-num">
                          ลำดับที่ {seat.no}
                        </span>
                      </div>

                      {/* 2. Room (Hairline border, NO shadow) */}
                      <div className="p-6 rounded-[18px] bg-secondary border border-border text-center flex flex-col justify-center items-center">
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>ห้องสอบ</span>
                        </div>
                        {isCancelled || block.room === "—" ? (
                          <p className="text-4xl font-bold font-num text-muted-foreground mt-2">
                            —
                          </p>
                        ) : (
                          <Link
                            href={`/room/${encodeURIComponent(block.room)}`}
                            className="text-2xl font-bold font-num text-foreground hover:text-primary transition-colors mt-2"
                          >
                            {block.room}
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">
                          {isCancelled ? "วิชานี้ไม่มีการจัดสอบ" : "คลิกเพื่อดูตารางห้อง"}
                        </span>
                      </div>

                      {/* 3. Date & Time (Hairline border, NO shadow) */}
                      <div className="p-6 rounded-[18px] bg-secondary border border-border text-center flex flex-col justify-center items-center">
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>วันและเวลาสอบ</span>
                        </div>
                        <p className="text-base font-semibold text-foreground mt-2">
                          {block.date}
                        </p>
                        {isMismatch && (
                          <div className="mt-2 text-xs text-muted-foreground bg-background p-2.5 rounded-[11px] border border-border text-left">
                            <p className="font-semibold text-foreground">
                              ⚠️ วันที่ต้นทางไม่ตรงกับรอบสอบ
                            </p>
                            <p className="mt-0.5">
                              ใน Sheet ระบุ &ldquo;{block.date}&rdquo; แต่วิชานี้อยู่ในรอบ &ldquo;{block.tabName}&rdquo; แนะนำให้ยึดวันตามรอบสอบและตรวจสอบที่ Sheet
                            </p>
                          </div>
                        )}
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground mt-1 font-num">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{block.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Session permalink */}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <Link
                        href={`/session/${block.gid}`}
                        className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <span>รอบสอบ: {block.tabName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="font-num text-muted-foreground">
                        บรรทัดที่ {seat.row} ใน Sheet
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} academicYear={getAcademicYear(data)} />
    </>
  );
}

function StudentSkeleton() {
  return (
    <main className="flex-1 w-full max-w-[980px] mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-32 w-full rounded-[18px]" />
      <Skeleton className="h-56 w-full rounded-[18px]" />
      <Skeleton className="h-56 w-full rounded-[18px]" />
    </main>
  );
}
