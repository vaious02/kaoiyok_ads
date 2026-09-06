/* =====================================================================
   เนื้อหาข่าวสารและกิจกรรมของศูนย์ดูแลผู้สูงอายุ "เก้าอี้โยก"

   วิธีเพิ่มข่าว/กิจกรรมใหม่ : เพิ่ม object เข้าไปใน newsItems ด้านล่าง
   - ตั้ง id ไม่ให้ซ้ำกับของเดิม (ใช้เป็น key และใช้จำว่าผู้ใช้ปิด popup ไปแล้ว)
   - ใส่ pinned: true ให้รายการที่ต้องการเด้ง popup ตอนเข้าเว็บครั้งแรก
     (ควรมีรายการเดียว — ถ้ามีหลายรายการจะหยิบอันแรกที่ยังไม่ผ่านวันจัดงาน)
   ===================================================================== */

export type NewsCategory = 'activity' | 'news' | 'promotion'

/** ขั้นตอนย่อยภายในกิจกรรมหนึ่ง ๆ เช่น สถานีของสมุนไพรบำบัด */
export interface NewsStep {
  title: string
  detail: string
}

export interface NewsSession {
  /** ลำดับกิจกรรมย่อย เช่น "กิจกรรมที่ 1" */
  label: string
  title: string
  /** ช่วงเวลา เช่น "10:00 - 11:00 น." */
  time: string
  /** คำอธิบายสั้น ๆ ของกิจกรรมนี้ */
  description?: string
  /** ข้อดีที่ได้รับ แสดงเป็นเครื่องหมายถูก */
  highlights?: string[]
  /** ขั้นตอนย่อย แสดงเป็นรายการมีลำดับ */
  steps?: NewsStep[]
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
  /** ช่วงเวลารวมของงาน เช่น "10:00 - 12:30 น." */
  time?: string
  /** ค่าใช้จ่าย เช่น "เข้าร่วมฟรี ไม่มีค่าใช้จ่าย" */
  fee?: string
  /** ข้อความเน้นย้ำ เช่น "รับจำนวนจำกัด สำรองที่นั่งล่วงหน้า" */
  note?: string
  sessions?: NewsSession[]
  /** เนื้อหาเพิ่มเติม ย่อหน้าละ 1 รายการ */
  body?: string[]
  /** URL รูปโปสเตอร์ (ถ้ามี) — เว้นว่างไว้จะใช้การ์ดสีแทน */
  image?: string
  /** ลิงก์ฟอร์มลงทะเบียนของกิจกรรมนี้ (ถ้ามี) — จะกลายเป็นปุ่มหลัก */
  registerUrl?: string
  /** แฮชแท็กสำหรับนำไปใช้ต่อในโพสต์โฆษณา */
  hashtags?: string[]
  /** true = ใช้เป็นเนื้อหาของ popup ตอนเข้าเว็บครั้งแรก */
  pinned?: boolean
}

/** ช่องทางติดต่อของศูนย์ ใช้ร่วมกันทั้งหน้าข่าวและ popup */
export const centerContact = {
  name: 'เก้าอี้โยก ศูนย์ดูแลผู้สูงอายุ',
  fullName: 'ศูนย์ดูแลผู้สูงอายุและผู้มีสภาวะพึ่งพิงเก้าอี้โยก',
  tagline: 'ทุกช่วงเวลามีความหมาย',
  line: '@kaoiyok.care',
  lineUrl: 'https://lin.ee/oNKrIJB',
  phone: '099-569-1442',
  /** เวลาที่รับสาย */
  phoneHours: '08:00 - 17:00 น.',
  facebookUrl: 'https://m.me/1284543794733013',
  websiteUrl: 'https://www.kaoiyok-elderlycare.com',
  mapUrl: 'https://maps.app.goo.gl/Ah2ZkLTeJYGvxagE9',
  visitNote: 'เข้าชมสถานที่ก่อนตัดสินใจได้ นัดหมายล่วงหน้า',
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
      'ชวนคุณพ่อคุณแม่และลูกหลานมาร่วมกิจกรรมดูแลข้อเข่า ทั้งกายภาพบำบัดข้อเข่าเสื่อมและสมุนไพรบำบัด ฟรี! ไม่มีค่าใช้จ่าย',
    eventDate: '2026-09-19',
    publishedAt: '2026-09-01',
    time: '10:00 - 12:30 น.',
    location: 'ณ ศูนย์ดูแลผู้สูงอายุและผู้มีสภาวะพึ่งพิงเก้าอี้โยก',
    fee: 'เข้าร่วมฟรี ไม่มีค่าใช้จ่าย',
    note: 'รับจำนวนจำกัด สำรองที่นั่งล่วงหน้า',
    registerUrl: 'https://forms.gle/Dbi1Lj7YWwzyRQRd6',
    sessions: [
      {
        label: 'กิจกรรมที่ 1',
        title: 'กายภาพบำบัดข้อเข่าเสื่อม',
        time: '10:00 - 11:00 น.',
        description:
          'เรียนรู้ท่ากายภาพฟื้นฟูข้อเข่าจากนักกายภาพ ทำตามได้จริง กลับไปทำต่อเองที่บ้านได้',
        highlights: [
          'ลดปวด',
          'เพิ่มความยืดหยุ่น',
          'เสริมสร้างกล้ามเนื้อรอบเข่า',
          'ลดความเสี่ยงการล้ม',
        ],
        icon: '🦵',
      },
      {
        label: 'กิจกรรมที่ 2',
        title: 'สมุนไพรบำบัด',
        time: '11:00 - 12:30 น.',
        steps: [
          {
            title: 'Welcome drink ชาข้าวเปลือก',
            detail: 'เครื่องดื่มที่มีสาร GABA ดื่มอุ่น ๆ สบายท้อง ผ่อนคลาย',
          },
          {
            title: 'แช่เท้าน้ำสมุนไพร',
            detail: 'คลายกล้ามเนื้อ ลดอาการปวดเมื่อย',
          },
          {
            title: 'พอกเข่าด้วยสมุนไพร',
            detail: 'ตำรับแผนไทย ช่วยให้รู้สึกสบายเข่า บรรเทาอาการปวด',
          },
          {
            title: 'พอกตา / สปาตา',
            detail: 'ลดความเมื่อยล้าจากการใช้สายตานาน ๆ ผ่อนคลายรอบดวงตา',
          },
        ],
        icon: '🌱',
      },
    ],
    body: ['💚 ดูแลข้อเข่า... ดูแลคุณภาพชีวิต'],
    hashtags: [
      'เก้าอี้โยก',
      'ศูนย์ดูแลผู้สูงอายุลาดพร้าว',
      'บ้านพักผู้สูงอายุ',
      'เกษตรนวมินทร์',
      'ลาดพร้าว',
      'ศูนย์ดูแลผู้สูงอายุ',
      'KAOIYOK',
      'ข้อเข่าเสื่อม',
      'กายภาพบำบัด',
      'สมุนไพรไทย',
      'ผู้สูงอายุ',
      'กิจกรรมฟรี',
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
