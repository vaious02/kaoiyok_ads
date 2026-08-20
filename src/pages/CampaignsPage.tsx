import { useCallback, useEffect, useState, type FormEvent } from 'react'
import EmptyState from '../components/EmptyState'
import PlatformBadge from '../components/PlatformBadge'
import Spinner from '../components/Spinner'
import {
  createCampaign,
  deleteCampaign,
  fetchCampaigns,
  updateCampaign,
  type CampaignDraft,
} from '../lib/api'
import type { Campaign, CampaignStatus, Platform } from '../lib/database.types'
import { describeError } from '../lib/errors'
import { formatCurrency, formatFullDate, toISODate } from '../lib/format'

const statusLabel: Record<CampaignStatus, string> = {
  active: 'กำลังยิง',
  paused: 'หยุดชั่วคราว',
  ended: 'จบแล้ว',
}

const objectives = [
  'conversions',
  'traffic',
  'awareness',
  'engagement',
  'leads',
  'app_installs',
  'sales',
]

const emptyDraft = (): CampaignDraft => ({
  name: '',
  platform: 'facebook',
  objective: 'conversions',
  status: 'active',
  daily_budget: 0,
  external_id: '',
  start_date: toISODate(new Date()),
  end_date: null,
})

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCampaigns(await fetchCampaigns())
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setDraft(emptyDraft())
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (campaign: Campaign) => {
    setDraft({
      name: campaign.name,
      platform: campaign.platform,
      objective: campaign.objective ?? '',
      status: campaign.status,
      daily_budget: Number(campaign.daily_budget),
      external_id: campaign.external_id ?? '',
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    })
    setEditingId(campaign.id)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload: CampaignDraft = {
        ...draft,
        name: draft.name.trim(),
        external_id: draft.external_id?.trim() || null,
        end_date: draft.end_date || null,
      }
      if (editingId) {
        await updateCampaign(editingId, payload)
      } else {
        await createCampaign(payload)
      }
      closeForm()
      await load()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (campaign: Campaign) => {
    const ok = window.confirm(
      `ลบแคมเปญ "${campaign.name}" ใช่ไหม? ข้อมูลผลรายวันของแคมเปญนี้จะถูกลบไปด้วยและกู้คืนไม่ได้`,
    )
    if (!ok) return
    setError('')
    try {
      await deleteCampaign(campaign.id)
      await load()
    } catch (err) {
      setError(describeError(err))
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>แคมเปญ</h1>
          <p className="page-sub">จัดการรายชื่อแคมเปญของ Facebook Ads และ Google Ads</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + เพิ่มแคมเปญ
        </button>
      </header>

      {error && <p className="alert alert-error">{error}</p>}

      {formOpen && (
        <section className="card">
          <header className="card-head">
            <h2>{editingId ? 'แก้ไขแคมเปญ' : 'แคมเปญใหม่'}</h2>
          </header>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>ชื่อแคมเปญ *</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="เช่น FB — Retarget สินค้าขายดี"
                required
              />
            </label>

            <label className="field">
              <span>แพลตฟอร์ม *</span>
              <select
                value={draft.platform}
                onChange={(e) => setDraft({ ...draft, platform: e.target.value as Platform })}
              >
                <option value="facebook">Facebook Ads</option>
                <option value="google">Google Ads</option>
              </select>
            </label>

            <label className="field">
              <span>วัตถุประสงค์</span>
              <select
                value={draft.objective ?? ''}
                onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
              >
                {objectives.map((objective) => (
                  <option key={objective} value={objective}>
                    {objective}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>สถานะ</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as CampaignStatus })}
              >
                {(Object.keys(statusLabel) as CampaignStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {statusLabel[key]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>งบต่อวัน (บาท)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.daily_budget}
                onChange={(e) => setDraft({ ...draft, daily_budget: Number(e.target.value) })}
              />
            </label>

            <label className="field">
              <span>Campaign ID จากแพลตฟอร์ม</span>
              <input
                type="text"
                value={draft.external_id ?? ''}
                onChange={(e) => setDraft({ ...draft, external_id: e.target.value })}
                placeholder="ไม่บังคับ"
              />
            </label>

            <label className="field">
              <span>วันเริ่ม</span>
              <input
                type="date"
                value={draft.start_date ?? ''}
                onChange={(e) => setDraft({ ...draft, start_date: e.target.value || null })}
              />
            </label>

            <label className="field">
              <span>วันสิ้นสุด</span>
              <input
                type="date"
                value={draft.end_date ?? ''}
                min={draft.start_date ?? undefined}
                onChange={(e) => setDraft({ ...draft, end_date: e.target.value || null })}
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'กำลังบันทึก…' : 'บันทึก'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
                ยกเลิก
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <Spinner label="กำลังโหลดแคมเปญ…" />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="ยังไม่มีแคมเปญ"
          description="เริ่มจากเพิ่มแคมเปญของ Facebook หรือ Google ก่อน แล้วค่อยบันทึกผลรายวัน"
          action={
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              + เพิ่มแคมเปญแรก
            </button>
          }
        />
      ) : (
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ชื่อแคมเปญ</th>
                  <th>แพลตฟอร์ม</th>
                  <th>วัตถุประสงค์</th>
                  <th>สถานะ</th>
                  <th className="num">งบ/วัน</th>
                  <th>ช่วงเวลา</th>
                  <th aria-label="จัดการ" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="cell-name">
                      {campaign.name}
                      {campaign.external_id && <small className="muted"> #{campaign.external_id}</small>}
                    </td>
                    <td><PlatformBadge platform={campaign.platform} /></td>
                    <td>{campaign.objective || '—'}</td>
                    <td>
                      <span className={`status status-${campaign.status}`}>
                        {statusLabel[campaign.status]}
                      </span>
                    </td>
                    <td className="num">{formatCurrency(Number(campaign.daily_budget))}</td>
                    <td className="muted">
                      {campaign.start_date ? formatFullDate(campaign.start_date) : '—'}
                      {campaign.end_date ? ` – ${formatFullDate(campaign.end_date)}` : ''}
                    </td>
                    <td className="row-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(campaign)}>
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => void handleDelete(campaign)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
