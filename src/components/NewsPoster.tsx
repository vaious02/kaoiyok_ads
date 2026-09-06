import { categoryIcon, isUpcoming, type NewsItem } from '../data/news'
import { formatFullDate } from '../lib/format'

interface Props {
  item: NewsItem
  /** โปสเตอร์ใหญ่สำหรับ popup และการ์ดไฮไลต์ */
  large?: boolean
}

/** ภาพหัวเรื่องของข่าว/กิจกรรม — ใช้รูปจริงถ้ามี ไม่มีก็วาดโปสเตอร์ด้วย CSS */
export default function NewsPoster({ item, large = false }: Props) {
  if (item.image) {
    return (
      <div className={`news-poster ${large ? 'is-large' : ''}`}>
        <img src={item.image} alt={item.title} loading="lazy" />
      </div>
    )
  }

  return (
    <div className={`news-poster news-poster-art ${large ? 'is-large' : ''}`}>
      <span className="news-poster-icon" aria-hidden="true">
        {categoryIcon[item.category]}
      </span>
      {item.kicker && <span className="news-poster-kicker">{item.kicker}</span>}
      {item.eventDate && (
        <span className="news-poster-date">
          {isUpcoming(item) ? '📅' : '🗓️'} {formatFullDate(item.eventDate)}
        </span>
      )}
    </div>
  )
}
