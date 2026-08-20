import type { AdMetricWithCampaign, Platform } from './database.types'

export interface Totals {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
}

export interface DerivedTotals extends Totals {
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas: number
  convRate: number
}

export const emptyTotals = (): Totals => ({
  impressions: 0,
  clicks: 0,
  spend: 0,
  conversions: 0,
  revenue: 0,
})

export function sumTotals(rows: Array<Partial<Totals>>): Totals {
  return rows.reduce<Totals>((acc, row) => {
    acc.impressions += Number(row.impressions ?? 0)
    acc.clicks += Number(row.clicks ?? 0)
    acc.spend += Number(row.spend ?? 0)
    acc.conversions += Number(row.conversions ?? 0)
    acc.revenue += Number(row.revenue ?? 0)
    return acc
  }, emptyTotals())
}

const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0)

/** เติมค่าที่คำนวณได้ (CTR, CPC, CPA, ROAS ฯลฯ) ให้กับยอดรวม */
export function withDerived(totals: Totals): DerivedTotals {
  return {
    ...totals,
    ctr: safeDiv(totals.clicks, totals.impressions) * 100,
    cpc: safeDiv(totals.spend, totals.clicks),
    cpm: safeDiv(totals.spend, totals.impressions) * 1000,
    cpa: safeDiv(totals.spend, totals.conversions),
    roas: safeDiv(totals.revenue, totals.spend),
    convRate: safeDiv(totals.conversions, totals.clicks) * 100,
  }
}

export interface DailyPoint extends Totals {
  date: string
  facebookSpend: number
  googleSpend: number
}

/** รวมตัวเลขเป็นรายวัน และแยกยอดใช้จ่ายตามแพลตฟอร์มสำหรับกราฟซ้อน */
export function groupByDay(rows: AdMetricWithCampaign[]): DailyPoint[] {
  const map = new Map<string, DailyPoint>()

  for (const row of rows) {
    const point = map.get(row.date) ?? {
      date: row.date,
      ...emptyTotals(),
      facebookSpend: 0,
      googleSpend: 0,
    }
    point.impressions += Number(row.impressions)
    point.clicks += Number(row.clicks)
    point.spend += Number(row.spend)
    point.conversions += Number(row.conversions)
    point.revenue += Number(row.revenue)
    if (row.campaigns?.platform === 'facebook') point.facebookSpend += Number(row.spend)
    if (row.campaigns?.platform === 'google') point.googleSpend += Number(row.spend)
    map.set(row.date, point)
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function groupByPlatform(rows: AdMetricWithCampaign[]): Record<Platform, DerivedTotals> {
  const facebook = rows.filter((r) => r.campaigns?.platform === 'facebook')
  const google = rows.filter((r) => r.campaigns?.platform === 'google')
  return {
    facebook: withDerived(sumTotals(facebook)),
    google: withDerived(sumTotals(google)),
  }
}

export interface CampaignRollup extends DerivedTotals {
  campaignId: string
  name: string
  platform: Platform
}

export function groupByCampaign(rows: AdMetricWithCampaign[]): CampaignRollup[] {
  const map = new Map<string, { name: string; platform: Platform; rows: AdMetricWithCampaign[] }>()

  for (const row of rows) {
    if (!row.campaigns) continue
    const entry = map.get(row.campaign_id) ?? {
      name: row.campaigns.name,
      platform: row.campaigns.platform,
      rows: [],
    }
    entry.rows.push(row)
    map.set(row.campaign_id, entry)
  }

  return [...map.entries()]
    .map(([campaignId, entry]) => ({
      campaignId,
      name: entry.name,
      platform: entry.platform,
      ...withDerived(sumTotals(entry.rows)),
    }))
    .sort((a, b) => b.spend - a.spend)
}

/** เปอร์เซ็นต์การเปลี่ยนแปลงเทียบช่วงก่อนหน้า */
export function changePercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}
