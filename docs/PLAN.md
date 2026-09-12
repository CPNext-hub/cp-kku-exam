# ระบบค้นหาตารางสอบ CP KKU (ข้อมูลจาก Google Sheets + อ้างอิงกลับได้)

## Context

`cp-kku-exam` ตอนนี้ยังเป็น scaffold เปล่าของ `create-next-app` (Next.js 16.3.5, React 19, Tailwind v4, bun) — มีแค่ `app/layout.tsx` กับ `app/page.tsx` ยังไม่มีโค้ดจริง

ต้องการ: ระบบค้นหาที่ดึงข้อมูลจาก Google Sheet **"รายชื่อผู้มีสิทธิ์เข้าสอบกลางภาค 1/2569"**
(`1QKxbCrHSy2NyUbMuJPw5UT36nouo8DKw`) และทุกข้อมูลที่แสดงต้อง **ref กลับไปยังต้นทางได้**

### สิ่งที่ตรวจสอบจาก Sheet จริงแล้ว (ยืนยันด้วยการ export CSV/xlsx)

- Sheet เป็น public → `export?format=csv&gid=<gid>` ได้เลย ไม่ต้องใช้ API key / service account
- **11 แท็บ** = 1 แท็บต่อ session (วันที่ + เช้า/บ่าย) + 1 แท็บ "กักตัวสอบ"
- **271 บล็อก** (ใบรายชื่อผู้เข้าสอบ 1 ใบ = วิชา × SEC × ห้อง × session)
- **4,928 แถวที่นั่ง**, **1,759 รหัสนักศึกษาไม่ซ้ำ**, 35 รหัสวิชา, 14 ห้อง, 9 สาขา, 2 หลักสูตร (ภาคปกติ / โครงการพิเศษ)
- เฉลี่ย 2.8 วิชา/คน (สูงสุด 5) — **ไม่มีใครสอบชนกันใน session เดียวกัน** และไม่มีเลขที่นั่งซ้ำในบล็อกเดียวกัน
- ⚠️ **คอลัมน์ "ชื่อ - สกุล" ว่าง 4,832 จาก 4,928 แถว** (มีชื่อจริงเฉพาะ CP422001 รวม 96 แถว)
  → ระบบจึงค้นด้วย **รหัสนักศึกษาเป็นหลัก** (ตามที่ผู้ใช้เลือก) และค้นชื่อได้เฉพาะแถวที่มีชื่อจริง

### โครงสร้าง 1 บล็อกใน CSV (row number = บรรทัดใน Sheet ตรงตัว)

```
row 1  A=ใบรายชื่อผู้เข้าสอบ          G=ประกาศ...
row 2  A=รายวิชา    B=LI101001 : ENGLISH I          F=SEC. 15
row 3  A=ห้องสอบ    B=SC.7401        D=ปริญญาตรี ภาคปกติ
row 4  A=วันที่สอบ  B=28-ส.ค.-69     (D=กักตัวสอบ เฉพาะแท็บกักตัว)
row 5  A=เวลาสอบ    B=13.00-16.00 น.
row 6  A=ลำดับที่  B=รหัสนักศึกษา  C=ชื่อ - สกุล  D=สาขาวิชา  E=เลขที่นั่งสอบ  F=ลายมือชื่อ
row 7  1  683380531-4      (ชื่อว่าง)  CP-Cy   A1
```

---

## ตัดสินใจแล้ว

| ประเด็น | เลือก |
|---|---|
| Data source | ดึงสดตอน runtime + cache (`use cache` / `cacheLife('hours')`) |
| ขอบเขต | หน้าค้นหา + หน้า ref ครบ (`/student`, `/course`, `/room`, `/session`) |
| การค้นหา | รหัสนักศึกษาเป็นหลัก + ค้น วิชา/ห้อง/สาขา ได้ด้วย |

---

## สถาปัตยกรรม

ไม่ใช้ database — 4,928 แถวสร้าง index ใน memory ภายใน cached function ก็พอ
ไม่ใช้ไลบรารีอ่าน xlsx (ตัวที่นิยมอยู่นอก npm registry แล้ว) — **ใช้ CSV export ต่อ gid** เพราะ:
CSV ให้วันที่เป็นข้อความไทยแล้ว (`28-ส.ค.-69`) ขณะที่ xlsx ให้ serial `25443` ที่ถอดออกมาเป็น ค.ศ. 1969 (พ.ศ. เพี้ยน),
และเลขบรรทัด CSV ตรงกับเลขแถวใน Sheet 1:1 ซึ่งจำเป็นสำหรับลิงก์ ref

### ไฟล์ที่จะสร้าง

**`lib/sheet-source.ts`** — ค่าคงที่ + ตัวสร้าง URL (**ไม่ hardcode gid**)

```ts
export const SPREADSHEET_ID =
  process.env.EXAM_SHEET_ID ?? "1QKxbCrHSy2NyUbMuJPw5UT36nouo8DKw";

const base = (id = SPREADSHEET_ID) =>
  `https://docs.google.com/spreadsheets/d/${id}`;

export const htmlViewUrl = () => `${base()}/htmlview`;          // ใช้ค้นหาแท็บ
export const csvUrl = (gid: string) => `${base()}/export?format=csv&gid=${gid}`;
// ลิงก์ ref กลับไปยังแถวจริงใน Sheet — gid อยู่ใน fragment ตามรูปแบบที่ Sheets เองใช้
export const sourceUrl = (gid: string, row: number) =>
  `${base()}/edit#gid=${gid}&range=A${row}`;
```

**`lib/discover.ts`** — ⭐ ค้นหาแท็บ + gid เองอัตโนมัติ (แทนการ hardcode)

`GET https://docs.google.com/spreadsheets/d/<id>/htmlview` (public, ไม่ต้อง API key, ~55KB)
คืน HTML ที่ฝัง **รายชื่อแท็บครบทุกอันพร้อม gid เรียงตามลำดับในไฟล์จริง** — ทดสอบแล้วได้ครบ 11/11 ตรงทั้งชื่อและลำดับ:

```html
items.push({name: "28 ส.ค. 69 (บ่าย)", pageUrl: "…&gid=1447075755", gid: "1447075755", …});
```

```ts
const RE = /items\.push\(\{name:\s*"((?:[^"\\]|\\.)*)"[^}]*?gid:\s*"(\d+)"/g;

export async function discoverSheets(): Promise<SheetRef[]> {
  "use cache";
  cacheLife("days");   // รายชื่อแท็บเปลี่ยนน้อยกว่าเนื้อข้อมูลมาก
  cacheTag("exam-sheets");
  const html = await fetch(htmlViewUrl()).then((r) => r.text());
  const found = [...html.matchAll(RE)].map(([, name, gid]) => ({
    gid,
    tab: JSON.parse(`"${name}"`),   // ชื่อแท็บถูก escape มาในรูปแบบ JS string
  }));
  if (found.length === 0) throw new SheetDiscoveryError();
  return found;
}
```

**`lib/sheet-snapshot.json`** — safety net: gid map ชุดล่าสุดที่ยืนยันแล้ว commit ไว้ในรีโป โดยเก็บ `spreadsheetId`, วันที่จับ snapshot และ `tabs` ไว้ด้วย
ถ้า `discoverSheets()` พัง (Google เปลี่ยนรูปแบบ HTML / โดน rate limit) → ใช้ snapshot ได้เฉพาะเมื่อ `spreadsheetId` ตรงกับ `EXAM_SHEET_ID` เท่านั้น พร้อมขึ้น banner เตือนว่ากำลังใช้รายชื่อแท็บสำรอง
ถ้าเป็นคนละไฟล์ ระบบจะหยุดพร้อมข้อความ error ชัดเจน แทนการแสดงข้อมูลเพียงบางแท็บจาก gid ของไฟล์เก่า
มีสคริปต์ `bun run sync:sheets` เขียนทับ snapshot จากผลค้นหาล่าสุด (รันเมื่อยืนยันว่าข้อมูลถูก)

**ผลลัพธ์: เทอมหน้าเปลี่ยน Sheet ได้โดยตั้ง `EXAM_SHEET_ID` แล้วรัน sync ก่อน deploy** แท็บ/gid/วิชา/ห้อง ระบบไล่เก็บเองทั้งหมด

ขั้นตอนเปลี่ยน Sheet:
1. ตั้ง `EXAM_SHEET_ID` และ `EXAM_TERM_LABEL` ใน `.env` หรือ environment ของ deployment (เช่น `ปลายภาค ภาคปลาย ปีการศึกษา 2568`) และตั้ง `REVALIDATE_SECRET` ที่เป็นความลับ
2. รัน `bun run sync:sheets` เพื่อบันทึก snapshot ของไฟล์ใหม่ แล้วตรวจจำนวนแท็บ/บล็อก/ที่นั่ง/วิชา/ห้องจากหน้าแรก
3. deploy เมื่อยอดรวมและลิงก์อ้างอิงไปยังแถวต้นทางถูกต้อง

> ทางเลือกที่ทดสอบแล้ว **ตัดทิ้ง**: `gviz/tq` (อ้างแท็บด้วยชื่อได้ ไม่ต้องรู้ gid) — แต่มันยุบ 5 แถวหัวใบรายชื่อเข้าเป็น header เดียวและทำเลขแถวเพี้ยน ใช้ทำ ref ไม่ได้
> Google Sheets API v4 ก็ตัด เพราะไฟล์นี้เป็น xlsx ที่อัปโหลดเข้า Drive (id 33 ตัว) ไม่ใช่ native Sheet + ต้องมี API key

> เรื่องลิงก์ ref: ยังไม่ได้พิสูจน์ว่า `range=` ทำงานกับไฟล์ xlsx ที่อัปโหลด (ทดสอบด้วย curl ไม่ได้ เพราะเป็น client-side navigation)
> **Fallback ที่ต้องมีเสมอ:** แสดง `ชื่อแท็บ + เลขแถว` เป็นข้อความที่มองเห็นได้เสมอ (นี่คือ ref ที่ไม่มีวันพัง) ถ้ากดแล้ว `range=` ไม่พาไปแถวนั้น ให้ลดเหลือ `#gid=<gid>` — ฟีเจอร์หลักต้องไม่ผูกกับ query param ที่ยังไม่ยืนยัน

**`lib/csv.ts`** — parser ขนาดเล็กแบบ RFC4180 (รองรับ quote/escape/newline ในเซลล์)
คืนค่า `{ row: number; cells: string[] }[]` โดย `row` เป็นเลขบรรทัด **1-based ตรงกับ Sheet** และ **ต้องเก็บบรรทัดว่างไว้** ไม่ตัดทิ้ง (บล็อกคั่นด้วยบรรทัดว่างจำนวนมาก)

**`lib/parse.ts`** — แปลง CSV 1 แท็บ → `ExamBlock[]`

กติกา parse (มาจากการวิเคราะห์ข้อมูลจริง — ห้ามข้าม):

- เริ่มบล็อกใหม่เมื่อ `A === "ใบรายชื่อผู้เข้าสอบ"`
- อ่าน meta จากคอลัมน์ A: `รายวิชา`(B=วิชา, **F=SEC**) / `ห้องสอบ`(B=ห้อง, D=หลักสูตร) / `วันที่สอบ`(B=วันที่) / `เวลาสอบ`(B=เวลา); ข้ามแถว `ลำดับที่`
  ตรวจแล้วว่า SEC อยู่คอลัมน์ F ครบทั้ง 271 บล็อก แต่ให้เขียนแบบกันเหนียว: อ่าน F ก่อน ถ้าว่างค่อยสแกน C–G หาเซลล์ที่ match `/SEC\.?\s*\d+/`
- แถวที่นั่ง = `B` ตรงกับ `/^\d{9}-\d$/` → `{ no, studentId, name, major, seat, row }`
- **block id = `${gid}:${headerRow}` เท่านั้น** — ห้าม key ด้วย (วิชา+SEC+session) เพราะ CP321007 SEC. 01 วันที่ 26 บ่าย มี **3 บล็อกแยกห้อง** (27/27/19 คน) ถ้า merge จะข้อมูลหาย
- `ห้องสอบ === "ยกเลิกการสอบ"` → `status: "cancelled"`, ไม่ใช่ชื่อห้อง (มี 3 บล็อก)
- `SEC. 01` กับ `SEC. 1` ปนกันในไฟล์ → **เก็บ string ดิบไว้แสดงผล** normalize เฉพาะตอน match
- รหัสวิชา: รองรับทั้ง `/^\s*([A-Z]{2}\d{6})\s*:?\s*(.*)$/` และรูปแบบที่เว้นวรรคในตัวเลข (`SC 101 009`) โดย normalize เฉพาะ code สำหรับการ match/ทำ slug และเก็บชื่อดิบไว้แสดงผล — **ถ้าไม่ match ให้ fallback เป็นชื่อดิบ ห้าม throw** (มี 1 รายการรูปแบบเพี้ยน: `614201 TOXIC SUBSTANCES IN DAI…`)
  กรณี fallback ให้ key ของ `/course/[code]` เป็น slug จากชื่อดิบ (lowercase, ตัดอักขระพิเศษ, `-` แทนช่องว่าง) — วิชานั้นต้องยังเข้าถึงได้
- 3 บล็อกไม่มีวันที่/เวลา → fallback ใช้ชื่อแท็บ (ซึ่งเป็นชื่อ session ที่ถูกต้องอยู่แล้ว)
- ตัด `\t` / whitespace นำหน้าออกทุกเซลล์ (ค่า `รายวิชา` มี tab นำหน้า)
- **การเรียงลำดับเวลาต้องคำนวณจากข้อมูล ห้ามพึ่งลำดับแท็บ**: แปลง `24-ส.ค.-69` ด้วย map เดือนไทย (`ม.ค.`…`ธ.ค.`) + ปี พ.ศ. 2 หลัก (69 → 2569 → ค.ศ. 2026) แล้วรวมกับเวลาเริ่ม (`08.30` / `13.00`) เป็น sort key; ถ้าบล็อกไม่มีปี ให้ใช้ปีที่พบบ่อยที่สุดจากบล็อกอื่นในแท็บ และใช้ปีปัจจุบันเมื่อทั้งแท็บไม่มีปี
  (แท็บ "กักตัวสอบ" อยู่อันดับ 1 ในไฟล์ แต่จริง ๆ คือวันที่ 26 — ถ้าเรียงตามแท็บจะผิด)

**`lib/data.ts`** — ชั้น cache + index

```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getExamData() {
  "use cache";
  cacheLife("hours");
  cacheTag("exam-data");
  const sheets = await discoverSheets().catch(() => SNAPSHOT); // ← ไม่ hardcode
  // fetch CSV ทุกแท็บพร้อมกันด้วย Promise.all → parse → คืน plain arrays เท่านั้น
  return { blocks, seats, sheets, usedSnapshot, fetchedAt: new Date().toISOString() };
}
```

- ค่าที่ return ต้อง serializable → คืน **array/object ธรรมดา** เท่านั้น (ห้ามคืน `Map`)
- สร้าง `Map` index (byStudent / byCourse / byRoom / bySession) ใน helper **นอก** cached function — 5 พันแถวสร้างใหม่ต่อ request ถูกมาก
- ทุก seat เก็บ `source: { gid, tab, row }` ติดไปด้วย → หน้าไหนก็ ref ได้

**`next.config.ts`** — เปิด `cacheComponents: true`
(ยืนยันจาก `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` — `use cache` / `cacheLife` ใช้ได้ก็ต่อเมื่อเปิด flag นี้)

**`app/api/revalidate/route.ts`** — `POST` + secret header → `revalidateTag("exam-data")` สำหรับสั่ง refresh ทันทีเมื่อ Sheet แก้; ถ้าไม่ได้ตั้ง `REVALIDATE_SECRET` ให้ตอบ `503` และถ้าส่ง token ผิดให้ตอบ `401`

### หน้าเว็บ

| Route | เนื้อหา |
|---|---|
| `/` | ช่องค้นหา (form GET → `?q=`) + สรุปชุดข้อมูล (11 session, 35 วิชา, 14 ห้อง, 4,928 ที่นั่ง) + ลิงก์เข้า session/วิชา/ห้อง |
| `/?q=` | ผลลัพธ์แยกกลุ่ม: นักศึกษา / วิชา / ห้อง / สาขา |
| `/student/[id]` | ตารางสอบทั้งหมดของคนนั้น เรียงตามเวลา — วิชา, SEC, วัน, เวลา, ห้อง, **เลขที่นั่ง** (เน้นใหญ่), สถานะยกเลิก |
| `/course/[code]` | ทุกบล็อกของวิชา: SEC / ห้อง / วัน-เวลา / จำนวนคน |
| `/room/[room]` | ตารางใช้ห้องเรียงตาม session |
| `/session/[gid]` | ทุกบล็อกใน session นั้น |

- ทุกหน้าเป็น Server Component; `params` และ `searchParams` เป็น **Promise ต้อง `await`** (Next 16) — ใช้ helper type `PageProps<'/student/[id]'>` ที่ generate ให้อัตโนมัติ
- ⚠️ **บังคับใช้ `<Suspense>`**: เมื่อเปิด `cacheComponents` การอ่าน `searchParams`/`params` นอก Suspense boundary จะเจอ insight `blocking-prerender-runtime` แล้ว **build พัง**
  รูปแบบที่ถูกต้อง (ยืนยันจาก `docs/01-app/02-guides/migrating-to-cache-components.md:745-760`): page เป็น sync component ที่**ส่ง promise ลงไปทั้งก้อน** แล้ว `await` ในลูกที่ห่อด้วย Suspense

  ```tsx
  export default function Page({ searchParams }: PageProps<'/'>) {
    return <Suspense fallback={<SearchSkeleton />}>
      <Results searchParams={searchParams} />
    </Suspense>;
  }
  async function Results({ searchParams }: Pick<PageProps<'/'>, 'searchParams'>) {
    const { q } = await searchParams; // ...
  }
  ```
- `[room]` มีจุด (`SC.7401`) → `encodeURIComponent` ตอนสร้างลิงก์ และ decode ตอนอ่าน param

### การ ref กลับต้นทาง (หัวใจของงาน)

1. **ลิงก์ไป Sheet ระดับแถว** — ทุกแถวที่นั่ง/ทุกบล็อกมีปุ่ม `ที่มา: <ชื่อแท็บ> แถว <row> ↗` ชี้ไป
   `…/edit#gid=<gid>&range=A<row>` ซึ่งเปิดแล้ว Google จะ **เลื่อนไปแท็บและเซลล์นั้นจริง**
2. **Permalink ในระบบ** — `/student/<id>`, `/course/<code>`, `/room/<room>`, `/session/<gid>` คัดลอกส่งต่อได้
3. **ท้ายทุกหน้า**: `ข้อมูล ณ <fetchedAt>` + ลิงก์ Sheet ต้นฉบับ + อีเมลติดต่อ `benjch@kku.ac.th` (ตามประกาศในไฟล์) → cache เก่าจะมองเห็นได้ ไม่เงียบหาย

### ความเป็นส่วนตัว

Sheet เปิด public อยู่แล้ว แต่ระบบนี้ทำให้ค้นง่ายขึ้นมาก จึง:
- **ไม่มีหน้า "รายชื่อนักศึกษาทั้งหมด"** และไม่ใส่ sitemap ของ `/student/*`
- ค้นด้วยรหัสนักศึกษาต้องพิมพ์ **อย่างน้อย 8 หลัก** (กันไล่ enumerate), normalize ขีดกลาง/ช่องว่างก่อน match
- `app/robots.ts`: `Disallow: /student/` และ `Disallow: /block/`; หน้า `/student/[id]` และ `/block/[gid]/[row]` ส่ง `robots: { index: false, follow: false }`

### UI

**ดูรายละเอียดทั้งหมดที่ [`docs/DESIGN.md`](./DESIGN.md)** — ระบบดีไซน์ = โครง Apple design system + สี/โลโก้จาก CI จริงของวิทยาลัย

สรุปย่อ:
- **shadcn/ui** (new-york, Radix) บน Tailwind v4 ที่ติดตั้งมาแล้ว — `bunx shadcn@latest init -d --base radix`
- สีเดียวสำหรับทุก interaction: **CP Denim Blue `#1C75BC`** (โหมดมืดไล่เป็น `#60A5DC` เพราะสีเดิม contrast ตก), ตัวหนังสือ `#231F20`
- ฟอนต์ **Anuphan** (ไทย+ละติน) + **Inter** เฉพาะตัวเลข (tabular-nums), body 17px / line-height 1.65, **ห้าม letter-spacing ติดลบกับไทย**, ข้ามน้ำหนัก 500
- **เงาเดียวในระบบ** สงวนให้การ์ดเลขที่นั่งสอบ ที่เหลือใช้ hairline border
- ภาษาไทยเป็นหลัก, mobile-first (นักศึกษาเปิดจากมือถือหน้างาน), เน้น **เลขที่นั่ง + ห้อง + เวลา** ให้ใหญ่อ่านง่าย
- บล็อกที่ยกเลิกใช้ `Badge variant="destructive"`

---

## ลำดับการทำ

1. `next.config.ts` เปิด `cacheComponents: true`
2. `lib/sheet-source.ts` → **`lib/discover.ts` + `lib/sheet-snapshot.json` + `scripts/sync-sheets.ts`** → `lib/csv.ts` → `lib/parse.ts` (+ type `ExamBlock`, `Seat`, `Session`)
3. `lib/data.ts` cached fetch (ใช้ผลจาก discover) + index helpers
4. **ติดตั้ง shadcn + ธีม CI**: `shadcn init -d --base radix` → ทับ token ใน `globals.css` ตาม `docs/DESIGN.md` → โหลดฟอนต์ Anuphan/Inter ที่ `<html>` → `shadcn add button input card table badge separator skeleton alert tabs breadcrumb`
5. `app/page.tsx` (ค้นหา + สรุป) และ component `<SourceRef>` ที่ใช้ซ้ำทุกหน้า
6. หน้า `/student/[id]`, `/course/[code]`, `/room/[room]`, `/session/[gid]`
7. `app/api/revalidate/route.ts`, `app/robots.ts`, ปรับ `app/layout.tsx` (metadata ไทย, โลโก้ CP สลับ 2 สี/สีเดียวตามธีม)

## การตรวจสอบ (end-to-end)

รัน `bun dev` แล้วเช็ค:

0. **การค้นหาแท็บอัตโนมัติ** — `discoverSheets()` ต้องคืน **11 แท็บ** ตรงตามที่ตรวจไว้แล้ว
   (`1267472749` กักตัวสอบ 26 ส.ค., `433625349` 24 เช้า, `517199490` 24 บ่าย, `1835601497` 25 เช้า, `1399291427` 25 บ่าย,
   `614888768` 26 เช้า, `1359324021` 26 บ่าย, `1287778684` 27 เช้า, `129340376` 27 บ่าย, `1372988208` 28 เช้า, `1447075755` 28 บ่าย)
   แล้วลองตัดเน็ต → ต้องตกไปใช้ snapshot ของไฟล์เดียวกันพร้อมขึ้น banner เตือน; ถ้าตั้ง id เป็นไฟล์อื่นแล้ว discovery ใช้งานไม่ได้ → ต้องขึ้น error ว่า snapshot คนละไฟล์ ห้ามใช้ข้อมูลเก่าแทน
1. **เคสยืนยันที่รู้คำตอบแล้ว** — ค้น `683380531-4` ต้องได้
   `LI101001 : ENGLISH I` · `SEC. 15` · ห้อง `SC.7401` · ที่นั่ง `A1` · `28 ส.ค. 69 (บ่าย)` · `13.00-16.00 น.`
   และลิงก์ ref ต้องเป็น `#gid=1447075755&range=A7` → กดแล้วต้องไปหยุดที่แถวนั้นจริงใน Sheet
2. **ทดสอบ row alignment ที่ท้ายไฟล์ด้วย** (drift โผล่ที่ท้าย ไม่ใช่หัว): แท็บใหญ่สุด `28 ส.ค. 69 (บ่าย)` แถวสุดท้ายคือ
   **แถว 2843 = `683380701-5` ที่นั่ง `A36` สาขา CP-AI** → ref ที่ระบบสร้างต้องชี้มาที่แถวนี้
3. **ยอดรวมต้องตรง**: 271 บล็อก · 4,928 ที่นั่ง · 1,759 รหัสไม่ซ้ำ · 35 วิชา · 14 ห้อง
   และ **ทุกบล็อกต้องมี SEC ไม่ว่าง (271/271)** — assertion นี้ดักบั๊กคอลัมน์ SEC โดยตรง
   → แสดงบนหน้าแรก ใช้เป็น regression check ในตัว
4. **เคสขอบ**: `/course/CP321007` — 3 บล็อกใน `26 ส.ค. 69 (บ่าย)` (27/27/19 คน) ต้องแสดง **แยกกัน ไม่ยุบรวม** และขึ้นสถานะ "ยกเลิกการสอบ"
5. ค้น `CP.9127` → ตารางห้อง 81 บล็อก; ค้น `CP-CS` → เจอกลุ่มสาขา
6. `bun run build` ผ่าน + `bun run lint` ผ่าน (build จะพังทันทีถ้าลืม Suspense boundary)
7. ยิง `POST /api/revalidate` แล้วดูว่า `ข้อมูล ณ …` เปลี่ยนเวลา
