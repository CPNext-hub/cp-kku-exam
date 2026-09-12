import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, getExamTermLabel, buildIndexes } from "@/lib/data";
import { hasDateMismatch } from "@/lib/date-mismatch";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { StatusBadge, SecBadge } from "@/components/Badge";
import { RosterTable } from "@/components/RosterTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface BlockPageProps {
  params: Promise<{ gid: string; row: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gid: string; row: string }>;
}): Promise<Metadata> {
  const { gid, row } = await params;
  const decodedGid = decodeURIComponent(gid).trim();
  const decodedRow = decodeURIComponent(row).trim();
  const data = await getExamData();
  const indexes = buildIndexes(data);
  const block = indexes.byBlock.get(`${decodedGid}:${decodedRow}`);

  if (!block) {
    return {
      title: "ไม่พบข้อมูลกลุ่มสอบ | CP KKU Exam",
      robots: { index: false, follow: false },
    };
  }

  const roomText = block.room && block.room !== "—" ? ` (${block.room})` : "";
  const secText = block.sec ? ` ${block.sec}` : "";
  return {
    title: `${block.courseCode}${secText}${roomText} | CP KKU Exam`,
    description: `ใบรายชื่อผู้เข้าสอบวิชา ${block.courseCode} ${block.courseName}${secText} ห้อง ${block.room} วันที่ ${block.date} เวลา ${block.time}`,
    robots: { index: false, follow: false },
  };
}

export default function BlockPage({ params, searchParams }: BlockPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<BlockSkeleton />}>
        <BlockContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BlockContent({
  params,
  searchParams,
}: {
  params: Promise<{ gid: string; row: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { gid, row } = await params;
  const decodedGid = decodeURIComponent(gid).trim();
  const decodedRow = decodeURIComponent(row).trim();

  const data = await getExamData();
  const indexes = buildIndexes(data);
  const block = indexes.byBlock.get(`${decodedGid}:${decodedRow}`);

  if (!block) {
    notFound();
  }

  const sParams = await searchParams;
  const rawPage = sParams?.page;
  const pageStr =
    typeof rawPage === "string"
      ? rawPage
      : Array.isArray(rawPage)
      ? rawPage[0]
      : "1";
  let page = parseInt(pageStr || "1", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // หมายเหตุ: ในชุดข้อมูลปัจจุบัน บล็อกที่ใหญ่ที่สุดมีเพียง 27 แถว ค่าคงที่ PAGE_SIZE = 50 นี้จึงยังไม่เคยถูกใช้งานจริง (ทำเผื่อไว้สำหรับกรณีข้อมูลในอนาคตมีบล็อกใหญ่กว่า 50 แถว)
  const PAGE_SIZE = 50;
  const totalSeats = block.seats.length;
  const totalPages = Math.max(1, Math.ceil(totalSeats / PAGE_SIZE));
  if (page > totalPages) {
    page = totalPages;
  }

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalSeats);
  const paginatedSeats = block.seats.slice(startIndex, endIndex);
  const hasNames = block.seats.some((s) => Boolean(s.name && s.name.trim()));
  const isCancelled = block.status === "cancelled";
  const isMismatch = hasDateMismatch(block.date, block.tabName);

  return (
    <>
      <main className="flex-1 w-full max-w-[980px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb navigation */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  หน้าหลัก
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/session/${block.gid}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {block.tabName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/course/${block.courseSlug}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {block.courseCode}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {block.room && block.room !== "—" && !isCancelled && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/room/${encodeURIComponent(block.room)}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {block.room}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm text-muted-foreground font-num">
                  {block.sec ? block.sec : `แถว ${block.headerRow}`}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Block Header Card */}
        <Card
          className={`border shadow-none rounded-[18px] ${
            isCancelled
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-card"
          }`}
        >
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
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
                <CardTitle className="text-xl sm:text-2xl font-semibold text-foreground">
                  {block.courseName}
                </CardTitle>
              </div>

              <div className="shrink-0">
                <SourceRef source={block.source} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Room */}
              <div className="p-4 rounded-[11px] bg-background border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>ห้องสอบ</span>
                </div>
                {isCancelled || block.room === "—" ? (
                  <p className="text-base font-semibold text-muted-foreground font-num">—</p>
                ) : (
                  <Link
                    href={`/room/${encodeURIComponent(block.room)}`}
                    className="text-base font-semibold font-num text-primary hover:underline block truncate"
                  >
                    {block.room}
                  </Link>
                )}
              </div>

              {/* Date */}
              <div className="p-4 rounded-[11px] bg-background border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>วันที่สอบ</span>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {block.date || "—"}
                </p>
                {isMismatch && (
                  <div className="mt-2 text-xs text-muted-foreground bg-secondary p-2.5 rounded-[11px] border border-border space-y-1">
                    <p className="font-semibold text-foreground">
                      ⚠️ วันที่ต้นทางไม่ตรงกับรอบสอบ
                    </p>
                    <p>
                      ช่องวันที่ระบุ &ldquo;{block.date}&rdquo; แต่รอบสอบระบุ &ldquo;{block.tabName}&rdquo; แนะนำให้ยึดวันตามรอบสอบและกดปุ่มที่มา (ref) ด้านบนเพื่อตรวจสอบใน Google Sheet ต้นฉบับ
                    </p>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="p-4 rounded-[11px] bg-background border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>เวลาสอบ</span>
                </div>
                <p className="text-base font-semibold font-num text-foreground">
                  {block.time || "—"}
                </p>
              </div>

              {/* Seats */}
              <div className="p-4 rounded-[11px] bg-background border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>จำนวนที่นั่งสอบ</span>
                </div>
                <p className="text-base font-semibold font-num text-foreground">
                  {totalSeats.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-muted-foreground">ที่นั่ง</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roster Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                ใบรายชื่อผู้เข้าสอบ ({totalSeats.toLocaleString()} คน)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                เรียงตามลำดับที่นั่งสอบในห้อง
              </p>
            </div>

            {totalPages > 1 && (
              <span className="text-xs text-muted-foreground font-num">
                แสดง {totalSeats === 0 ? 0 : startIndex + 1}–{endIndex} จาก {totalSeats.toLocaleString()} คน (หน้า {page}/{totalPages})
              </span>
            )}
          </div>

          {/* Roster Table */}
          <RosterTable seats={paginatedSeats} hasNames={hasNames} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="text-xs text-muted-foreground font-num">
                หน้า {page} จาก {totalPages}
              </span>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full h-8 px-3 text-xs font-semibold"
                  >
                    <Link
                      href={
                        page - 1 === 1
                          ? `/block/${decodedGid}/${decodedRow}`
                          : `/block/${decodedGid}/${decodedRow}?page=${page - 1}`
                      }
                    >
                      ก่อนหน้า
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-full h-8 px-3 text-xs font-semibold opacity-40"
                  >
                    ก่อนหน้า
                  </Button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
                  p === page ? (
                    <span
                      key={p}
                      className="inline-flex items-center justify-center h-8 min-w-8 px-2.5 rounded-full bg-primary text-primary-foreground font-num text-xs font-semibold"
                    >
                      {p}
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-full h-8 min-w-8 px-2.5 text-xs font-num font-semibold"
                    >
                      <Link
                        href={
                          p === 1
                            ? `/block/${decodedGid}/${decodedRow}`
                            : `/block/${decodedGid}/${decodedRow}?page=${p}`
                        }
                      >
                        {p}
                      </Link>
                    </Button>
                  )
                )}

                {page < totalPages ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full h-8 px-3 text-xs font-semibold"
                  >
                    <Link
                      href={`/block/${decodedGid}/${decodedRow}?page=${page + 1}`}
                    >
                      ถัดไป
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-full h-8 px-3 text-xs font-semibold opacity-40"
                  >
                    ถัดไป
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} termLabel={getExamTermLabel(data)} />
    </>
  );
}

function BlockSkeleton() {
  return (
    <main className="flex-1 w-full max-w-[980px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-pulse">
      <Skeleton className="h-5 w-48 rounded-full" />
      <Skeleton className="h-40 w-full rounded-[18px]" />
      <Skeleton className="h-80 w-full rounded-[11px]" />
    </main>
  );
}
