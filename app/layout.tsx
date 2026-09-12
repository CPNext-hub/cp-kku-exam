import type { Metadata, Viewport } from "next";
import { Anuphan, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getAcademicYear, getExamData } from "@/lib/data";
import "./globals.css";

const sans = Anuphan({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

const mono = Inter({
  subsets: ["latin"],
  variable: "--font-num",
  display: "swap",
  weight: ["400", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const academicYear = getAcademicYear(await getExamData());
  return {
    title: `ระบบค้นหาตารางสอบ CP KKU | กลางภาค 1/${academicYear}`,
    description: `ระบบค้นหาตารางสอบกลางภาค ภาคการศึกษา 1/${academicYear} วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น ค้นหารหัสนักศึกษา รายวิชา ห้องสอบ พร้อมอ้างอิงตรงไปยัง Google Sheets ต้นฉบับ`,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
