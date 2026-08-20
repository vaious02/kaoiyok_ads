import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DateRangePicker, { presetRange, type DateRange } from '../components/DateRangePicker'
import EmptyState from '../components/EmptyState'
import PlatformBadge, { platformLabel } from '../components/PlatformBadge'
import Spinner from '../components/Spinner'
import StatCard from '../components/StatCard'
import { fetchMetrics } from '../lib/api'
import type { AdMetricWithCampaign, Platform } from '../lib/database.types'
import { describeError } from '../lib/errors'
import {
  addDays,
  formatCompact,
  formatCurrency,
  formatDecimal,
  formatNumber,
  formatPercent,
  formatShortDate,
  toISODate,
} from '../lib/format'
import {
  changePercent,
  groupByCampaign,
  groupByDay,
  groupByPlatform,
  sumTotals,
  withDerived,
} from '../lib/metrics'

const COLORS = {
  facebook: '#3b82f6',
  google: '#f59e0b',
  spend: '#38bdf8',
  revenue: '#22c55e',
  clicks: '#a78bfa',
  conversions: '#f472b6',
}

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** ช่วงเวลาก่อนหน้าที่ยาวเท่ากัน สำหรับเปรียบเทียบ % การเปลี่ยนแปลง */
function previousRange(range: DateRange): DateRange {
  const from = parseISO(range.from)
  const to = parseISO(range.to)
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1)
  return { from: toISODate(addDays(from, -days)), to: toISODate(addDays(from, -1)) }
}

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>(() => presetRange(30))
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [rows, setRows] = useState<AdMetricWithCampaign[]>([])
  const [prevRows, setPrevRows] = useState<AdMetricWithCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const prev = previousRange(range)
      const [current, previous] = await Promise.all([
        fetchMetrics({ ...range, platform }),
        fetchMetrics({ ...prev, platform }),
      ])
      setRows(current)
      setPrevRows(previous)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [range, platform])

  useEffect(() => {
    void load()
  }, [load])

  const totals = useMemo(() => withDerived(sumTotals(rows)), [rows])
  const prevTotals = useMemo(() => withDerived(sumTotals(prevRows)), [prevRows])
  const daily = useMemo(() => groupByDay(rows), [rows])
  const byPlatform = useMemo(() => groupByPlatform(rows), [rows])
  const byCampaign = useMemo(() => groupByCampaign(rows), [rows])

  const spendShare = useMemo(
    () =>
      (['facebook', 'google'] as Platform[])
        .map((key) => ({ name: platformLabel[key], key, value: byPlatform[key].spend }))
        .filter((slice) => slice.value > 0),
    [byPlatform],
  )

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>ภาพรวมโฆษณา</h1>
          <p className="page-sub">สรุปผล Facebook Ads และ Google Ads เทียบกับช่วงก่อนหน้าที่ยาวเท่ากัน</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void load()} disabled={loading}>
          ↻ รีเฟรช
        </button>
      </header>

      <div className="filter-bar">
        <DateRangePicker value={range} onChange={setRange} />
        <div className="preset-group" role="group" aria-label="แพลตฟอร์ม">
          {(['all', 'facebook', 'google'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${platform === key ? 'is-active' : ''}`}
              onClick={() => setPlatform(key)}
            >
              {key === 'all' ? 'ทั้งหมด' : platformLabel[key]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <Spinner label="กำลังดึงข้อมูลจาก Supabase…" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="📊"
          title="ยังไม่มีข้อมูลในช่วงเวลานี้"
          description="สร้างแคมเปญแล้วบันทึกผลรายวัน หรือใช้การนำเข้า CSV เพื่อเริ่มดูรายงาน"
          action={
            <Link className="btn btn-primary" to="/campaigns">
              ไปสร้างแคมเปญ
            </Link>
          }
        />
      ) : (
        <>
          <section className="stat-grid">
            <StatCard
              label="ยอดใช้จ่ายรวม"
              value={formatCurrency(totals.spend)}
              change={changePercent(totals.spend, prevTotals.spend)}
              invertChange
            />
            <StatCard
              label="รายได้"
              value={formatCurrency(totals.revenue)}
              change={changePercent(totals.revenue, prevTotals.revenue)}
            />
            <StatCard
              label="ROAS"
              value={`${formatDecimal(totals.roas)}x`}
              hint={`กำไรขั้นต้น ${formatCurrency(totals.revenue - totals.spend)}`}
              change={changePercent(totals.roas, prevTotals.roas)}
            />
            <StatCard
              label="Conversions"
              value={formatNumber(totals.conversions)}
              hint={`CPA ${formatCurrency(totals.cpa)}`}
              change={changePercent(totals.conversions, prevTotals.conversions)}
            />
            <StatCard
              label="คลิก"
              value={formatNumber(totals.clicks)}
              hint={`CPC ${formatCurrency(totals.cpc)}`}
              change={changePercent(totals.clicks, prevTotals.clicks)}
            />
            <StatCard
              label="Impressions"
              value={formatNumber(totals.impressions)}
              hint={`CPM ${formatCurrency(totals.cpm)}`}
              change={changePercent(totals.impressions, prevTotals.impressions)}
            />
            <StatCard
              label="CTR"
              value={formatPercent(totals.ctr)}
              change={changePercent(totals.ctr, prevTotals.ctr)}
            />
            <StatCard
              label="อัตราการปิดการขาย"
              value={formatPercent(totals.convRate)}
              hint="Conversions ÷ Clicks"
              change={changePercent(totals.convRate, prevTotals.convRate)}
            />
          </section>

          <section className="card">
            <header className="card-head">
              <h2>ยอดใช้จ่ายเทียบรายได้รายวัน</h2>
            </header>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.spend} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COLORS.spend} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.revenue} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COLORS.revenue} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="var(--muted)" tickLine={false} />
                  <YAxis tickFormatter={formatCompact} stroke="var(--muted)" tickLine={false} axisLine={false} width={56} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(v) => formatShortDate(String(v))}
                    formatter={(value: number, name) => [formatCurrency(value), name]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    name="ใช้จ่าย"
                    stroke={COLORS.spend}
                    fill="url(#gSpend)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="รายได้"
                    stroke={COLORS.revenue}
                    fill="url(#gRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid-2">
            <section className="card">
              <header className="card-head">
                <h2>ใช้จ่ายแยกตามแพลตฟอร์ม</h2>
              </header>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="var(--muted)" tickLine={false} />
                    <YAxis tickFormatter={formatCompact} stroke="var(--muted)" tickLine={false} axisLine={false} width={56} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(v) => formatShortDate(String(v))}
                      formatter={(value: number, name) => [formatCurrency(value), name]}
                    />
                    <Legend />
                    <Bar dataKey="facebookSpend" name="Facebook" stackId="s" fill={COLORS.facebook} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="googleSpend" name="Google" stackId="s" fill={COLORS.google} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card">
              <header className="card-head">
                <h2>สัดส่วนงบประมาณ</h2>
              </header>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={spendShare}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {spendShare.map((slice) => (
                        <Cell key={slice.key} fill={COLORS[slice.key]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="card">
            <header className="card-head">
              <h2>คลิกและ Conversions รายวัน</h2>
            </header>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="var(--muted)" tickLine={false} />
                  <YAxis yAxisId="left" tickFormatter={formatCompact} stroke="var(--muted)" tickLine={false} axisLine={false} width={56} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={formatCompact} stroke="var(--muted)" tickLine={false} axisLine={false} width={48} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(v) => formatShortDate(String(v))}
                    formatter={(value: number, name) => [formatNumber(value), name]}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" name="คลิก" stroke={COLORS.clicks} strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke={COLORS.conversions} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card">
            <header className="card-head">
              <h2>ผลงานรายแคมเปญ</h2>
              <Link className="link" to="/campaigns">
                จัดการแคมเปญ →
              </Link>
            </header>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>แคมเปญ</th>
                    <th>แพลตฟอร์ม</th>
                    <th className="num">ใช้จ่าย</th>
                    <th className="num">รายได้</th>
                    <th className="num">คลิก</th>
                    <th className="num">CTR</th>
                    <th className="num">CPC</th>
                    <th className="num">Conv.</th>
                    <th className="num">CPA</th>
                    <th className="num">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {byCampaign.map((row) => (
                    <tr key={row.campaignId}>
                      <td className="cell-name">{row.name}</td>
                      <td><PlatformBadge platform={row.platform} /></td>
                      <td className="num">{formatCurrency(row.spend)}</td>
                      <td className="num">{formatCurrency(row.revenue)}</td>
                      <td className="num">{formatNumber(row.clicks)}</td>
                      <td className="num">{formatPercent(row.ctr)}</td>
                      <td className="num">{formatCurrency(row.cpc)}</td>
                      <td className="num">{formatNumber(row.conversions)}</td>
                      <td className="num">{formatCurrency(row.cpa)}</td>
                      <td className={`num ${row.roas >= 1 ? 'pos' : 'neg'}`}>
                        {formatDecimal(row.roas)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

const tooltipStyle: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text)',
}
