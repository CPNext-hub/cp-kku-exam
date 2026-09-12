import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExamData, getExamTermLabel, buildIndexes } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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

          <BlockSummaryTable blocks={courseGroup.blocks} variant="course" />
        </div>
      </main>

      <Footer fetchedAt={data.fetchedAt} termLabel={getExamTermLabel(data)} />
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
