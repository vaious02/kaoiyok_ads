import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import DateRangePicker, { presetRange, type DateRange } from '../components/DateRangePicker'
import EmptyState from '../components/EmptyState'
import PlatformBadge from '../components/PlatformBadge'
import Spinner from '../components/Spinner'
import {
  deleteMetric,
  fetchCampaigns,
  fetchMetrics,
  upsertMetrics,
  type MetricDraft,
} from '../lib/api'
import { downloadCsv, parseCsv, parseNumber, toCsv } from '../lib/csv'
import type { AdMetricWithCampaign, Campaign } from '../lib/database.types'
import { describeError } from '../lib/errors'
import { formatCurrency, formatFullDate, formatNumber, toISODate } from '../lib/format'

const emptyForm = () => ({
  campaign_id: '',
  date: toISODate(new Date()),
  impressions: '',
  clicks: '',
  spend: '',
  conversions: '',
  revenue: '',
})

const CSV_HEADERS = ['date', 'campaign', 'impressions', 'clicks', 'spend', 'conversions', 'revenue']

/** จำนวนแถวที่แสดงต่อครั้ง ตารางยาวมากทำให้หน้าเว็บหนัก */
const PAGE_SIZE = 50

export default function MetricsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [rows, setRows] = useState<AdMetricWithCampaign[]>([])
  const [range, setRange] = useState<DateRange>(() => presetRange(30))
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [campaignList, metricList] = await Promise.all([fetchCampaigns(), fetchMetrics(range)])
      setCampaigns(campaignList)
      setRows([...metricList].reverse())
      setVisibleCount(PAGE_SIZE)
      setForm((prev) =>
        prev.campaign_id ? prev : { ...prev, campaign_id: campaignList[0]?.id ?? '' },
      )
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    void load()
  }, [load])

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount])

  const campaignByName = useMemo(() => {
    const map = new Map<string, Campaign>()
    for (const campaign of campaigns) {
      map.set(campaign.name.trim().toLowerCase(), campaign)
      if (campaign.external_id) map.set(campaign.external_id.trim().toLowerCase(), campaign)
    }
    return map
  }, [campaigns])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.campaign_id) {
      setError('เลือกแคมเปญก่อนบันทึก')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const draft: MetricDraft = {
        campaign_id: form.campaign_id,
        date: form.date,
        impressions: Math.max(0, Math.round(Number(form.impressions) || 0)),
        clicks: Math.max(0, Math.round(Number(form.clicks) || 0)),
        spend: Math.max(0, Number(form.spend) || 0),
        conversions: Math.max(0, Math.round(Number(form.conversions) || 0)),
        revenue: Math.max(0, Number(form.revenue) || 0),
      }
      await upsertMetrics([draft])
      setNotice(`บันทึกข้อมูลวันที่ ${formatFullDate(draft.date)} เรียบร้อย`)
      setForm((prev) => ({ ...emptyForm(), campaign_id: prev.campaign_id, date: prev.date }))
      await load()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: AdMetricWithCampaign) => {
    if (!window.confirm(`ลบข้อมูลวันที่ ${formatFullDate(row.date)} ของแคมเปญนี้ใช่ไหม?`)) return
    try {
      await deleteMetric(row.id)
      await load()
    } catch (err) {
      setError(describeError(err))
    }
  }

  const handleImport = async (file: File) => {
    setError('')
    setNotice('')
    try {
      const table = parseCsv(await file.text())
      const missing = ['date', 'campaign'].filter((h) => !table.headers.includes(h))
      if (missing.length > 0) {
        setError(`ไฟล์ CSV ต้องมีคอลัมน์: ${CSV_HEADERS.join(', ')} (ขาด ${missing.join(', ')})`)
        return
      }

      const drafts: MetricDraft[] = []
      const unknown = new Set<string>()

      for (const row of table.rows) {
        const key = (row.campaign ?? '').trim().toLowerCase()
        const campaign = campaignByName.get(key)
        if (!campaign) {
          if (key) unknown.add(row.campaign)
          continue
        }
        const date = (row.date ?? '').trim()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue

        drafts.push({
          campaign_id: campaign.id,
          date,
          impressions: Math.round(parseNumber(row.impressions)),
          clicks: Math.round(parseNumber(row.clicks)),
          spend: parseNumber(row.spend),
          conversions: Math.round(parseNumber(row.conversions)),
          revenue: parseNumber(row.revenue),
        })
      }

      if (drafts.length === 0) {
        setError('ไม่พบแถวที่นำเข้าได้ — ตรวจสอบชื่อแคมเปญให้ตรงกับที่มีในระบบ และวันที่รูปแบบ YYYY-MM-DD')
        return
      }

      await upsertMetrics(drafts)
      const warn = unknown.size > 0 ? ` (ข้ามแคมเปญที่ไม่รู้จัก: ${[...unknown].join(', ')})` : ''
      setNotice(`นำเข้า ${drafts.length} แถวเรียบร้อย${warn}`)
      await load()
    } catch (err) {
      setError(describeError(err))
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const handleExport = () => {
    const data = rows.map((row) => [
      row.date,
      row.campaigns?.name ?? '',
      row.impressions,
      row.clicks,
      row.spend,
      row.conversions,
      row.revenue,
    ])
    downloadCsv(`kaoiyok-ads-${range.from}_${range.to}.csv`, toCsv(CSV_HEADERS, data))
  }

  const downloadTemplate = () => {
    const sample = campaigns[0]?.name ?? 'ชื่อแคมเปญของคุณ'
    downloadCsv(
      'kaoiyok-ads-template.csv',
      toCsv(CSV_HEADERS, [[toISODate(new Date()), sample, 12000, 240, 1500, 8, 6400]]),
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>บันทึกผลรายวัน</h1>
          <p className="page-sub">
            กรอกตัวเลขจาก Ads Manager ของแต่ละวัน หรือดึงรายงานออกมาเป็น CSV แล้วนำเข้าทีเดียว
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-ghost" onClick={downloadTemplate}>
            ⬇ เทมเพลต CSV
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleExport}
            disabled={rows.length === 0}
          >
            ⬇ ส่งออกข้อมูล
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInput.current?.click()}
            disabled={campaigns.length === 0}
          >
            ⬆ นำเข้า CSV
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImport(file)
            }}
          />
        </div>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {notice && <p className="alert alert-success">{notice}</p>}

      {campaigns.length === 0 && !loading ? (
        <EmptyState
          icon="🎯"
          title="ต้องมีแคมเปญก่อน"
          description="สร้างแคมเปญอย่างน้อยหนึ่งรายการ แล้วจึงบันทึกผลรายวันได้"
          action={
            <Link className="btn btn-primary" to="/campaigns">
              ไปหน้าแคมเปญ
            </Link>
          }
        />
      ) : (
        <>
          <section className="card">
            <header className="card-head">
              <h2>เพิ่ม / อัปเดตข้อมูลรายวัน</h2>
              <small className="muted">บันทึกซ้ำวันเดิมของแคมเปญเดิมจะเป็นการเขียนทับ</small>
            </header>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="field">
                <span>แคมเปญ *</span>
                <select
                  value={form.campaign_id}
                  onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
                  required
                >
                  <option value="">— เลือกแคมเปญ —</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.platform === 'facebook' ? 'FB' : 'GG'} · {campaign.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>วันที่ *</span>
                <input
                  type="date"
                  value={form.date}
                  max={toISODate(new Date())}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>Impressions</span>
                <input
                  type="number"
                  min={0}
                  value={form.impressions}
                  onChange={(e) => setForm({ ...form, impressions: e.target.value })}
                  placeholder="0"
                />
              </label>

              <label className="field">
                <span>คลิก</span>
                <input
                  type="number"
                  min={0}
                  value={form.clicks}
                  onChange={(e) => setForm({ ...form, clicks: e.target.value })}
                  placeholder="0"
                />
              </label>

              <label className="field">
                <span>ยอดใช้จ่าย (บาท)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.spend}
                  onChange={(e) => setForm({ ...form, spend: e.target.value })}
                  placeholder="0.00"
                />
              </label>

              <label className="field">
                <span>Conversions</span>
                <input
                  type="number"
                  min={0}
                  value={form.conversions}
                  onChange={(e) => setForm({ ...form, conversions: e.target.value })}
                  placeholder="0"
                />
              </label>

              <label className="field">
                <span>รายได้ (บาท)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.revenue}
                  onChange={(e) => setForm({ ...form, revenue: e.target.value })}
                  placeholder="0.00"
                />
              </label>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <header className="card-head">
              <h2>ข้อมูลที่บันทึกไว้</h2>
              <DateRangePicker value={range} onChange={setRange} />
            </header>

            {loading ? (
              <Spinner label="กำลังโหลดข้อมูล…" />
            ) : rows.length === 0 ? (
              <EmptyState
                icon="📝"
                title="ยังไม่มีข้อมูลในช่วงนี้"
                description="ลองขยายช่วงวันที่ หรือเพิ่มข้อมูลจากฟอร์มด้านบน"
              />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>แคมเปญ</th>
                      <th>แพลตฟอร์ม</th>
                      <th className="num">Impr.</th>
                      <th className="num">คลิก</th>
                      <th className="num">ใช้จ่าย</th>
                      <th className="num">Conv.</th>
                      <th className="num">รายได้</th>
                      <th aria-label="จัดการ" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatFullDate(row.date)}</td>
                        <td className="cell-name">{row.campaigns?.name ?? '—'}</td>
                        <td>
                          {row.campaigns && <PlatformBadge platform={row.campaigns.platform} />}
                        </td>
                        <td className="num">{formatNumber(row.impressions)}</td>
                        <td className="num">{formatNumber(row.clicks)}</td>
                        <td className="num">{formatCurrency(Number(row.spend))}</td>
                        <td className="num">{formatNumber(row.conversions)}</td>
                        <td className="num">{formatCurrency(Number(row.revenue))}</td>
                        <td className="row-actions">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => void handleDelete(row)}
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleCount < rows.length && (
                  <div className="table-more">
                    <span className="muted">
                      แสดง {visibleRows.length} จาก {rows.length} แถว
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      แสดงเพิ่ม
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
