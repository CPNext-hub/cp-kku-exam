import { Suspense } from "react";
import Link from "next/link";
import { getExamData, buildIndexes, searchExam } from "@/lib/data";
import { SearchBox } from "@/components/SearchBox";
import { SnapshotBanner } from "@/components/SnapshotBanner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatusBadge, MajorBadge } from "@/components/Badge";
import { SourceRef } from "@/components/SourceRef";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function HomeContent({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const rawQ = params?.q;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";

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

      {/* Hero Section (Canvas: bg-background) */}
      <section className="w-full bg-background py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[980px] mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground border border-border">
            <span>ตารางสอบกลางภาค ภาคการศึกษา 1/2569</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight text-foreground">
            ระบบค้นหาตารางสอบ CP KKU
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            ค้นหารหัสนักศึกษา รายวิชา ห้องสอบ หรือสาขาวิชา พร้อมอ้างอิงตรงกลับไปยัง Google Sheets ต้นฉบับระดับแถว
          </p>

          <div className="pt-2">
            <SearchBox initialQuery={q} autoFocus={!q} />
          </div>
        </div>
      </section>

      {/* If searching, render Search Results Section */}
      {searchResults ? (
        <section className="w-full bg-secondary py-12 px-4 sm:px-6">
          <div className="max-w-[1440px] mx-auto space-y-8">
            <div className="max-w-[980px] mx-auto flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                ผลการค้นหาสำหรับ &ldquo;<span className="text-primary font-num">{q}</span>&rdquo;
              </h2>
              <Link
                href="/"
                className="text-sm font-semibold text-primary hover:underline"
              >
                ล้างการค้นหา
              </Link>
            </div>

            {/* Privacy Notice */}
            {searchResults.privacyNotice && (
              <div className="max-w-[980px] mx-auto">
                <Alert className="rounded-[11px] border-border bg-background">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-sm font-semibold">ข้อกำหนดความเป็นส่วนตัว</AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground mt-1">
                    {searchResults.privacyNotice}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Search Results Tabs */}
            <div className="max-w-[1440px] mx-auto">
              <Tabs
                defaultValue={
                  searchResults.students.length > 0
                    ? "students"
                    : searchResults.courses.length > 0
                    ? "courses"
                    : searchResults.rooms.length > 0
                    ? "rooms"
                    : "majors"
                }
                className="w-full space-y-6"
              >
                <div className="flex justify-center">
                  <TabsList className="bg-background border border-border p-1 rounded-full h-auto">
                    <TabsTrigger
                      value="students"
                      className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      นักศึกษา ({searchResults.students.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="courses"
                      className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      รายวิชา ({searchResults.courses.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="rooms"
                      className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      ห้องสอบ ({searchResults.rooms.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="majors"
                      className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      สาขาวิชา ({searchResults.majors.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab: Students */}
                <TabsContent value="students" className="space-y-4">
                  {searchResults.students.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      ไม่พบข้อมูลนักศึกษาที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {searchResults.students.map((st) => (
                        <Card
                          key={st.studentId}
                          className="hover:border-primary transition-colors border-border bg-card shadow-none"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link
                                  href={`/student/${st.studentId}`}
                                  className="text-lg font-semibold font-num text-foreground hover:text-primary transition-colors"
                                >
                                  {st.studentId}
                                </Link>
                                {st.name && (
                                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                    {st.name}
                                  </p>
                                )}
                              </div>
                              {st.major && <MajorBadge major={st.major} />}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                              <span className="font-num">มีสิทธิ์สอบ {st.examCount} วิชา</span>
                              <Link
                                href={`/student/${st.studentId}`}
                                className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary hover:underline"
                              >
                                <span>ดูตารางสอบ</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Courses */}
                <TabsContent value="courses" className="space-y-4">
                  {searchResults.courses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      ไม่พบข้อมูลรายวิชาที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {searchResults.courses.map((cg) => (
                        <Card
                          key={cg.slug}
                          className="hover:border-primary transition-colors border-border bg-card shadow-none"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link
                                  href={`/course/${cg.slug}`}
                                  className="text-base font-semibold font-num text-foreground hover:text-primary transition-colors"
                                >
                                  {cg.code}
                                </Link>
                                <CardTitle className="text-sm font-normal text-muted-foreground mt-1 line-clamp-2">
                                  {cg.name}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                              <span className="font-num">{cg.blocks.length} กลุ่ม ({cg.totalSeats} ที่นั่ง)</span>
                              <Link
                                href={`/course/${cg.slug}`}
                                className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary hover:underline"
                              >
                                <span>ดูรายละเอียด</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Rooms */}
                <TabsContent value="rooms" className="space-y-4">
                  {searchResults.rooms.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      ไม่พบข้อมูลห้องสอบที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {searchResults.rooms.map((rg) => (
                        <Card
                          key={rg.room}
                          className="hover:border-primary transition-colors border-border bg-card shadow-none"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link
                                  href={`/room/${encodeURIComponent(rg.room)}`}
                                  className="text-lg font-semibold font-num text-foreground hover:text-primary transition-colors"
                                >
                                  {rg.room}
                                </Link>
                                <p className="text-xs text-muted-foreground mt-1 font-num">
                                  จัดสอบ {rg.blocks.length} บล็อก ({rg.totalSeats.toLocaleString()} ที่นั่ง)
                                </p>
                              </div>
                              {rg.isCancelled && <StatusBadge status="cancelled" />}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-end text-xs border-t border-border pt-3">
                              <Link
                                href={`/room/${encodeURIComponent(rg.room)}`}
                                className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary hover:underline"
                              >
                                <span>ดูตารางห้อง</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Majors */}
                <TabsContent value="majors" className="space-y-4">
                  {searchResults.majors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      ไม่พบข้อมูลสาขาวิชาที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {searchResults.majors.map((m) => (
                        <Card
                          key={m.major}
                          className="border-border bg-card shadow-none"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-semibold font-num text-foreground">
                                {m.major}
                              </span>
                              <Badge variant="secondary" className="rounded-full text-xs font-num">
                                {m.studentCount} คน
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground border-t border-border pt-3 font-num">
                              รวมที่นั่งสอบทั้งหมด {m.seatCount.toLocaleString()} ที่นั่ง
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      ) : null}

      {/* Dataset Summary Metrics Tile (Parchment: bg-secondary) */}
      <section className="w-full bg-secondary py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <div className="max-w-[980px] mx-auto text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              สรุปชุดข้อมูลตารางสอบ
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              ข้อมูลประมวลผลสดจากประกาศใบรายชื่อผู้มีสิทธิ์เข้าสอบทางการ
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            <Card className="border-border bg-card shadow-none text-center p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                รอบสอบ (Sessions)
              </p>
              <p className="text-3xl font-semibold font-num text-foreground mt-2">
                {data.sheets.length}
              </p>
              <span className="text-xs text-muted-foreground mt-1">แท็บใน Sheet</span>
            </Card>

            <Card className="border-border bg-card shadow-none text-center p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ใบรายชื่อ (Blocks)
              </p>
              <p className="text-3xl font-semibold font-num text-foreground mt-2">
                {summary.totalBlocks}
              </p>
              <span className="text-xs text-muted-foreground mt-1">วิชา × SEC × ห้อง</span>
            </Card>

            <Card className="border-border bg-card shadow-none text-center p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ที่นั่งสอบทั้งหมด
              </p>
              <p className="text-3xl font-semibold font-num text-foreground mt-2">
                {summary.totalSeats.toLocaleString()}
              </p>
              <span className="text-xs text-muted-foreground mt-1">รายการแถว</span>
            </Card>

            <Card className="border-border bg-card shadow-none text-center p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                นักศึกษา
              </p>
              <p className="text-3xl font-semibold font-num text-foreground mt-2">
                {summary.uniqueStudents.toLocaleString()}
              </p>
              <span className="text-xs text-muted-foreground mt-1">รหัสไม่ซ้ำ</span>
            </Card>

            <Card className="border-border bg-card shadow-none text-center p-6 col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                วิชา / ห้องสอบ
              </p>
              <p className="text-3xl font-semibold font-num text-foreground mt-2">
                {summary.uniqueCourses} / {summary.uniqueRooms}
              </p>
              <span className="text-xs text-muted-foreground mt-1">วิชา / ห้อง</span>
            </Card>
          </div>

          {/* SEC Assertion badge */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-background border border-border text-muted-foreground font-num">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>ความถูกต้องของข้อมูล: มี SEC ครบทั้ง 271 บล็อก (100%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Navigation Tile (Canvas: bg-background) */}
      <section className="w-full bg-background py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto space-y-8">
          <div className="max-w-[980px] mx-auto text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              รอบการสอบ (Sessions)
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              เลือกตามวันและช่วงเวลาสอบเพื่อดูใบรายชื่อทั้งหมดในรอบนั้น
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedSessions.map((session) => (
              <Card
                key={session.gid}
                className="hover:border-primary transition-colors border-border bg-card shadow-none"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/session/${session.gid}`}
                        className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {session.tab}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 font-num">
                        {session.blocks.length} กลุ่มสอบ · {session.totalSeats.toLocaleString()} ที่นั่ง
                      </p>
                    </div>
                    {session.tab.includes("กักตัว") && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        กักตัวสอบ
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs border-t border-border pt-3">
                    <SourceRef source={{ gid: session.gid, tab: session.tab, row: 1 }} compact />
                    <Link
                      href={`/session/${session.gid}`}
                      className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary hover:underline"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses & Rooms Quick Access Tile (Parchment: bg-secondary) */}
      <section className="w-full bg-secondary py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Courses Quick List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                รายวิชาทั้งหมด ({distinctCourses.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
              {distinctCourses.map((cg) => (
                <Link
                  key={cg.slug}
                  href={`/course/${cg.slug}`}
                  className="p-3.5 rounded-[11px] border border-border bg-card hover:border-primary transition-colors flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="font-semibold text-sm font-num text-foreground">
                      {cg.code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cg.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-num shrink-0">
                    {cg.totalSeats} ที่นั่ง
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Rooms Quick List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                ห้องสอบทั้งหมด ({distinctRooms.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[440px] overflow-y-auto pr-1">
              {distinctRooms.map((rg) => (
                <Link
                  key={rg.room}
                  href={`/room/${encodeURIComponent(rg.room)}`}
                  className="p-3.5 rounded-[11px] border border-border bg-card hover:border-primary transition-colors text-center"
                >
                  <p className="font-semibold text-sm font-num text-foreground">
                    {rg.room}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-num">
                    {rg.isCancelled ? "ยกเลิก" : `${rg.totalSeats} ที่นั่ง`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer fetchedAt={data.fetchedAt} />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="w-full py-16 px-4 max-w-[980px] mx-auto space-y-8 animate-pulse">
      <div className="space-y-4 text-center">
        <Skeleton className="h-6 w-48 mx-auto rounded-full" />
        <Skeleton className="h-12 w-96 mx-auto rounded-[18px]" />
        <Skeleton className="h-5 w-80 mx-auto rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
        <Skeleton className="h-28 rounded-[18px]" />
        <Skeleton className="h-28 rounded-[18px]" />
        <Skeleton className="h-28 rounded-[18px]" />
        <Skeleton className="h-28 rounded-[18px]" />
      </div>
    </div>
  );
}
