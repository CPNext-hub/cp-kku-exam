import type { Metadata } from "next";
import { Prompt, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const prompt = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบค้นหาตารางสอบ CP KKU | กลางภาค 1/2569",
  description:
    "ระบบค้นหาตารางสอบกลางภาค ภาคการศึกษา 1/2569 วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น ค้นหารหัสนักศึกษา รายวิชา ห้องสอบ พร้อมอ้างอิงตรงไปยัง Google Sheets ต้นฉบับ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={cn("h-full", "antialiased", prompt.variable, geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
