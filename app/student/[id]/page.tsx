import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamData, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceRef } from "@/components/SourceRef";
import { StatusBadge, SecBadge, MajorBadge } from "@/components/Badge";

export default function StudentPage({ params }: PageProps<"/student/[id]">) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <Suspense fallback={<StudentSkeleton />}>
        <StudentContent params={params} />
      </Suspense>
    </div>
  );
}

async function StudentContent({ params }: Pick<PageProps<"/student/[id]">, "params">) {
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
            {student.exams.length} วิชาที่สอบ
          </span>
        </div>

        {/* Student Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                  ตารางสอบนักศึกษา
                </span>
                {student.major && <MajorBadge major={student.major} />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-mono font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {student.studentId}
              </h1>
              {student.name ? (
                <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mt-1">
                  {student.name}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 mt-1">
                  (ไม่มีการระบุชื่อ-สกุลในไฟล์ประกาศ ให้ยึดรหัสนักศึกษาเป็นหลัก)
                </p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-500">สอบทั้งหมด</span>
              <p className="text-3xl font-black text-red-600 dark:text-red-400">
                {student.exams.length}{" "}
                <span className="text-sm font-normal text-zinc-500">วิชา</span>
              </p>
            </div>
          </div>
        </div>

        {/* Exam Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            กำหนดการสอบเรียงตามวันและเวลา
          </h2>

          <div className="space-y-4">
            {student.exams.map(({ seat, block }) => {
              const isCancelled = block.status === "cancelled";

              return (
                <div
                  key={block.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCancelled
                      ? "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/course/${block.courseSlug}`}
                          className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {block.courseCode}
                        </Link>
                        <SecBadge sec={block.sec} />
                        <StatusBadge status={block.status} />
                        {block.note && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {block.note}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {block.courseName}
                      </h3>
                      {block.program && (
                        <p className="text-xs text-zinc-500 mt-0.5">{block.program}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <SourceRef source={seat.source} />
                    </div>
                  </div>

                  {/* Highlights: Seat, Room, Date & Time */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Seat Number */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        เลขที่นั่งสอบ
                      </span>
                      <p className="text-3xl font-black font-mono text-red-600 dark:text-red-400 mt-0.5">
                        {seat.seat || "-"}
                      </p>
                      <span className="text-[11px] text-zinc-400">
                        ลำดับที่ {seat.no}
                      </span>
                    </div>

                    {/* Room */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        ห้องสอบ
                      </span>
                      {isCancelled ? (
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                          ยกเลิกการสอบ
                        </p>
                      ) : (
                        <Link
                          href={`/room/${encodeURIComponent(block.room)}`}
                          className="block text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors mt-0.5"
                        >
                          {block.room}
                        </Link>
                      )}
                      <span className="text-[11px] text-zinc-400">
                        {isCancelled ? "วิชานี้ไม่มีการจัดสอบ" : "คลิกเพื่อดูห้อง"}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        วันและเวลาสอบ
                      </span>
                      <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {block.date}
                      </p>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mt-0.5">
                        {block.time}
                      </p>
                    </div>
                  </div>

                  {/* Session permalink */}
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <Link
                      href={`/session/${block.gid}`}
                      className="hover:underline hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      รอบสอบ: {block.tabName}
                    </Link>
                    <span className="text-[11px] font-mono text-zinc-400">
                      แถว {seat.row}
                    </span>
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

function StudentSkeleton() {
  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
    </main>
  );
}
