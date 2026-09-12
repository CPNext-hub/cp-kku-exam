import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { StatusBadge, SecBadge, MajorBadge } from "@/components/Badge";

export default function CoursePage({ params }: PageProps<"/course/[code]">) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <Suspense fallback={<CourseSkeleton />}>
        <CourseContent params={params} />
      </Suspense>
    </div>
  );
}

async function CourseContent({ params }: Pick<PageProps<"/course/[code]">, "params">) {
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
            {courseGroup.blocks.length} กลุ่มสอบ/ห้องสอบ
          </span>
        </div>

        {/* Course Header Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                ข้อมูลรายวิชา
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h1 className="text-2xl sm:text-3xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                  {courseGroup.code}
                </h1>
              </div>
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mt-1">
                {courseGroup.name}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-500">จำนวนที่นั่งสอบรวม</span>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {courseGroup.totalSeats.toLocaleString()}{" "}
                <span className="text-sm font-normal text-zinc-500">ที่นั่ง</span>
              </p>
            </div>
          </div>
        </div>

        {/* Exam Blocks */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              กลุ่มสอบและห้องสอบ ({courseGroup.blocks.length} บล็อก)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              แสดงแยกแต่ละกลุ่มสอบและห้องสอบตามเอกสารประกาศจริง (ไม่ยุบรวม)
            </p>
          </div>

          <div className="space-y-6">
            {courseGroup.blocks.map((block, index) => {
              const isCancelled = block.status === "cancelled";

              return (
                <div
                  key={block.id}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isCancelled
                      ? "bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
                  }`}
                >
                  {/* Block Header */}
                  <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-400">
                          บล็อกที่ {index + 1}
                        </span>
                        <SecBadge sec={block.sec} />
                        <StatusBadge status={block.status} />
                        {block.program && (
                          <span className="text-xs text-zinc-500 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                            {block.program}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm pt-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          ห้อง:{" "}
                          {isCancelled ? (
                            <span className="text-red-600 font-bold">ยกเลิกการสอบ</span>
                          ) : (
                            <Link
                              href={`/room/${encodeURIComponent(block.room)}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-mono font-bold"
                            >
                              {block.room}
                            </Link>
                          )}
                        </span>
                        <span>·</span>
                        <Link
                          href={`/session/${block.gid}`}
                          className="text-zinc-600 dark:text-zinc-400 hover:underline"
                        >
                          {block.date} ({block.time})
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

                  {/* Student Seats Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
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
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
    </main>
  );
}
