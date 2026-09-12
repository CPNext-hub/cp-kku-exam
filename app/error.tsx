"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-semibold">โหลดข้อมูลตารางสอบไม่สำเร็จ</h1>
      <p className="max-w-xl text-sm text-muted-foreground">
        ค้นแท็บไม่สำเร็จ และ snapshot สำรองเป็นของ Sheet คนละไฟล์ ใช้แทนกันไม่ได้
      </p>
      <Button onClick={reset} variant="outline">
        ลองอีกครั้ง
      </Button>
    </main>
  );
}
