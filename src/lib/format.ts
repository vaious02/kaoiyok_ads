const numberFmt = new Intl.NumberFormat('th-TH')
const decimalFmt = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const currencyFmt = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
})
// ค่าเล็ก ๆ อย่าง CPC/CPA ต้องเห็นทศนิยม ไม่งั้นปัดแล้วอ่านไม่ได้ความ
const currencyFineFmt = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatNumber = (value: number) => numberFmt.format(Math.round(value || 0))
export const formatDecimal = (value: number) => decimalFmt.format(value || 0)
export const formatCurrency = (value: number) => {
  const v = value || 0
  return Math.abs(v) > 0 && Math.abs(v) < 100 ? currencyFineFmt.format(v) : currencyFmt.format(v)
}
export const formatPercent = (value: number) => `${decimalFmt.format(value || 0)}%`

/** ย่อตัวเลขยาว ๆ ให้อ่านง่ายบนแกนกราฟ เช่น 12500 -> 12.5K */
export function formatCompact(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return numberFmt.format(Math.round(value))
}

/** yyyy-mm-dd ตามเวลาท้องถิ่น (ไม่ใช่ UTC) เพื่อไม่ให้วันเพี้ยน */
export function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** 2026-08-20 -> 20 ส.ค. */
export function formatShortDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatFullDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
