import { supabaseUrl } from '../lib/supabase'

export default function ConfigNotice() {
  return (
    <div className="config-notice">
      <div className="config-card">
        <span className="badge badge-warn">ยังตั้งค่าไม่ครบ</span>
        <h1>ต้องใส่ Supabase Anon Key ก่อน</h1>
        <p>
          แอปเชื่อมกับโปรเจกต์ <code>{supabaseUrl}</code> แล้ว แต่ยังไม่พบค่า{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>
        </p>

        <h2>รันบนเครื่อง</h2>
        <p>สร้างไฟล์ <code>.env</code> ที่รากโปรเจกต์:</p>
        <pre>{`VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}</pre>

        <h2>บน Netlify</h2>
        <p>
          ไปที่ <strong>Site configuration → Environment variables</strong> แล้วเพิ่มตัวแปรทั้งสองตัว
          จากนั้นสั่ง <strong>Deploy site → Clear cache and deploy</strong> อีกครั้ง
        </p>

        <p className="config-hint">
          หา anon key ได้ที่ Supabase Dashboard → Project Settings → API → Project API keys →{' '}
          <code>anon public</code> (คีย์นี้ปลอดภัยสำหรับใช้ฝั่งเบราว์เซอร์ เพราะถูกจำกัดสิทธิ์ด้วย
          Row Level Security)
        </p>
      </div>
    </div>
  )
}
