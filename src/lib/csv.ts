/** แยกบรรทัด CSV โดยรองรับค่าที่ครอบด้วยเครื่องหมายคำพูด */
export function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      out.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  out.push(current.trim())
  return out
}

export interface CsvTable {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsv(text: string): CsvTable {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/^﻿/, ''))
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? '']))
  })

  return { headers, rows }
}

const escapeCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export function toCsv(headers: string[], rows: (string | number)[][]) {
  const body = rows.map((row) => row.map((cell) => escapeCell(String(cell))).join(','))
  return [headers.join(','), ...body].join('\n')
}

export function downloadCsv(filename: string, content: string) {
  // เพิ่ม BOM เพื่อให้ Excel ภาษาไทยอ่านไฟล์ได้ถูกต้อง
  const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** รับตัวเลขจาก CSV ที่อาจมี comma, สัญลักษณ์สกุลเงิน หรือ % ปนมา */
export function parseNumber(value: string): number {
  if (!value) return 0
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}
