import { formatDecimal } from '../lib/format'

interface Props {
  label: string
  value: string
  hint?: string
  change?: number
  /** true เมื่อค่าที่ลดลงถือเป็นเรื่องดี เช่น CPC, CPA */
  invertChange?: boolean
}

export default function StatCard({ label, value, hint, change, invertChange = false }: Props) {
  const hasChange = typeof change === 'number' && Number.isFinite(change)
  const isUp = hasChange && change > 0
  const isFlat = hasChange && Math.abs(change) < 0.05
  const good = invertChange ? !isUp : isUp
  const tone = !hasChange || isFlat ? 'flat' : good ? 'up' : 'down'

  return (
    <article className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <div className="stat-meta">
        {hasChange && (
          <span className={`delta delta-${tone}`}>
            {isFlat ? '→' : isUp ? '▲' : '▼'} {formatDecimal(Math.abs(change))}%
          </span>
        )}
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </article>
  )
}
