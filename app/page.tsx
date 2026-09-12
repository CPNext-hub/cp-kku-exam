import { Suspense } from "react";
import Link from "next/link";
import { getExamData, buildIndexes, searchExam } from "@/lib/data";
import { SearchBox } from "@/components/SearchBox";
import { SnapshotBanner } from "@/components/SnapshotBanner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatusBadge, MajorBadge } from "@/components/Badge";
import { SourceRef } from "@/components/SourceRef";

export default function Page({ searchParams }: PageProps<"/">) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function HomeContent({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";

  const data = await getExamData();
  const indexes = buildIndexes(data);
  const { summary } = indexes;

  const searchResults = q ? searchExam(q, indexes) : null;

  // Sort sessions chronologically
  const sortedSessions = Array.from(indexes.bySession.values()).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  );

  // Distinct courses
  const distinctCourses = Array.from(
    new Map(
      Array.from(indexes.byCourse.values()).map((c) => [c.code, c])
    ).values()
  ).sort((a, b) => a.code.localeCompare(b.code));

  // Distinct rooms
  const distinctRooms = Array.from(indexes.byRoom.values()).sort((a, b) =>
    a.room.localeCompare(b.room)
  );

  return (
    <>
      <SnapshotBanner usedSnapshot={data.usedSnapshot} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
            <span>ตารางสอบกลางภาค ภาคการศึกษา 1/2569</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            ระบบค้นหาตารางสอบ CP KKU
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            ค้นหาเลขที่นั่งสอบ ห้องสอบ วัน-เวลาสอบ พร้อมอ้างอิงตรงกลับไปยัง Google Sheet ต้นทางแบบแถวต่อแถว
          </p>

          <div className="pt-2">
            <SearchBox initialQuery={q} autoFocus={!q} />
          </div>
        </section>

        {/* If searching, render Search Results */}
        {searchResults ? (
          <section className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-bold">
                ผลการค้นหาสำหรับ &ldquo;<span className="text-red-600 dark:text-red-400">{q}</span>&rdquo;
              </h2>
              <Link
                href="/"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
              >
                ล้างการค้นหา
              </Link>
            </div>

            {/* Privacy Notice */}
            {searchResults.privacyNotice && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="font-semibold">ข้อกำหนดความเป็นส่วนตัว</p>
                  <p className="text-xs mt-0.5 opacity-90">{searchResults.privacyNotice}</p>
                </div>
              </div>
            )}

            {/* Students results */}
            {searchResults.students.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  นักศึกษา ({searchResults.students.length} รายการ)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.students.map((st) => (
                    <Link
                      key={st.studentId}
                      href={`/student/${st.studentId}`}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-red-500 dark:hover:border-red-500 transition-all hover:shadow-md group block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                            {st.studentId}
                          </p>
                          {st.name && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                              {st.name}
                            </p>
                          )}
                        </div>
                        {st.major && <MajorBadge major={st.major} />}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
                        <span>มีสิทธิ์สอบ {st.examCount} วิชา</span>
                        <span className="text-red-600 dark:text-red-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          ดูตารางสอบ →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Courses results */}
            {searchResults.courses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  รายวิชา ({searchResults.courses.length} รายการ)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.courses.map((c) => (
                    <Link
                      key={c.code}
                      href={`/course/${c.slug}`}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md group block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {c.code}
                          </span>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 group-hover:text-blue-600 transition-colors">
                            {c.name}
                          </h4>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
                          {c.totalSeats} ที่นั่ง
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
                        <span>{c.blocks.length} กลุ่มสอบ/ห้องสอบ</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          ดูรายละเอียดวิชา →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms results */}
            {searchResults.rooms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  ห้องสอบ ({searchResults.rooms.length} รายการ)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {searchResults.rooms.map((r) => (
                    <Link
                      key={r.room}
                      href={`/room/${encodeURIComponent(r.room)}`}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-md group block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition-colors">
                          {r.room}
                        </span>
                        {r.isCancelled && <StatusBadge status="cancelled" />}
                      </div>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex justify-between">
                        <span>{r.blocks.length} บล็อก</span>
                        <span>{r.totalSeats} ที่นั่ง</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Majors results */}
            {searchResults.majors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  สาขาวิชา ({searchResults.majors.length} สาขา)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchResults.majors.map((m) => (
                    <div
                      key={m.major}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <MajorBadge major={m.major} />
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        นักศึกษา {m.studentCount} คน ({m.seatCount} ที่นั่งสอบ)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {searchResults.students.length === 0 &&
              searchResults.courses.length === 0 &&
              searchResults.rooms.length === 0 &&
              searchResults.majors.length === 0 &&
              !searchResults.privacyNotice && (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                  <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                    ไม่พบข้อมูลที่ตรงกับคำค้นหา
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    ลองตรวจสอบรหัสนักศึกษา (เช่น 683380531-4), รหัสวิชา หรือชื่อห้องสอบอีกครั้ง
                  </p>
                </div>
              )}
          </section>
        ) : (
          /* Default Dashboard View */
          <div className="space-y-10">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">รอบสอบทั้งหมด</p>
                <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">
                  {summary.totalBlocks > 0 ? sortedSessions.length : 0}{" "}
                  <span className="text-xs font-normal text-zinc-500">session</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">วิชาที่เปิดสอบ</p>
                <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">
                  {summary.uniqueCourses}{" "}
                  <span className="text-xs font-normal text-zinc-500">วิชา</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">ห้องสอบ</p>
                <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">
                  {summary.uniqueRooms}{" "}
                  <span className="text-xs font-normal text-zinc-500">ห้อง</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">จำนวนที่นั่งสอบ</p>
                <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">
                  {summary.totalSeats.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-zinc-500">ที่นั่ง</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm col-span-2 sm:col-span-1">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">นักศึกษาที่มีสิทธิ์สอบ</p>
                <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">
                  {summary.uniqueStudents.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-zinc-500">คน</span>
                </p>
              </div>
            </div>

            {/* Regression Assertion Status Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-300">
                  ตรวจสอบความถูกต้องข้อมูล: <strong>{summary.totalBlocks} บล็อก</strong> ·{" "}
                  <strong>{summary.totalSeats.toLocaleString()} ที่นั่ง</strong> ·{" "}
                  <strong>{summary.uniqueStudents.toLocaleString()} รหัสนักศึกษา</strong> ·{" "}
                  <strong>{summary.uniqueCourses} วิชา</strong> ·{" "}
                  <strong>{summary.uniqueRooms} ห้อง</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                {summary.allBlocksHaveSec ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                    ✓ ทุกบล็อกมี SEC ครบ ({summary.totalBlocks}/{summary.totalBlocks})
                  </span>
                ) : (
                  <span className="text-amber-600 font-mono">
                    ⚠ มีบล็อกที่ไม่มี SEC
                  </span>
                )}
              </div>
            </div>

            {/* Session Tabs Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    รอบสอบตามวันและเวลา (11 Session)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    เรียงตามลำดับเวลาจริง (วันที่ 24 - 28 ส.ค. 2569)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedSessions.map((session) => (
                  <Link
                    key={session.gid}
                    href={`/session/${session.gid}`}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 hover:shadow-md transition-all group block"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                          {session.tab}
                        </span>
                        {session.tab.includes("กักตัว") && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.2 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            ห้องกักตัว
                          </span>
                        )}
                      </div>
                      <SourceRef source={{ gid: session.gid, tab: session.tab, row: 1 }} compact />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                      <span>{session.blocks.length} กลุ่มสอบ</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {session.totalSeats.toLocaleString()} ที่นั่ง
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Courses Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    รายวิชาทั้งหมด ({distinctCourses.length} วิชา)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    เลือกดูรายละเอียด กลุ่มเรียน (SEC) ห้องสอบ และรายชื่อตามวิชา
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {distinctCourses.map((c) => (
                  <Link
                    key={c.code}
                    href={`/course/${c.slug}`}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group block"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {c.code}
                        </span>
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate mt-0.5 group-hover:text-blue-600 transition-colors">
                          {c.name}
                        </h3>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                        {c.totalSeats} ที่นั่ง
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{c.blocks.length} กลุ่ม/ห้อง</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        ดูรายละเอียด →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Rooms Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    ห้องสอบทั้งหมด ({distinctRooms.length} ห้อง/สถานะ)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    ตารางการใช้ห้องสอบแยกตามอาคารและห้อง
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {distinctRooms.map((r) => (
                  <Link
                    key={r.room}
                    href={`/room/${encodeURIComponent(r.room)}`}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all group block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition-colors">
                        {r.room}
                      </span>
                      {r.isCancelled && <StatusBadge status="cancelled" />}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{r.blocks.length} บล็อก</span>
                      <span>{r.totalSeats} ที่นั่ง</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer fetchedAt={data.fetchedAt} />
    </>
  );
}

function HomeSkeleton() {
  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-8">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto" />
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-auto" />
        <div className="h-4 w-80 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
      </div>
      <div className="h-14 max-w-2xl mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
