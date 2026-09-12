import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { StatusBadge, SecBadge, MajorBadge } from "@/components/Badge";

export default function RoomPage({ params }: PageProps<"/room/[room]">) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <Suspense fallback={<RoomSkeleton />}>
        <RoomContent params={params} />
      </Suspense>
    </div>
  );
}

async function RoomContent({ params }: Pick<PageProps<"/room/[room]">, "params">) {
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>กลับหน้าหลัก</span>
          </Link>
          <span className="text-xs text-zinc-400 font-mono">
            {roomSchedule.blocks.length} บล็อก
          </span>
        </div>

        {/* Room Header Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                  ตารางการใช้ห้องสอบ
                </span>
                {isCancelledRoom && <StatusBadge status="cancelled" />}
              </div>
              <h1 className="text-3xl font-mono font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {roomSchedule.room}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {isCancelledRoom
                  ? "รายการวิชาที่มีการประกาศยกเลิกการจัดสอบในห้องนี้"
                  : `จัดสอบทั้งหมด ${roomSchedule.blocks.length} บล็อกวิชา`}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-500">จำนวนที่นั่งสอบรวม</span>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {roomSchedule.totalSeats.toLocaleString()}{" "}
                <span className="text-sm font-normal text-zinc-500">ที่นั่ง</span>
              </p>
            </div>
          </div>
        </div>

        {/* Room Schedule Blocks */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            รายการสอบในห้องนี้ (เรียงตามวัน-เวลา)
          </h2>

          <div className="space-y-6">
            {roomSchedule.blocks.map((block, index) => (
              <div
                key={block.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
              >
                {/* Block Header */}
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-400">
                        #{index + 1}
                      </span>
                      <Link
                        href={`/course/${block.courseSlug}`}
                        className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {block.courseCode}
                      </Link>
                      <SecBadge sec={block.sec} />
                      <StatusBadge status={block.status} />
                      {block.program && (
                        <span className="text-xs text-zinc-500 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {block.program}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-1">
                      {block.courseName}
                    </h3>
                    <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <Link
                        href={`/session/${block.gid}`}
                        className="hover:underline text-zinc-600 dark:text-zinc-400"
                      >
                        {block.date} ({block.time}) · {block.tabName}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-500">
                      {block.seats.length} คน
                    </span>
                    <SourceRef source={block.source} />
                  </div>
                </div>

                {/* Seat Roster */}
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/90 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold backdrop-blur-sm">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">ลำดับ</th>
                        <th className="py-2.5 px-4">รหัสนักศึกษา</th>
                        <th className="py-2.5 px-4">ชื่อ - สกุล</th>
                        <th className="py-2.5 px-4">สาขาวิชา</th>
                        <th className="py-2.5 px-4 text-center">เลขที่นั่ง</th>
                        <th className="py-2.5 px-4 text-right">ที่มา</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                      {block.seats.map((seat) => (
                        <tr
                          key={`${seat.studentId}-${seat.row}`}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-2 px-4 text-center text-zinc-400 font-sans">
                            {seat.no}
                          </td>
                          <td className="py-2 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            <Link
                              href={`/student/${seat.studentId}`}
                              className="hover:text-red-600 dark:hover:text-red-400 hover:underline"
                            >
                              {seat.studentId}
                            </Link>
                          </td>
                          <td className="py-2 px-4 font-sans text-zinc-700 dark:text-zinc-300">
                            {seat.name || "-"}
                          </td>
                          <td className="py-2 px-4 font-sans">
                            <MajorBadge major={seat.major} />
                          </td>
                          <td className="py-2 px-4 text-center font-bold text-red-600 dark:text-red-400">
                            {seat.seat || "-"}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <SourceRef source={seat.source} compact />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} />
    </>
  );
}

function RoomSkeleton() {
  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
    </main>
  );
}
