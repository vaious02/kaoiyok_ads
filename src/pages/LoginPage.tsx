import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup' | 'reset'

const titles: Record<Mode, string> = {
  signin: 'เข้าสู่ระบบ',
  signup: 'สมัครสมาชิก',
  reset: 'รีเซ็ตรหัสผ่าน',
}

/** แปลง error ของ Supabase เป็นข้อความภาษาไทยที่เข้าใจง่าย */
function friendlyError(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (m.includes('email not confirmed')) return 'ยังไม่ได้ยืนยันอีเมล กรุณาตรวจสอบกล่องจดหมาย'
  if (m.includes('user already registered')) return 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน'
  if (m.includes('password should be at least')) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
  if (m.includes('unable to validate email')) return 'รูปแบบอีเมลไม่ถูกต้อง'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'ลองบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'เชื่อมต่อ Supabase ไม่ได้ ตรวจสอบ URL / anon key และอินเทอร์เน็ต'
  return message
}

export default function LoginPage() {
  const { signIn, signUp, sendResetEmail } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)

    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        // การเปลี่ยนหน้าเกิดขึ้นเองผ่าน onAuthStateChange + <RedirectIfAuthed>
      } else if (mode === 'signup') {
        const { needsConfirm } = await signUp(email.trim(), password, fullName.trim())
        if (needsConfirm) {
          setNotice('สมัครสำเร็จ! กรุณายืนยันอีเมลจากลิงก์ที่ส่งไปให้ แล้วกลับมาเข้าสู่ระบบ')
          setMode('signin')
        }
      } else {
        await sendResetEmail(email.trim())
        setNotice('ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว')
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <span className="brand-mark lg" aria-hidden="true">📈</span>
        <h1>Kaoiyok Ads</h1>
        <p className="auth-tagline">
          รวมตัวเลข Facebook Ads และ Google Ads ไว้ที่เดียว เห็นยอดใช้จ่าย ยอดขาย และ ROAS
          ของทุกแคมเปญในหน้าจอเดียว
        </p>
        <ul className="auth-points">
          <li>ติดตาม Spend / Clicks / Conversions / ROAS รายวัน</li>
          <li>เปรียบเทียบผลระหว่าง Facebook กับ Google</li>
          <li>นำเข้าข้อมูลด้วย CSV และเก็บทุกอย่างไว้บน Supabase</li>
        </ul>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>{titles[mode]}</h2>
          <p className="auth-sub">
            {mode === 'signin' && 'ใส่อีเมลและรหัสผ่านเพื่อเข้าใช้งานแดชบอร์ด'}
            {mode === 'signup' && 'สร้างบัญชีใหม่เพื่อเริ่มบันทึกผลโฆษณา'}
            {mode === 'reset' && 'ใส่อีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้'}
          </p>

          {mode === 'signup' && (
            <label className="field">
              <span>ชื่อ-นามสกุล</span>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                required
              />
            </label>
          )}

          <label className="field">
            <span>อีเมล</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          {mode !== 'reset' && (
            <label className="field">
              <span>รหัสผ่าน</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </label>
          )}

          {error && <p className="alert alert-error">{error}</p>}
          {notice && <p className="alert alert-success">{notice}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'กำลังดำเนินการ…' : titles[mode]}
          </button>

          <div className="auth-links">
            {mode === 'signin' && (
              <>
                <button type="button" className="link" onClick={() => switchMode('signup')}>
                  ยังไม่มีบัญชี? สมัครสมาชิก
                </button>
                <button type="button" className="link" onClick={() => switchMode('reset')}>
                  ลืมรหัสผ่าน?
                </button>
              </>
            )}
            {mode !== 'signin' && (
              <button type="button" className="link" onClick={() => switchMode('signin')}>
                ← กลับไปหน้าเข้าสู่ระบบ
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}
