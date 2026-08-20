import type { ReactNode } from 'react'

interface Props {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
