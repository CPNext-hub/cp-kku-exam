# Design System — cp-kku-exam

ระบบดีไซน์ = **โครงจาก Apple design system** (ผ่าน shadcn.io/design/apple) + **สีและตราสัญลักษณ์จาก CI จริงของวิทยาลัยการคอมพิวเตอร์ มข.**
UI component ทั้งหมดใช้ **shadcn/ui** (new-york, Radix base, Tailwind v4)

## ที่มาของข้อมูล (ดึงและตรวจสอบจริงแล้ว)

| แหล่ง | ได้อะไรมา |
|---|---|
| [shadcn.io/design/apple](https://www.shadcn.io/design/apple) | หลักการ 5 ข้อ, สเกลตัวอักษร, radius, กฎเงา, สีเดียวสำหรับ interaction |
| [designmd.ai/brunopetrovic/apple](https://designmd.ai/brunopetrovic/apple) | ต้นทางจริงของหน้า shadcn.io ข้างบน — ได้ spacing scale, layout width, breakpoint, ค่า radius เป็น px ที่หน้า shadcn ไม่ได้ระบุ |
| [computing.kku.ac.th](https://computing.kku.ac.th/index) | ยืนยันว่าเว็บจริงใช้ `#1c75bc` เป็นสีแบรนด์, โลโก้ `/_nuxt/img/logo2.06d1225.png` |
| [CP KEY VISUAL (CI Guidelines, 25 หน้า)](https://api.computing.kku.ac.th/storage/documents/1683517587-CP-KEY-VISUAL6-7.pdf) | ค่าสีทางการ, ฟอนต์ตราสัญลักษณ์, กฎ clear area, กฎการใช้โลโก้ผิด 9 ข้อ |

> ⚠️ ทั้งสอง URL ของ computing.kku.ac.th ตอบ **403 ถ้าไม่ส่ง User-Agent ของเบราว์เซอร์** — ถ้าเขียนสคริปต์ดึง asset ต้องใส่ UA

---

## 1. ค่าจาก CI ที่ "ห้ามเปลี่ยน"

ตามคู่มือระบบอัตลักษณ์องค์กร หน้า 06–08:

| ชื่อทางการ | CMYK | RGB | HEX |
|---|---|---|---|
| College of Computing **Denim Blue** | C85 M50 Y0 K0 | 28, 117, 188 | **`#1C75BC`** |
| College of Computing **Black** | C0 M0 Y0 K100 | 35, 31, 32 | **`#231F20`** |
| College of Computing **White** | C0 M0 Y0 K0 | 255, 255, 255 | **`#FFFFFF`** |

**ฟอนต์บนตราอัตลักษณ์** (ใช้กับ "ตัวโลโก้" เท่านั้น ห้ามเปลี่ยน): Microsoft Sans Serif (Stroke 5), PSL-EmpireExtra (Regular), Myriad Variable Concept (Bold)
→ ฟอนต์เหล่านี้ **ไม่ใช่** ฟอนต์ของ UI เพราะโลโก้เราใช้เป็นไฟล์ภาพอยู่แล้ว

**กฎโลโก้ที่ต้องพามาบนเว็บ:**
- วางแนวนอน (Horizontal Type) เท่านั้น — ห้ามบีบ ยืด เอียง ใส่ stroke ถอดองค์ประกอบ ทำเป็นลายเส้น หรือเปลี่ยนสี
- **Clear area = 1/4 ของความสูงโลโก้** รอบทุกด้าน → บน CSS คือ `padding: calc(var(--logo-h) / 4)` รอบ `<Logo/>`
- พื้นหลังน้ำหนัก **0–50% black → ใช้โลโก้สองสี (เต็มสี)**; **50–100% black → ต้องสลับเป็นโลโก้สีเดียว** (ขาว/ฟ้า/ดำ)
  → แปลว่า **dark mode ต้องสลับไฟล์โลโก้เป็นเวอร์ชันสีเดียว ไม่ใช่แค่ invert**

---

## 2. หลักการ Apple 5 ข้อ → เอามาใช้ยังไงกับงานนี้

| หลักการ Apple (ต้นฉบับ) | ใช้กับ cp-kku-exam |
|---|---|
| **Single interactive color** — "Action Blue #0066cc is every link, every pill CTA, every focus signal; no secondary brand accent exists" | เปลี่ยนเป็น **CP Denim Blue `#1C75BC`** — เข้ากันพอดี เพราะ CI ก็ให้มาสีเดียวอยู่แล้ว **ห้ามมีสี accent ที่สอง** |
| **Photography-first** — "exactly one drop-shadow, reserved for product imagery" | แอปนี้ไม่มีรูปสินค้า → **"product" ของแอปนี้คือ `เลขที่นั่งสอบ`** เงาหนึ่งเดียวในระบบสงวนไว้ให้การ์ดเลขที่นั่งเท่านั้น ที่เหลือ **ไม่มีเงาเลย** ใช้ hairline border แทน |
| **Alternating tile rhythm** — "full-bleed light and dark canvases stack edge-to-edge; the color change itself is the section divider" | หน้าแรกเรียงเป็นแถบเต็มจอสลับ `canvas` / `parchment` / `ink` — **ไม่ใช้เส้นคั่นระหว่าง section** |
| **Body at 17px** + negative letter-spacing | คงขนาด 17px แต่ **ตัวไทยห้ามใส่ letter-spacing ติดลบ** (ดูข้อ 4) |
| **Weight ladder 300/400/600/700 — น้ำหนัก 500 หายไปโดยตั้งใจ** | ใช้ตามเป๊ะ Anuphan เป็น variable font จึงกดได้ครบ |

---

## 3. Color tokens (shadcn / Tailwind v4)

ใส่ใน `app/globals.css` — ทุกค่าคำนวณ oklch จาก HEX ของ CI จริง

```css
:root {
  --radius: 0.6875rem;                      /* 11px = Apple base radius */

  --background:            oklch(1.0000 0.0000 89.88);   /* #FFFFFF  canvas */
  --foreground:            oklch(0.2442 0.0064 0.59);    /* #231F20  CP Black */
  --card:                  oklch(1.0000 0.0000 89.88);   /* #FFFFFF */
  --card-foreground:       oklch(0.2442 0.0064 0.59);    /* #231F20 */
  --popover:               oklch(1.0000 0.0000 89.88);   /* #FFFFFF */
  --popover-foreground:    oklch(0.2442 0.0064 0.59);    /* #231F20 */

  --primary:               oklch(0.5487 0.1362 248.31);  /* #1C75BC  CP Denim Blue */
  --primary-foreground:    oklch(1.0000 0.0000 89.88);   /* #FFFFFF */

  --secondary:             oklch(0.9864 0.0042 236.50);  /* #F8FBFD  parchment */
  --secondary-foreground:  oklch(0.2442 0.0064 0.59);    /* #231F20 */
  --muted:                 oklch(0.9864 0.0042 236.50);  /* #F8FBFD */
  --muted-foreground:      oklch(0.5238 0.0040 354.81);  /* #6C696A */
  --accent:                oklch(0.9864 0.0042 236.50);  /* #F8FBFD */
  --accent-foreground:     oklch(0.5487 0.1362 248.31);  /* #1C75BC */

  --destructive:           oklch(0.5304 0.2074 22.32);   /* #C8102E  ใช้กับ "ยกเลิกการสอบ" เท่านั้น */
  --destructive-foreground:oklch(1.0000 0.0000 89.88);   /* #FFFFFF */

  --border:                oklch(0.9196 0.0011 17.18);   /* #E5E4E4  hairline */
  --input:                 oklch(0.9196 0.0011 17.18);   /* #E5E4E4 */
  --ring:                  oklch(0.5487 0.1362 248.31);  /* #1C75BC */

  /* token เฉพาะแอปนี้ */
  --cp-blue-press:         oklch(0.5040 0.1202 248.05);  /* #1D68A5  hover/active */
  --cp-divider-soft:       oklch(0.9529 0.0011 17.18);   /* #F0EFEF */
  --shadow-seat: 3px 5px 30px rgb(0 0 0 / 0.22);         /* เงาเดียวในระบบ */
}

.dark {
  --background:            oklch(0.2442 0.0064 0.59);    /* #231F20  CP Black = พื้นหลังโหมดมืด */
  --foreground:            oklch(1.0000 0.0000 89.88);   /* #FFFFFF */
  --card:                  oklch(0.2734 0.0062 0.50);    /* #2A2627  tile 1 */
  --card-foreground:       oklch(1.0000 0.0000 89.88);
  --popover:               oklch(0.2977 0.0061 0.43);    /* #302C2D  tile 2 */
  --popover-foreground:    oklch(1.0000 0.0000 89.88);

  --primary:               oklch(0.6988 0.1073 244.25);  /* #60A5DC  ฟ้าไล่อ่อนสำหรับพื้นมืด */
  --primary-foreground:    oklch(0.2442 0.0064 0.59);    /* #231F20 */

  --secondary:             oklch(0.2977 0.0061 0.43);    /* #302C2D */
  --secondary-foreground:  oklch(1.0000 0.0000 89.88);
  --muted:                 oklch(0.2977 0.0061 0.43);    /* #302C2D */
  --muted-foreground:      oklch(0.7388 0.0011 17.19);   /* #ABAAAA */
  --accent:                oklch(0.2977 0.0061 0.43);
  --accent-foreground:     oklch(0.6988 0.1073 244.25);

  --destructive:           oklch(0.6256 0.1933 23.03);   /* #E5484D */
  --destructive-foreground:oklch(0.2442 0.0064 0.59);

  --border:                oklch(0.3334 0.0059 0.36);    /* #393536 */
  --input:                 oklch(0.3334 0.0059 0.36);
  --ring:                  oklch(0.6988 0.1073 244.25);
}
```

### ทำไม dark mode ถึงเปลี่ยนสีฟ้า

`#1C75BC` บนพื้น `#231F20` ได้ contrast แค่ **3.35:1 — ตก WCAG AA** จึงต้องไล่อ่อนเป็น `#60A5DC` (6.14:1) **เฉพาะ UI**
**ตัวโลโก้ยังต้องใช้ `#1C75BC` เป๊ะตาม CI เสมอ** (หรือสลับเป็นเวอร์ชันสีเดียวขาว) — ห้ามเอา `#60A5DC` ไประบายโลโก้

### ตาราง contrast (ตรวจแล้วทุกคู่)

| คู่สี | ratio | ผล |
|---|---|---|
| `#231F20` บน `#FFFFFF` | 16.30 | AAA |
| `#1C75BC` บน `#FFFFFF` | 4.86 | AA (ผ่านแบบเฉียด — **ห้ามใช้กับตัวอักษรต่ำกว่า 14px ที่ไม่ bold**) |
| `#FFFFFF` บน `#1C75BC` (ปุ่ม) | 4.86 | AA — **ข้อจำกัดเดียวกันเป๊ะ** ดูกฎด้านล่าง |
| `#FFFFFF` บน `#1D68A5` (ปุ่มตอน hover/active) | 5.87 | AA สบาย ๆ |
| `#6C696A` บน `#FFFFFF` (muted) | 5.43 | AA |
| `#1C75BC` บน `#231F20` | 3.35 | ❌ ตก → ใช้ `#60A5DC` แทน |
| `#60A5DC` บน `#231F20` | 6.14 | AA |
| `#ABAAAA` บน `#231F20` | 6.66 | AA |
| `#C8102E` บน `#FFFFFF` | 5.88 | AA |

**กฎที่ตามมาจาก 4.86 (ใช้กับทั้งฟ้าบนขาว และขาวบนฟ้า):**
ตัวหนังสือบนพื้นฟ้า `#1C75BC` **ต้อง ≥15px และน้ำหนัก 600 ขึ้นไป** (เข้าเกณฑ์ WCAG large text ที่ต้องการแค่ 3:1 — ของเราได้ 4.86 เหลือเฟือ)
→ ปุ่มทุกตัวใช้ `text-[15px] font-semibold`, badge บนพื้นฟ้าก็เช่นกัน
**ห้ามมีตัวอักษร 13px regular บนพื้นฟ้าเด็ดขาด** ถ้าจำเป็นต้องเล็กจริง ๆ ให้เปลี่ยนพื้นเป็น `#1D68A5` (5.87:1)

---

## 4. Typography — จุดที่ต้องดัดจาก Apple มากที่สุด

Apple ใช้ SF Pro ซึ่ง **ไม่มีอักษรไทย** และสเปก body ของเขา (`17px / 1.47 / -0.374px`) **ใช้กับไทยตรง ๆ ไม่ได้**

### ฟอนต์ที่เลือก (ตรวจแล้วว่ามีบน Google Fonts ทั้งคู่)

```ts
// app/layout.tsx
import { Anuphan, Inter } from "next/font/google";

const sans = Anuphan({                    // ไทย + ละติน ในตัวเดียว, variable 100–700, loopless แนว SF
  subsets: ["thai", "latin"], variable: "--font-sans", display: "swap",
});
const mono = Inter({                       // เฉพาะตัวเลข: tabular-nums ที่เชื่อถือได้
  subsets: ["latin"], variable: "--font-num", display: "swap",
});
```

```css
/* ⚠️ @theme inline resolve ตอน parse — ต้องใส่ "ชื่อฟอนต์ตรง ๆ" ห้ามใส่ var() ของ next/font */
@theme inline {
  --font-sans: "Anuphan", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-num:  "Inter", ui-sans-serif, system-ui, sans-serif;
}
```
วาง `className={`${sans.variable} ${mono.variable}`}` ไว้ที่ **`<html>` ไม่ใช่ `<body>`**

### สเกล (ดัดจาก Apple ให้รองรับไทย)

| token | size | weight | line-height | letter-spacing | ใช้ที่ไหน |
|---|---|---|---|---|---|
| `display` | 40–56px | 600 | 1.15 | **ละติน −0.02em / ไทย 0** | หัวหน้าแรก |
| `title-1` | 28px | 600 | 1.25 | ไทย 0 | หัวหน้า /student /course |
| `title-2` | 21px | 600 | 1.35 | ไทย 0 | หัวการ์ด |
| `body` | **17px** | 400 | **1.65** (Apple 1.47 → ไทยต้องการมากกว่า) | **0** | เนื้อความ |
| `body-sm` | 15px | 400 | 1.6 | 0 | ตาราง |
| `caption` | 13px | 400 | 1.5 | 0 | ที่มา/ref, footnote |
| `seat` | 44–56px | 700 | 1.0 | −0.02em | **เลขที่นั่งสอบ** (ตัวเลขล้วน ใส่ tracking ติดลบได้) |

**กฎเหล็กของไทย:**
1. **ห้าม `letter-spacing` ติดลบกับข้อความไทย** — สระบน/ล่าง (ิ ี ่ ้ ) จะชนกัน ใส่ได้เฉพาะ block ที่เป็นละติน/ตัวเลขล้วน
2. **line-height ขั้นต่ำ 1.6 สำหรับเนื้อความไทย** — ไทยซ้อนสระ 2 ชั้น 1.47 ของ Apple ตัดหาง
3. น้ำหนัก **ข้าม 500** ตามระบบ Apple: ใช้ 300 / 400 / 600 / 700 เท่านั้น
4. ตัวเลขทุกตัวที่เป็นข้อมูล (รหัส นศ., เลขที่นั่ง, เวลา, เลขแถว ref) ใช้
   `font-family: var(--font-num); font-variant-numeric: tabular-nums;` → คอลัมน์ตารางจะไม่ขยับ

---

## 5. Spacing

Apple ใช้ **base unit 8px** token ไล่ตั้งแต่ 4px (xxs) ถึง 80px (section)

| token | px | Tailwind | ใช้กับ |
|---|---|---|---|
| `xxs` | 4 | `1` | ช่องไฟไอคอนกับข้อความ |
| `xs` | 8 | `2` | ช่องไฟใน badge/pill |
| `sm` | 12 | `3` | ระยะระหว่างบรรทัดในกลุ่มเดียวกัน |
| `md` | 16 | `4` | gutter มือถือ, gap ตาราง |
| `grid` | **20** | `5` | gutter ระหว่างการ์ดใน grid (Apple ใช้ช่วง 20–24px) |
| `lg` | **24** | `6` | **padding ใน Card (ค่าของ Apple)** |
| `xl` | 32 | `8` | ระยะระหว่างกลุ่ม |
| `2xl` | 48 | `12` | ระยะระหว่างบล็อกเนื้อหา |
| `section` | **80** | `20` | **padding บน–ล่างของแถบเต็มจอ (ค่าของ Apple)** |

ใช้เฉพาะค่าในสเกลนี้ **ห้ามใส่ค่ากลาง ๆ เอง** (ไม่มี `p-7`, `gap-9`, `mt-[13px]`)
`5` (20px) ใช้ได้เฉพาะเป็น **gutter ของ grid** เท่านั้น ห้ามเอาไปใช้เป็น padding

## 6. Radius / Shadow / Motion

**Radius** — ตามค่าจริงของ Apple

| ใช้กับ | ค่า | Tailwind |
|---|---|---|
| **ปุ่ม / Badge / Chip / ช่องค้นหา** | 9999px (pill) | `rounded-full` |
| **การ์ด utility / การ์ดผลลัพธ์** | 18px | `rounded-[18px]` |
| Input, ตาราง, surface ทั่วไป | 11px (`--radius`) | `rounded-[11px]` |
| ⚠️ shadcn `Card` default ใช้ `rounded-xl` ที่ผูกกับ `--radius` = **11px** → **ต้องไปแก้ `components/ui/card.tsx` ให้เป็น `rounded-[18px]` ครั้งเดียว** อย่าไปใส่ override รายที่ใช้ | | |
| ปุ่มบนพื้นมืด | 8px | `rounded-lg` |
| แถบเต็มจอ (full-bleed tile) | 0 | `rounded-none` |

**Shadow** — ระบบนี้มีเงาอยู่ **1 ตัว** เท่านั้น
```
--shadow-seat: 3px 5px 30px rgb(0 0 0 / 0.22);
```
ใช้กับ **การ์ดเลขที่นั่งสอบ** ที่เดียว — ไม่มีเงาบนการ์ดอื่น ไม่มีเงาบนปุ่ม ไม่มีเงาบนตัวอักษร ไม่มี glassmorphism ไม่มี gradient
การ์ดอื่นแยกตัวเองด้วย `border` สี `--border` (hairline) เท่านั้น

**Motion** — Apple ไม่ระบุไว้ในหน้านั้น จึงกำหนดขั้นต่ำเอง: `150ms cubic-bezier(0.4, 0, 0.2, 1)` สำหรับ hover/focus, `250ms` สำหรับ skeleton → content
เคารพ `prefers-reduced-motion: reduce` เสมอ

---

## 7. shadcn/ui — setup และ component ที่ใช้

```bash
bunx shadcn@latest init -d --base radix     # -d เท่านั้น, -y ไม่พอ (ยัง prompt เลือก base)
bunx shadcn@latest add button input card table badge separator skeleton alert tabs breadcrumb
```

หลัง init **ต้องตามไปแก้ 2 จุดทันที**:
1. `globals.css` — ทับ token ทั้งหมดด้วยชุดในข้อ 3 (init จะใส่ palette กลางมาให้)
2. `@theme inline` — เปลี่ยน `--font-sans` เป็นชื่อฟอนต์ตรง ๆ (`"Anuphan"`) ห้ามเป็น `var(...)` ไม่งั้นฟอนต์หาย

### mapping component → หน้าจอ

| หน้า / ส่วน | component |
|---|---|
| ช่องค้นหา | `Input` (h-12, rounded-full, text-17px) + `Button` (pill, `bg-primary`) |
| ผลค้นหาแยกกลุ่ม | `Tabs` — นักศึกษา / วิชา / ห้อง / สาขา |
| การ์ดผลการค้นหาแต่ละวิชา | `Card` + `Badge` (สาขา, หลักสูตร) + `Separator` |
| **การ์ดเลขที่นั่ง** | `Card` เดี่ยว + `--shadow-seat` + ตัวเลข `seat` token |
| ตาราง `/course` `/room` `/session` | `Table` (hairline border, ไม่มี zebra stripe) |
| สถานะ "ยกเลิกการสอบ" | `Badge variant="destructive"` (pill) |
| banner "กำลังใช้รายชื่อแท็บสำรอง" | `Alert` |
| ไม่พบข้อมูล / ยังไม่ได้ค้น | `Alert` + ข้อความแนะนำ (ไม่ใช่หน้าว่างเปล่า) |
| Suspense fallback | `Skeleton` |
| เส้นทาง ref ในระบบ | `Breadcrumb` — session → วิชา → ห้อง |
| ปุ่ม "ที่มา: แท็บ X แถว Y ↗" | `Button variant="link" size="sm"` + ไอคอน `ExternalLink` `h-4 w-4` |

**ห้าม** ใช้ `<button>` `<input>` `<table>` ดิบ ในเมื่อ shadcn มีให้แล้ว และห้าม `div rounded-xl border p-6` ซ้ำ ๆ แทน `Card`

---

## 8. Layout & density

| | ค่า |
|---|---|
| ความกว้างเนื้อความ | `max-w-[980px]` จัดกึ่งกลาง |
| ความกว้าง grid/ตารางใหญ่ | `max-w-[1440px]` |
| gutter ระหว่างการ์ดใน grid | 20–24px (`gap-5` / `gap-6`) |
| จำนวนคอลัมน์การ์ด | 3–5 คอลัมน์ |
| ระยะระหว่างแถบเต็มจอ | **0** — แถบชนกันสนิท ใช้การเปลี่ยนสีเป็นตัวคั่น |

**Breakpoints (ตาม Apple):** `1440px` content lock · `1068px` desktop เล็ก · `834px` tablet แนวนอน · `640px` มือถือ

- gutter ข้าง `px-4` บนมือถือ, `px-6` ขึ้นไปบน tablet+
- density เดียวต่อหน้า: **comfortable** (`gap-6` / `p-6`) สำหรับหน้าผลลัพธ์, **compact** (`gap-4` / `p-4`) สำหรับตารางยาว
- **mobile-first จริงจัง** — นักศึกษาเปิดหน้างานจากมือถือ: เลขที่นั่ง + ห้อง + เวลา ต้องอ่านได้โดยไม่ต้องซูมและไม่ต้องเลื่อนแนวนอน
- ตารางที่ล้นจอ ห่อด้วย `overflow-x-auto` ของตัวเอง — ตัว `<body>` ต้องไม่เลื่อนแนวนอนเด็ดขาด
- ไอคอน Lucide ขนาด `h-4 w-4` หรือ `h-5 w-5` เท่านั้น

---

## 9. Do / Don't

**Do**
- ใช้ token เสมอ (`bg-background` `text-muted-foreground` `border-border`) ห้ามฝัง hex ดิบใน component
- สีฟ้า = "กดได้" เท่านั้น อย่าเอาไปเป็นสีตกแต่ง
- เลขที่นั่งคือพระเอกของทุกหน้า ให้ใหญ่ที่สุดในหน้าจอเสมอ
- ทุกข้อมูลที่แสดงต้องมีปุ่ม ref กลับ Sheet (ดู `docs/PLAN.md` ข้อ "การ ref กลับต้นทาง")

**Don't**
- ❌ เพิ่มสี accent ที่สอง (ส้ม/ม่วง/เขียว) — ระบบนี้มีสีเดียว สีแดงมีไว้สื่อ "ยกเลิก" เท่านั้น
- ❌ ใส่เงาบนการ์ด/ปุ่ม (มีเงาได้ที่การ์ดเลขที่นั่งที่เดียว)
- ❌ ใส่ letter-spacing ติดลบกับข้อความไทย
- ❌ ใช้ weight 500
- ❌ ยืด/บีบ/เอียง/เปลี่ยนสี/ใส่ขอบ โลโก้ CP (ผิด CI ชัดเจน — คู่มือมีตัวอย่างห้าม 9 ข้อ)
- ❌ วางโลโก้สองสีบนพื้นเข้ม (ต้องสลับเป็นสีเดียว)
- ❌ card ซ้อน card ซ้อน card

---

## 10. ไฟล์นี้กับ DESIGNmd

ไฟล์นี้เขียนตามรูปแบบ **DESIGN.md** (designmd.ai) — ครบทั้ง 6 หมวดมาตรฐาน: Colors · Typography · Spacing · Components · Elevation · Guidelines
จึงให้ AI coding agent ตัวไหนก็อ่านแล้วสร้าง UI ได้ตรงกัน

```bash
npm i -g designmd                       # หรือ npx designmd
designmd search "apple"                 # ค้นหา (ไม่ต้องมี API key)
export DESIGNMD_API_KEY=dk_xxx          # ต้องมี key สำหรับ get/download/upload
designmd download brunopetrovic/apple   # ดึงต้นฉบับ Apple มาเทียบ (ได้ไฟล์ DESIGN.md)
designmd upload ./docs/DESIGN.md --name "CP KKU Exam" --tags thai,education,minimal
```

> ถ้าจะ upload: ไฟล์นี้มีอีเมลติดต่อของเจ้าหน้าที่และลิงก์ Sheet ที่มีรหัสนักศึกษาจริง — **ตัดออกก่อนเผยแพร่สู่สาธารณะ**

## 11. Checklist ตรวจงาน

1. เปิด `/` ทั้ง light และ dark → โลโก้สลับเป็นเวอร์ชันสีเดียวจริงในโหมดมืด
2. เช็ก contrast ด้วย DevTools: ทุกคู่ในตารางข้อ 3 ต้อง ≥ 4.5
3. ย่อจอเหลือ 390px → ไม่มี horizontal scroll ที่ `<body>`, เลขที่นั่งยังอ่านออกไม่ต้องซูม
4. `grep -rn "#[0-9a-fA-F]\{6\}" app components` → ต้องไม่เจอ hex ดิบนอก `globals.css`
5. ตั้ง `prefers-reduced-motion: reduce` → ไม่มี transition ค้าง
6. เปิดหน้า `/student/<id>` แล้วนับเงา — ต้องมีแค่ 1 จุดคือการ์ดเลขที่นั่ง
7. ตัวเลขในตาราง (รหัส นศ. / เลขที่นั่ง) ต้องเรียงตรงคอลัมน์ (tabular-nums ทำงาน)
8. `grep -rnE "\b(p|px|py|m|mx|my)-(5|7|9|11|13)\b|\bgap-(7|9|11)\b" app components` → ต้องไม่เจอ (ค่านอกสเกล 8px)
9. แถบเต็มจอต้องชนกันสนิท — ไม่มี margin หรือเส้นคั่นระหว่าง section
