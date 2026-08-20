-- =====================================================================
-- ข้อมูลตัวอย่าง (ไม่บังคับ) — รันหลังจาก schema.sql และหลังสมัครสมาชิกแล้ว
-- รันใน SQL Editor ขณะล็อกอินอยู่ก็ได้ หรือแก้ค่า v_user ให้เป็น user id ของคุณ
-- ดู user id ได้ที่ Supabase Dashboard > Authentication > Users
-- =====================================================================
do $$
declare
  v_user uuid := (select id from auth.users order by created_at limit 1);
  v_fb   uuid;
  v_gg   uuid;
  d      date;
begin
  if v_user is null then
    raise notice 'ยังไม่มีผู้ใช้ในระบบ — สมัครสมาชิกในเว็บก่อนแล้วค่อยรันไฟล์นี้';
    return;
  end if;

  insert into public.campaigns (user_id, name, platform, objective, status, daily_budget, start_date)
  values (v_user, 'FB — Retarget สินค้าขายดี', 'facebook', 'conversions', 'active', 1500, current_date - 29)
  returning id into v_fb;

  insert into public.campaigns (user_id, name, platform, objective, status, daily_budget, start_date)
  values (v_user, 'Google — Search แบรนด์', 'google', 'traffic', 'active', 1200, current_date - 29)
  returning id into v_gg;

  for d in select generate_series(current_date - 29, current_date, interval '1 day')::date loop
    insert into public.ad_metrics (user_id, campaign_id, date, impressions, clicks, spend, conversions, revenue)
    values (
      v_user, v_fb, d,
      (random() * 8000 + 4000)::bigint,
      (random() * 260 + 90)::bigint,
      round((random() * 700 + 900)::numeric, 2),
      (random() * 14 + 3)::bigint,
      round((random() * 5000 + 2500)::numeric, 2)
    ) on conflict (campaign_id, date) do nothing;

    insert into public.ad_metrics (user_id, campaign_id, date, impressions, clicks, spend, conversions, revenue)
    values (
      v_user, v_gg, d,
      (random() * 5000 + 2500)::bigint,
      (random() * 200 + 70)::bigint,
      round((random() * 500 + 700)::numeric, 2),
      (random() * 11 + 2)::bigint,
      round((random() * 4200 + 2000)::numeric, 2)
    ) on conflict (campaign_id, date) do nothing;
  end loop;
end $$;
