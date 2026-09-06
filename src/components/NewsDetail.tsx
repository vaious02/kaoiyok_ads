import { centerContact, type NewsItem } from '../data/news'
import { formatFullDate } from '../lib/format'
import { NewsTimingBadge } from './NewsBadge'
import NewsPoster from './NewsPoster'

const telHref = `tel:${centerContact.phone.replace(/-/g, '')}`

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
              <strong>
                {formatFullDate(item.eventDate)}
                {item.time && ` · ${item.time}`}
              </strong>
              <NewsTimingBadge item={item} />
            </div>
          </li>
        )}
        {item.location && (
          <li>
            <span aria-hidden="true">📍</span>
            <div>
              <strong>{item.location}</strong>
              <a className="link" href={centerContact.mapUrl} target="_blank" rel="noreferrer">
                ดูแผนที่
              </a>
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
              {session.description && <p className="news-session-desc">{session.description}</p>}

              {session.highlights && session.highlights.length > 0 && (
                <ul className="news-session-points">
                  {session.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}

              {session.steps && session.steps.length > 0 && (
                <ol className="news-session-steps">
                  {session.steps.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      <small className="muted">{step.detail}</small>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ))}
        </div>
      )}

      {item.body?.map((paragraph) => (
        <p key={paragraph} className="news-detail-body">
          {paragraph}
        </p>
      ))}

      {item.note && <p className="alert news-note">📌 {item.note}</p>}

      <div className="news-contact">
        <strong>ลงทะเบียน / สอบถามเพิ่มเติม</strong>
        <div className="news-contact-links">
          {item.registerUrl && (
            <a
              className="btn btn-primary btn-sm"
              href={item.registerUrl}
              target="_blank"
              rel="noreferrer"
            >
              📝 ลงทะเบียนเข้าร่วมกิจกรรม
            </a>
          )}
          <a
            className={`btn btn-sm ${item.registerUrl ? 'btn-ghost' : 'btn-primary'}`}
            href={centerContact.lineUrl}
            target="_blank"
            rel="noreferrer"
          >
            LINE {centerContact.line}
          </a>
          <a className="btn btn-ghost btn-sm" href={telHref}>
            โทร {centerContact.phone}
          </a>
        </div>
        <small className="muted">
          รับสาย {centerContact.phoneHours} · {centerContact.visitNote}
        </small>
        <div className="news-contact-links">
          <a className="link" href={centerContact.facebookUrl} target="_blank" rel="noreferrer">
            💬 Facebook Messenger
          </a>
          <a className="link" href={centerContact.websiteUrl} target="_blank" rel="noreferrer">
            🌐 เว็บไซต์ศูนย์
          </a>
          <a className="link" href={centerContact.mapUrl} target="_blank" rel="noreferrer">
            📍 Google Maps
          </a>
        </div>
      </div>

      {item.hashtags && item.hashtags.length > 0 && (
        <div className="news-hashtags">
          {item.hashtags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
