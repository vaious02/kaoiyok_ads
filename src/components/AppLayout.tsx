import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'ภาพรวม', icon: '📊' },
  { to: '/campaigns', label: 'แคมเปญ', icon: '🎯' },
  { to: '/metrics', label: 'บันทึกผลรายวัน', icon: '📝' },
  { to: '/settings', label: 'ตั้งค่า', icon: '⚙️' },
]

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email || 'ผู้ใช้'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">📈</span>
          <div>
            <strong>Kaoiyok Ads</strong>
            <small>Ads Tracking</small>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar" aria-hidden="true">{initial}</div>
          <div className="sidebar-user">
            <strong title={displayName}>{displayName}</strong>
            <small title={user?.email ?? ''}>{user?.email}</small>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut}>
            ออก
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="scrim"
          aria-label="ปิดเมนู"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="content">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-ghost menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="เปิด/ปิดเมนู"
          >
            ☰
          </button>
          <span className="topbar-title">Kaoiyok Ads</span>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
