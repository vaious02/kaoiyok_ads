/** แปลง error จาก Supabase/เครือข่าย เป็นข้อความไทยที่บอกวิธีแก้ */
export function describeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  const m = raw.toLowerCase()

  if (m.includes('does not exist') || m.includes('schema cache')) {
    return 'ยังไม่พบตารางในฐานข้อมูล — เปิด Supabase SQL Editor แล้วรันไฟล์ supabase/schema.sql ก่อน'
  }
  if (m.includes('row-level security') || m.includes('violates row-level')) {
    return 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้ (Row Level Security) — ลองออกจากระบบแล้วเข้าใหม่'
  }
  if (m.includes('jwt') || m.includes('invalid api key')) {
    return 'คีย์ Supabase ไม่ถูกต้องหรือหมดอายุ — ตรวจสอบ VITE_SUPABASE_ANON_KEY'
  }
  if (m.includes('failed to fetch') || m.includes('networkerror')) {
    return 'เชื่อมต่อ Supabase ไม่ได้ — ตรวจสอบอินเทอร์เน็ตและค่า VITE_SUPABASE_URL'
  }
  if (m.includes('duplicate key')) {
    return 'มีข้อมูลของแคมเปญและวันที่นี้อยู่แล้ว'
  }
  return raw
}
