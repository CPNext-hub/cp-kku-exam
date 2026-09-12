import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExamData, getExamTermLabel, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatusBadge } from "@/components/Badge";
import { BlockSummaryTable } from "@/components/BlockSummaryTable";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

async function RoomContent({ params }: RoomPageProps) {
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

          <BlockSummaryTable blocks={roomSchedule.blocks} variant="room" />
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} termLabel={getExamTermLabel(data)} />
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
