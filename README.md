# Kaoiyok Ads — แดชบอร์ดติดตามผล Facebook Ads & Google Ads

เว็บแอปสำหรับรวมตัวเลขโฆษณาจาก **Facebook Ads** และ **Google Ads** ไว้ที่เดียว
มีระบบล็อกอิน เก็บข้อมูลบน **Supabase** และ deploy ขึ้น **Netlify** ได้ทันที

- Frontend: React 18 + TypeScript + Vite
- Charts: Recharts
- Auth + Database: Supabase (Postgres + Row Level Security)
- Hosting: Netlify

---

## ฟีเจอร์

| หน้า | ทำอะไรได้ |
| --- | --- |
| **เข้าสู่ระบบ** | สมัครสมาชิก / เข้าสู่ระบบด้วยอีเมล+รหัสผ่าน / ลืมรหัสผ่าน |
| **ภาพรวม** | KPI รวม (Spend, Revenue, ROAS, Conversions, Clicks, Impressions, CTR, Conversion rate) พร้อม % เทียบช่วงก่อนหน้า, กราฟรายวัน, สัดส่วนงบ FB vs Google, ตารางผลงานรายแคมเปญ |
| **แคมเปญ** | เพิ่ม / แก้ไข / ลบแคมเปญ ระบุแพลตฟอร์ม วัตถุประสงค์ สถานะ งบต่อวัน ช่วงเวลา |
| **บันทึกผลรายวัน** | กรอกตัวเลขรายวันของแต่ละแคมเปญ, นำเข้า/ส่งออก CSV, ดาวน์โหลดเทมเพลต |
| **ตั้งค่า** | แก้โปรไฟล์ เปลี่ยนรหัสผ่าน ดูข้อมูลการเชื่อมต่อ |

ตัวเลขที่คำนวณให้อัตโนมัติ: **CTR, CPC, CPM, CPA, ROAS, Conversion rate**

---

## ขั้นตอนติดตั้ง

### 1. เตรียมฐานข้อมูลบน Supabase

1. เข้า [Supabase Dashboard](https://supabase.com/dashboard) → เลือกโปรเจกต์ของคุณ
   (`https://cfmoqebpbzypkhplnqnr.supabase.co`)
2. เปิดเมนู **SQL Editor** → **New query**
3. คัดลอกเนื้อหาไฟล์ [`supabase/schema.sql`](supabase/schema.sql) ทั้งหมดไปวาง แล้วกด **Run**

สคริปต์นี้จะสร้างตาราง `profiles`, `campaigns`, `ad_metrics`, เปิด Row Level Security
(ผู้ใช้แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง) และสร้าง trigger สร้างโปรไฟล์อัตโนมัติเมื่อสมัครสมาชิก

> อยากได้ข้อมูลตัวอย่างไว้ลองเล่น ให้สมัครสมาชิกในเว็บก่อน แล้วรัน
> [`supabase/seed.sql`](supabase/seed.sql) ตามอีกครั้ง

### 2. ตั้งค่าการยืนยันอีเมล (แนะนำสำหรับตอนทดสอบ)

ไปที่ **Authentication → Sign In / Providers → Email**

- ถ้าอยากล็อกอินได้ทันทีหลังสมัคร ให้ปิด **Confirm email**
- ถ้าเปิดไว้ ต้องกดยืนยันจากลิงก์ในอีเมลก่อนจึงจะเข้าใช้งานได้

และที่ **Authentication → URL Configuration** ให้ใส่โดเมน Netlify ของคุณใน
**Site URL** และ **Redirect URLs** (เช่น `https://your-site.netlify.app`)
เพื่อให้ลิงก์ยืนยันอีเมล/รีเซ็ตรหัสผ่านเด้งกลับมาถูกที่

### 3. รันบนเครื่อง

```bash
npm install
cp .env.example .env      # แล้วแก้ค่าในไฟล์ .env
npm run dev               # เปิด http://localhost:5173
```

ไฟล์ `.env`:

```env
VITE_SUPABASE_URL=https://cfmoqebpbzypkhplnqnr.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key ของคุณ>
```

หา `anon public key` ได้ที่ **Project Settings → API → Project API keys**
คีย์นี้ออกแบบมาให้เปิดเผยฝั่งเบราว์เซอร์ได้ เพราะสิทธิ์ถูกจำกัดด้วย Row Level Security
(อย่าใช้ `service_role` key ในเว็บเด็ดขาด)

### 4. Deploy ขึ้น Netlify

**วิธีที่ 1 — เชื่อมกับ GitHub (แนะนำ)**

1. เข้า [Netlify](https://app.netlify.com) → **Add new site → Import an existing project**
2. เลือก repo นี้ ค่า build จะถูกอ่านจาก `netlify.toml` อัตโนมัติ:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. ก่อนกด Deploy ให้ไปที่ **Site configuration → Environment variables** แล้วเพิ่ม:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. กด **Deploy site**

> ถ้าเพิ่มตัวแปรหลัง deploy ไปแล้ว ต้องสั่ง **Deploys → Trigger deploy → Clear cache and deploy site**
> เพราะค่า `VITE_*` ถูกฝังตอน build

**วิธีที่ 2 — ลากไฟล์ขึ้นเอง**

```bash
npm run build     # ต้องมี .env อยู่แล้ว
```

แล้วลากโฟลเดอร์ `dist` ไปวางที่หน้า Netlify Drop (ไฟล์ `public/_redirects` จะติดไปด้วย
ทำให้เปิดลิงก์ตรงอย่าง `/dashboard` ได้)

---

## รูปแบบไฟล์ CSV สำหรับนำเข้า

```csv
date,campaign,impressions,clicks,spend,conversions,revenue
2026-08-20,FB — Retarget สินค้าขายดี,12000,240,1500,8,6400
2026-08-20,Google — Search แบรนด์,8000,180,1200,6,5100
```

- `date` ต้องเป็นรูปแบบ `YYYY-MM-DD`
- `campaign` ใส่ **ชื่อแคมเปญ** ให้ตรงกับที่สร้างไว้ในระบบ หรือใส่ **Campaign ID** ของแพลตฟอร์มก็ได้
- แถวที่ชื่อแคมเปญไม่ตรงกับในระบบจะถูกข้าม และแจ้งเตือนให้ทราบ
- นำเข้าซ้ำวันเดิม/แคมเปญเดิม = เขียนทับข้อมูลเดิม

ดาวน์โหลดเทมเพลตได้จากปุ่ม **เทมเพลต CSV** ในหน้า "บันทึกผลรายวัน"

---

## โครงสร้างโปรเจกต์

```
src/
  components/     UI ที่ใช้ซ้ำ (layout, stat card, date range, badge)
  context/        AuthContext — จัดการ session ของ Supabase
  lib/
    supabase.ts   สร้าง Supabase client
    api.ts        ฟังก์ชันอ่าน/เขียนข้อมูลทั้งหมด
    metrics.ts    รวมยอดและคำนวณ CTR/CPC/CPA/ROAS
    csv.ts        อ่าน-เขียนไฟล์ CSV
    format.ts     จัดรูปแบบตัวเลข/วันที่ (th-TH)
  pages/          Login, Dashboard, Campaigns, Metrics, Settings
supabase/
  schema.sql      สคริปต์สร้างตาราง + RLS (ต้องรันก่อนใช้งาน)
  seed.sql        ข้อมูลตัวอย่าง (ไม่บังคับ)
netlify.toml      ตั้งค่า build + SPA redirect
```

---

## คำสั่งที่ใช้บ่อย

```bash
npm run dev       # dev server
npm run build     # typecheck + build ไปที่ dist/
npm run preview   # ลองเปิดไฟล์ที่ build แล้ว
```

## แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
| --- | --- |
| ขึ้นหน้า "ต้องใส่ Supabase Anon Key ก่อน" | ยังไม่ได้ตั้ง `VITE_SUPABASE_ANON_KEY` — ตั้งใน `.env` หรือใน Netlify แล้ว build ใหม่ |
| "ยังไม่พบตารางในฐานข้อมูล" | ยังไม่ได้รัน `supabase/schema.sql` ใน SQL Editor |
| เข้าสู่ระบบไม่ได้ ขึ้นว่ายังไม่ยืนยันอีเมล | กดลิงก์ยืนยันในอีเมล หรือปิด Confirm email ใน Supabase |
| เปิด `/dashboard` ตรง ๆ แล้ว 404 บน Netlify | ต้องมี `netlify.toml` หรือ `public/_redirects` (มีมาให้แล้วในโปรเจกต์) |
| ลิงก์รีเซ็ตรหัสผ่านพากลับไป localhost | ตั้ง Site URL / Redirect URLs ใน Supabase ให้เป็นโดเมน Netlify |
