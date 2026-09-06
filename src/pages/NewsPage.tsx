import { useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import NewsDetail from '../components/NewsDetail'
import NewsPoster from '../components/NewsPoster'
import { NewsCategoryBadge, NewsTimingBadge } from '../components/NewsBadge'
import {
  categoryLabel,
  centerContact,
  isUpcoming,
  newsItems,
  sortNews,
  type NewsCategory,
  type NewsItem,
} from '../data/news'
import { formatFullDate } from '../lib/format'

type Filter = NewsCategory | 'all'

export default function NewsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<NewsItem | null>(null)

  const sorted = useMemo(() => sortNews(newsItems), [])
  // ไฮไลต์กิจกรรมที่ใกล้ถึงที่สุด และโชว์เฉพาะตอนดู "ทั้งหมด" จะได้ไม่ขัดกับตัวกรอง
  const featured = useMemo(() => sorted.find(isUpcoming) ?? null, [sorted])
  const showFeatured = filter === 'all' && featured !== null

  // แสดงชิปเฉพาะหมวดที่มีข่าวจริง จะได้ไม่มีปุ่มที่กดแล้วว่างเปล่า
  const categories = useMemo(() => {
    const used = new Set(sorted.map((item) => item.category))
    return (Object.keys(categoryLabel) as NewsCategory[]).filter((key) => used.has(key))
  }, [sorted])

  const visible = useMemo(() => {
    const matched = filter === 'all' ? sorted : sorted.filter((item) => item.category === filter)
    // การ์ดไฮไลต์แสดงรายการนั้นไปแล้ว จึงตัดออกจากรายการด้านล่างไม่ให้ซ้ำ
    return showFeatured ? matched.filter((item) => item.id !== featured?.id) : matched
  }, [featured, filter, showFeatured, sorted])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>ข่าวสารและกิจกรรม</h1>
          <p className="page-sub">
            ประกาศและกิจกรรมของ {centerContact.name} — ใช้เป็นเนื้อหาตั้งต้นสำหรับทำโฆษณา
          </p>
        </div>
        <div className="head-actions">
          {featured?.registerUrl && (
            <a
              className="btn btn-primary"
              href={featured.registerUrl}
              target="_blank"
              rel="noreferrer"
            >
              📝 ลงทะเบียนกิจกรรม
            </a>
          )}
          <a className="btn btn-ghost" href={centerContact.lineUrl} target="_blank" rel="noreferrer">
            LINE {centerContact.line}
          </a>
        </div>
      </header>

      {showFeatured && featured && (
        <section className="card news-featured">
          <NewsPoster item={featured} large />
          <div className="news-featured-body">
            <div className="news-badges">
              <NewsCategoryBadge item={featured} />
              <NewsTimingBadge item={featured} />
            </div>
            {featured.kicker && <span className="news-kicker">{featured.kicker}</span>}
            <h2 className="news-featured-title">{featured.title}</h2>
            <p className="muted">{featured.summary}</p>
            <ul className="news-featured-meta">
              {featured.eventDate && (
                <li>
                  📅 {formatFullDate(featured.eventDate)}
                  {featured.time && ` · ${featured.time}`}
                </li>
              )}
              {featured.location && <li>📍 {featured.location}</li>}
              {featured.fee && <li>🎟️ {featured.fee}</li>}
              {featured.note && <li>📌 {featured.note}</li>}
            </ul>
            <div className="head-actions">
              <button type="button" className="btn btn-primary" onClick={() => setSelected(featured)}>
                ดูรายละเอียด
              </button>
              <a className="btn btn-ghost" href={`tel:${centerContact.phone.replace(/-/g, '')}`}>
                โทร {centerContact.phone}
              </a>
            </div>
          </div>
        </section>
      )}

      {categories.length > 1 && (
        <div className="filter-bar">
          <div className="preset-group">
            <button
              type="button"
              className={`chip ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ทั้งหมด ({sorted.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip ${filter === category ? 'is-active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {categoryLabel[category]} (
                {sorted.filter((item) => item.category === category).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        // ถ้าการ์ดไฮไลต์แสดงรายการเดียวที่มีอยู่แล้ว ไม่ต้องขึ้นกล่องว่างให้รก
        showFeatured ? null : (
          <EmptyState
            icon="📰"
            title="ยังไม่มีข่าวสารในหมวดนี้"
            description="เพิ่มข่าวหรือกิจกรรมใหม่ได้ที่ไฟล์ src/data/news.ts"
          />
        )
      ) : (
        <div className="news-grid">
          {visible.map((item) => (
            <article key={item.id} className="card news-card">
              <NewsPoster item={item} />
              <div className="news-badges">
                <NewsCategoryBadge item={item} />
                <NewsTimingBadge item={item} />
              </div>
              <h3 className="news-card-title">{item.title}</h3>
              <p className="muted news-card-summary">{item.summary}</p>
              <div className="news-card-foot">
                <small className="muted">
                  {item.eventDate ? formatFullDate(item.eventDate) : formatFullDate(item.publishedAt)}
                </small>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelected(item)}
                >
                  รายละเอียด
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="card news-contact-card">
        <div>
          <h2>สนใจเข้าร่วมหรือสอบถามข้อมูล</h2>
          <p className="page-sub">
            {centerContact.visitNote} · โทร {centerContact.phone} ({centerContact.phoneHours}) ·{' '}
            <a className="link" href={centerContact.websiteUrl} target="_blank" rel="noreferrer">
              {centerContact.websiteUrl.replace('https://', '')}
            </a>
          </p>
        </div>
        <div className="head-actions">
          <a className="btn btn-primary" href={centerContact.lineUrl} target="_blank" rel="noreferrer">
            LINE {centerContact.line}
          </a>
          <a className="btn btn-ghost" href={`tel:${centerContact.phone.replace(/-/g, '')}`}>
            โทร {centerContact.phone}
          </a>
          <a className="btn btn-ghost" href={centerContact.facebookUrl} target="_blank" rel="noreferrer">
            Messenger
          </a>
          <a className="btn btn-ghost" href={centerContact.mapUrl} target="_blank" rel="noreferrer">
            แผนที่
          </a>
        </div>
      </section>

      {selected && (
        <Modal title={selected.title} size="lg" onClose={() => setSelected(null)}>
          <NewsDetail item={selected} />
        </Modal>
      )}
    </div>
  )
}
