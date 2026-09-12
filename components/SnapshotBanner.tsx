import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SnapshotBannerProps {
  usedSnapshot: boolean;
}

export function SnapshotBanner({ usedSnapshot }: SnapshotBannerProps) {
  if (!usedSnapshot) return null;

  return (
    <div className="w-full bg-secondary border-b border-border py-2 px-4">
      <div className="max-w-[980px] mx-auto">
        <Alert className="rounded-[11px] border-border bg-background">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-semibold">กำลังใช้รายชื่อแท็บสำรอง (Snapshot)</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            ไม่สามารถเชื่อมต่อดึงรายชื่อแท็บสดจาก Google Sheets ได้ในขณะนี้ ระบบจึงสลับมาใช้ชุดแท็บสำรองล่าสุดที่ยืนยันแล้ว เว็บไซต์ยังคงใช้งานได้ตามปกติ
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
