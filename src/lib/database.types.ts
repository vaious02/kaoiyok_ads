export type Platform = 'facebook' | 'google'
export type CampaignStatus = 'active' | 'paused' | 'ended'

export interface Campaign {
  id: string
  user_id: string
  name: string
  platform: Platform
  objective: string | null
  status: CampaignStatus
  daily_budget: number
  external_id: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface AdMetric {
  id: string
  user_id: string
  campaign_id: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  company: string | null
  created_at: string
  updated_at: string
}

/** metric พร้อมข้อมูลแคมเปญที่ join มาด้วย (ใช้ใน select ที่มี relation) */
export type AdMetricWithCampaign = AdMetric & {
  campaigns: Pick<Campaign, 'id' | 'name' | 'platform' | 'status'> | null
}
