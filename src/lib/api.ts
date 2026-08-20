import { supabase } from './supabase'
import type {
  AdMetric,
  AdMetricWithCampaign,
  Campaign,
  Platform,
  Profile,
} from './database.types'

const METRIC_SELECT =
  'id, user_id, campaign_id, date, impressions, clicks, spend, conversions, revenue, created_at, updated_at, campaigns!inner ( id, name, platform, status )'

export async function requireUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('ยังไม่ได้เข้าสู่ระบบ')
  return data.user.id
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Campaign[]
}

export interface MetricFilter {
  from: string
  to: string
  platform?: Platform | 'all'
  campaignId?: string
}

export async function fetchMetrics(filter: MetricFilter): Promise<AdMetricWithCampaign[]> {
  let query = supabase
    .from('ad_metrics')
    .select(METRIC_SELECT)
    .gte('date', filter.from)
    .lte('date', filter.to)
    .order('date', { ascending: true })

  if (filter.platform && filter.platform !== 'all') {
    query = query.eq('campaigns.platform', filter.platform)
  }
  if (filter.campaignId) {
    query = query.eq('campaign_id', filter.campaignId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as AdMetricWithCampaign[]
}

export type CampaignDraft = Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export async function createCampaign(draft: CampaignDraft): Promise<Campaign> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ ...draft, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as Campaign
}

export async function updateCampaign(id: string, patch: Partial<CampaignDraft>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Campaign
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from('campaigns').delete().eq('id', id)
  if (error) throw error
}

export type MetricDraft = Omit<AdMetric, 'id' | 'user_id' | 'created_at' | 'updated_at'>

/**
 * บันทึกผลรายวัน — ถ้ามีข้อมูลของแคมเปญ+วันนั้นอยู่แล้วจะเขียนทับ
 * (อาศัย unique constraint (campaign_id, date) ในฐานข้อมูล)
 */
export async function upsertMetrics(drafts: MetricDraft[]) {
  if (drafts.length === 0) return
  const userId = await requireUserId()
  const rows = drafts.map((draft) => ({ ...draft, user_id: userId }))
  const { error } = await supabase
    .from('ad_metrics')
    .upsert(rows, { onConflict: 'campaign_id,date' })
  if (error) throw error
}

export async function deleteMetric(id: string) {
  const { error } = await supabase.from('ad_metrics').delete().eq('id', id)
  if (error) throw error
}

export async function fetchProfile(): Promise<Profile | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as Profile | null) ?? null
}

export async function saveProfile(patch: { full_name: string; company: string }) {
  const userId = await requireUserId()
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch }, { onConflict: 'id' })
  if (error) throw error
}
