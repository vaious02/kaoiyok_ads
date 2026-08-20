import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_URL = 'https://cfmoqebpbzypkhplnqnr.supabase.co'

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_URL).trim()
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** true เมื่อค่า env ครบถ้วนพอที่จะเชื่อมต่อ Supabase ได้จริง */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * สร้าง client ครั้งเดียวแล้วใช้ซ้ำทั้งแอป
 * createClient จะ throw ถ้า key ว่าง จึงใส่ค่าหลอกไว้ก่อน แล้วให้ App.tsx
 * แสดงหน้าจอวิธีตั้งค่าแทน (ตรวจจาก isSupabaseConfigured) ก่อนเรียกใช้งานจริง
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || DEFAULT_URL,
  supabaseAnonKey || 'anon-key-not-configured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
