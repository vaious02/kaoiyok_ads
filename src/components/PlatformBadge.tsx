import type { Platform } from '../lib/database.types'

export const platformLabel: Record<Platform, string> = {
  facebook: 'Facebook Ads',
  google: 'Google Ads',
}

export default function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className={`platform-badge platform-${platform}`}>
      <span className="dot" aria-hidden="true" />
      {platformLabel[platform]}
    </span>
  )
}
