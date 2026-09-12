import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExamData, getExamTermLabel, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { BlockSummaryTable } from "@/components/BlockSummaryTable";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SessionPageProps {
  params: Promise<{ gid: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<SessionSkeleton />}>
        <SessionContent params={params} />
      </Suspense>
    </div>
  );
}

async function SessionContent({ params }: { params: Promise<{ gid: string }> }) {
  const { gid } = await params;
  const decodedGid = decodeURIComponent(gid).trim();

  const data = await getExamData();
  const indexes = buildIndexes(data);
  const session = indexes.bySession.get(decodedGid);

  if (!session) {
    notFound();
  }

  const uniqueCourses = new Set(session.blocks.map((b) => b.courseCode)).size;
  const uniqueRooms = new Set(session.blocks.map((b) => b.room)).size;

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
                <BreadcrumbPage className="text-sm text-muted-foreground">
                  รอบสอบ {session.tab}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SourceRef source={{ gid: session.gid, tab: session.tab, row: 1 }} />
        </div>

        {/* Session Header Card */}
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">
                    รอบสอบ (Session)
                  </span>
                  {session.tab.includes("กักตัว") && (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      กักตัวสอบ
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
                  {session.tab}
                </h1>
                <p className="text-xs text-muted-foreground font-num mt-1">
                  GID: {session.gid}
                </p>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">กลุ่มสอบ</span>
                  <p className="text-2xl sm:text-3xl font-semibold font-num text-foreground">
                    {session.blocks.length}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">วิชา / ห้อง</span>
                  <p className="text-2xl sm:text-3xl font-semibold font-num text-foreground">
                    {uniqueCourses} / {uniqueRooms}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">ที่นั่งสอบ</span>
                  <p className="text-2xl sm:text-3xl font-semibold font-num text-foreground">
                    {session.totalSeats.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Blocks Table */}
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-semibold text-foreground">
              รายการกลุ่มสอบในรอบนี้ ({session.blocks.length} บล็อก)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              สรุปรายชื่อวิชาและห้องสอบทั้งหมดในรอบนี้
            </p>
          </div>

          <BlockSummaryTable blocks={session.blocks} variant="session" />
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} termLabel={getExamTermLabel(data)} />
    </>
  );
}

function SessionSkeleton() {
  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-32 w-full rounded-[18px]" />
      <Skeleton className="h-64 w-full rounded-[18px]" />
    </main>
  );
}
