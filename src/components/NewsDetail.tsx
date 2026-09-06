import { centerContact, type NewsItem } from '../data/news'
import { formatFullDate } from '../lib/format'
import { NewsTimingBadge } from './NewsBadge'
import NewsPoster from './NewsPoster'

/** เนื้อหาเต็มของข่าว/กิจกรรม ใช้ร่วมกันทั้งใน popup และ modal หน้าข่าวสาร */
export default function NewsDetail({ item }: { item: NewsItem }) {
  return (
    <div className="news-detail">
      <NewsPoster item={item} large />

      <div className="news-detail-head">
        {item.kicker && <span className="news-kicker">{item.kicker}</span>}
        <h2 className="news-detail-title">{item.title}</h2>
        <p className="muted">{item.summary}</p>
      </div>

      <ul className="news-facts">
        {item.eventDate && (
          <li>
            <span aria-hidden="true">📅</span>
            <div>
              <strong>{formatFullDate(item.eventDate)}</strong>
              <NewsTimingBadge item={item} />
            </div>
          </li>
        )}
        {item.location && (
          <li>
            <span aria-hidden="true">📍</span>
            <div>
              <strong>{item.location}</strong>
            </div>
          </li>
        )}
        {item.fee && (
          <li>
            <span aria-hidden="true">🎟️</span>
            <div>
              <strong>{item.fee}</strong>
            </div>
          </li>
        )}
      </ul>

      {item.sessions && item.sessions.length > 0 && (
        <div className="news-sessions">
          {item.sessions.map((session) => (
            <article key={session.label} className="news-session">
              <header>
                <span className="news-session-icon" aria-hidden="true">{session.icon ?? '•'}</span>
                <div>
                  <small className="muted">{session.label}</small>
                  <strong>{session.title}</strong>
                </div>
              </header>
              <p className="news-session-time">🕙 เวลา {session.time}</p>
              <ul className="news-session-points">
                {session.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {item.body?.map((paragraph) => (
        <p key={paragraph} className="muted">
          {paragraph}
        </p>
      ))}

      <div className="news-contact">
        <strong>ลงทะเบียน / สอบถามเพิ่มเติม</strong>
        <div className="news-contact-links">
          <a
            className="btn btn-primary btn-sm"
            href={centerContact.lineUrl}
            target="_blank"
            rel="noreferrer"
          >
            LINE {centerContact.line}
          </a>
          <a className="btn btn-ghost btn-sm" href={`tel:${centerContact.phone.replace(/-/g, '')}`}>
            โทร {centerContact.phone}
          </a>
        </div>
        <small className="muted">
          {centerContact.name} | {centerContact.tagline}
        </small>
      </div>
    </div>
  )
}
