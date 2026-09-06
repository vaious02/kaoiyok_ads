/* =====================================================================
   เนื้อหาข่าวสารและกิจกรรมของศูนย์ดูแลผู้สูงอายุ "เก้าอี้โยก"

   วิธีเพิ่มข่าว/กิจกรรมใหม่ : เพิ่ม object เข้าไปใน newsItems ด้านล่าง
   - ตั้ง id ไม่ให้ซ้ำกับของเดิม (ใช้เป็น key และใช้จำว่าผู้ใช้ปิด popup ไปแล้ว)
   - ใส่ pinned: true ให้รายการที่ต้องการเด้ง popup ตอนเข้าเว็บครั้งแรก
     (ควรมีรายการเดียว — ถ้ามีหลายรายการจะหยิบอันแรกที่ยังไม่ผ่านวันจัดงาน)
   ===================================================================== */

export type NewsCategory = 'activity' | 'news' | 'promotion'

export interface NewsSession {
  /** ลำดับกิจกรรมย่อย เช่น "กิจกรรมที่ 1" */
  label: string
  title: string
  /** ช่วงเวลา เช่น "10:00 - 11:00 น." */
  time: string
  highlights: string[]
  icon?: string
}

export interface NewsItem {
  id: string
  category: NewsCategory
  /** ข้อความนำเหนือหัวเรื่อง เช่น "เชิญร่วมกิจกรรม" */
  kicker?: string
  title: string
  summary: string
  /** วันที่จัดกิจกรรม (yyyy-mm-dd) — ข่าวที่ไม่มีวันจัดงานให้ใส่ null */
  eventDate: string | null
  /** วันที่ประกาศ (yyyy-mm-dd) ใช้เรียงลำดับข่าวที่ไม่มีวันจัดงาน */
  publishedAt: string
  location?: string
  /** ค่าใช้จ่าย เช่น "เข้าร่วมฟรี ไม่มีค่าใช้จ่าย" */
  fee?: string
  sessions?: NewsSession[]
  /** เนื้อหาเพิ่มเติม ย่อหน้าละ 1 รายการ */
  body?: string[]
  /** URL รูปโปสเตอร์ (ถ้ามี) — เว้นว่างไว้จะใช้การ์ดสีแทน */
  image?: string
  /** true = ใช้เป็นเนื้อหาของ popup ตอนเข้าเว็บครั้งแรก */
  pinned?: boolean
}

/** ช่องทางติดต่อของศูนย์ ใช้ร่วมกันทั้งหน้าข่าวและ popup */
export const centerContact = {
  name: 'เก้าอี้โยก ศูนย์ดูแลผู้สูงอายุ',
  tagline: 'ทุกช่วงเวลามีความหมาย',
  line: '@kaoiyok.care',
  lineUrl: 'https://line.me/R/ti/p/@kaoiyok.care',
  phone: '099-569-1442',
} as const

export const categoryLabel: Record<NewsCategory, string> = {
  activity: 'กิจกรรม',
  news: 'ข่าวสาร',
  promotion: 'โปรโมชัน',
}

export const categoryIcon: Record<NewsCategory, string> = {
  activity: '🌿',
  news: '📰',
  promotion: '🎁',
}

export const newsItems: NewsItem[] = [
  {
    id: 'knee-herbal-2026-09-19',
    category: 'activity',
    kicker: 'เชิญร่วมกิจกรรม',
    title: 'เข่าดี ชีวิตดี ด้วยวิถีสมุนไพรไทย',
    summary:
      'กิจกรรมดูแลข้อเข่าสำหรับผู้สูงอายุ รวมกายภาพบำบัดข้อเข่าเสื่อมและสมุนไพรบำบัด เข้าร่วมฟรีไม่มีค่าใช้จ่าย',
    eventDate: '2026-09-19',
    publishedAt: '2026-09-01',
    location: 'เก้าอี้โยก ศูนย์ดูแลผู้สูงอายุ',
    fee: 'เข้าร่วมฟรี ไม่มีค่าใช้จ่าย',
    sessions: [
      {
        label: 'กิจกรรมที่ 1',
        title: 'กายภาพบำบัดข้อเข่าเสื่อม',
        time: '10:00 - 11:00 น.',
        highlights: ['ลดปวด', 'เพิ่มความยืดหยุ่น', 'เสริมสร้างกล้ามเนื้อ', 'ป้องกันการล้ม'],
        icon: '🦵',
      },
      {
        label: 'กิจกรรมที่ 2',
        title: 'สมุนไพรบำบัด',
        time: '11:00 - 12:30 น.',
        highlights: ['ใช้สมุนไพรไทย', 'ผ่อนคลาย', 'บรรเทาอาการปวดเข่า'],
        icon: '🌿',
      },
    ],
    body: [
      'ดูแลข้อเข่า… ดูแลคุณภาพชีวิต ลงทะเบียนล่วงหน้าผ่านไลน์แอดของศูนย์ หรือโทรสอบถามได้ในเวลาทำการ',
    ],
    pinned: true,
  },
]

/** yyyy-mm-dd ของวันนี้ตามเวลาท้องถิ่น */
function todayISO() {
  const now = new Date()
  const m = `${now.getMonth() + 1}`.padStart(2, '0')
  const d = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}

/** true เมื่อกิจกรรมยังมาไม่ถึง (ข่าวที่ไม่มีวันจัดงานถือว่าไม่ใช่กิจกรรมที่กำลังจะถึง) */
export function isUpcoming(item: NewsItem) {
  return Boolean(item.eventDate) && item.eventDate! >= todayISO()
}

/** จำนวนวันจากวันนี้ถึงวันจัดงาน (ติดลบ = ผ่านไปแล้ว) */
export function daysUntil(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - start.getTime()) / 86_400_000)
}

/** เรียงกิจกรรมที่กำลังจะถึงขึ้นก่อน (ใกล้สุดก่อน) แล้วตามด้วยของเก่าจากใหม่ไปเก่า */
export function sortNews(items: NewsItem[]) {
  return [...items].sort((a, b) => {
    const aUp = isUpcoming(a)
    const bUp = isUpcoming(b)
    if (aUp !== bUp) return aUp ? -1 : 1
    const aKey = a.eventDate ?? a.publishedAt
    const bKey = b.eventDate ?? b.publishedAt
    return aUp ? aKey.localeCompare(bKey) : bKey.localeCompare(aKey)
  })
}

/** รายการที่จะเอาไปแสดงใน popup — ปักหมุดไว้และยังไม่เลยวันจัดงาน */
export function getPopupItem(items: NewsItem[] = newsItems): NewsItem | null {
  const pinned = items.filter((item) => item.pinned)
  return pinned.find((item) => item.eventDate === null || isUpcoming(item)) ?? null
}
