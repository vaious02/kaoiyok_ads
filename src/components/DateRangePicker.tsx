import { addDays, toISODate } from '../lib/format'

export interface DateRange {
  from: string
  to: string
}

const presets = [
  { label: '7 วัน', days: 7 },
  { label: '14 วัน', days: 14 },
  { label: '30 วัน', days: 30 },
  { label: '90 วัน', days: 90 },
]

export function presetRange(days: number): DateRange {
  const today = new Date()
  return { from: toISODate(addDays(today, -(days - 1))), to: toISODate(today) }
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export default function DateRangePicker({ value, onChange }: Props) {
  const activeDays = presets.find((p) => {
    const r = presetRange(p.days)
    return r.from === value.from && r.to === value.to
  })?.days

  return (
    <div className="range-picker">
      <div className="preset-group" role="group" aria-label="ช่วงเวลา">
        {presets.map((preset) => (
          <button
            key={preset.days}
            type="button"
            className={`chip ${activeDays === preset.days ? 'is-active' : ''}`}
            onClick={() => onChange(presetRange(preset.days))}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="range-inputs">
        <input
          type="date"
          value={value.from}
          max={value.to}
          aria-label="วันที่เริ่มต้น"
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
        <span aria-hidden="true">–</span>
        <input
          type="date"
          value={value.to}
          min={value.from}
          aria-label="วันที่สิ้นสุด"
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </div>
    </div>
  )
}
