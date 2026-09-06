import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPopupItem } from '../data/news'
import Modal from './Modal'
import NewsDetail from './NewsDetail'

const STORAGE_KEY = 'kaoiyok:announcement-seen'

/** อ่าน id ของประกาศที่ผู้ใช้ปิดไปแล้ว (โหมดไม่บันทึกข้อมูลจะอ่านไม่ได้ ถือว่ายังไม่เคยเห็น) */
function readSeenId() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function markSeen(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* เบราว์เซอร์ปิดการเก็บข้อมูลไว้ — ปล่อยให้เด้งใหม่รอบหน้าได้ */
  }
}

/**
 * ป๊อปอัปต้อนรับสำหรับผู้ที่เข้าเว็บครั้งแรก แสดงประกาศ/กิจกรรมที่ปักหมุดไว้
 * เมื่อปิดแล้วจะจำ id ของประกาศนั้นไว้ ถ้ามีประกาศใหม่จึงจะเด้งอีกครั้ง
 */
export default function FirstVisitPopup() {
  const item = getPopupItem()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!item || readSeenId() === item.id) return
    // หน่วงเล็กน้อยให้หน้าโหลดเสร็จก่อน ป๊อปอัปจะได้ไม่กระโดดใส่ตอนกำลังเรนเดอร์
    const timer = window.setTimeout(() => setOpen(true), 600)
    return () => window.clearTimeout(timer)
  }, [item])

  if (!item || !open) return null

  const close = () => {
    markSeen(item.id)
    setOpen(false)
  }

  return (
    <Modal
      title={item.title}
      size="lg"
      onClose={close}
      footer={
        <>
          <Link className="btn btn-primary" to="/news" onClick={close}>
            ดูข่าวสารและกิจกรรมทั้งหมด
          </Link>
          <button type="button" className="btn btn-ghost" onClick={close}>
            ไว้ก่อน
          </button>
        </>
      }
    >
      <NewsDetail item={item} />
    </Modal>
  )
}
