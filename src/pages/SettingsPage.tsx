import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchProfile, saveProfile } from '../lib/api'
import { describeError } from '../lib/errors'
import { supabase, supabaseUrl } from '../lib/supabase'

export default function SettingsPage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    fetchProfile()
      .then((profile) => {
        if (!active) return
        setFullName(
          profile?.full_name ?? ((user?.user_metadata?.full_name as string | undefined) ?? ''),
        )
        setCompany(profile?.company ?? '')
      })
      .catch((err) => active && setError(describeError(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await saveProfile({ full_name: fullName.trim(), company: company.trim() })
      await supabase.auth.updateUser({ data: { full_name: fullName.trim() } })
      setNotice('บันทึกโปรไฟล์เรียบร้อย')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setPassword('')
      setNotice('เปลี่ยนรหัสผ่านเรียบร้อย')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>ตั้งค่า</h1>
          <p className="page-sub">ข้อมูลบัญชีและการเชื่อมต่อฐานข้อมูล</p>
        </div>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {notice && <p className="alert alert-success">{notice}</p>}

      <section className="card">
        <header className="card-head">
          <h2>โปรไฟล์</h2>
        </header>
        <form className="form-grid" onSubmit={handleProfileSave}>
          <label className="field">
            <span>อีเมล</span>
            <input type="email" value={user?.email ?? ''} disabled />
          </label>
          <label className="field">
            <span>ชื่อ-นามสกุล</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="field">
            <span>ชื่อบริษัท / ร้าน</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={loading}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || loading}>
              บันทึกโปรไฟล์
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <header className="card-head">
          <h2>เปลี่ยนรหัสผ่าน</h2>
        </header>
        <form className="form-grid" onSubmit={handlePasswordChange}>
          <label className="field">
            <span>รหัสผ่านใหม่</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              autoComplete="new-password"
              minLength={6}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || !password}>
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <header className="card-head">
          <h2>การเชื่อมต่อ</h2>
        </header>
        <dl className="info-list">
          <div>
            <dt>Supabase URL</dt>
            <dd><code>{supabaseUrl}</code></dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd><code>{user?.id}</code></dd>
          </div>
          <div>
            <dt>ตารางที่ใช้</dt>
            <dd><code>profiles</code>, <code>campaigns</code>, <code>ad_metrics</code></dd>
          </div>
        </dl>
        <p className="muted">
          ข้อมูลทั้งหมดถูกป้องกันด้วย Row Level Security — ผู้ใช้แต่ละคนเห็นเฉพาะข้อมูลของตัวเองเท่านั้น
        </p>
      </section>
    </div>
  )
}
