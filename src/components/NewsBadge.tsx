import { categoryLabel, daysUntil, isUpcoming, type NewsItem } from '../data/news'

/** ป้ายบอกว่ากิจกรรมกำลังจะถึงในอีกกี่วัน หรือผ่านไปแล้ว */
export function NewsTimingBadge({ item }: { item: NewsItem }) {
  if (!item.eventDate) return null

  const left = daysUntil(item.eventDate)
  if (!isUpcoming(item)) return <span className="status status-ended">ผ่านไปแล้ว</span>
  if (left === 0) return <span className="status status-active">วันนี้</span>
  if (left === 1) return <span className="status status-active">พรุ่งนี้</span>
  return <span className="status status-paused">อีก {left} วัน</span>
}

export function NewsCategoryBadge({ item }: { item: NewsItem }) {
  return <span className={`news-tag news-tag-${item.category}`}>{categoryLabel[item.category]}</span>
}
