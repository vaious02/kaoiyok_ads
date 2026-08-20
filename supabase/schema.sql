-- =====================================================================
-- Kaoiyok Ads — Supabase schema
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > New query
--          วางไฟล์นี้ทั้งหมดแล้วกด Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ตาราง profiles : ข้อมูลผู้ใช้เพิ่มเติม (ผูกกับ auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  company     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) ตาราง campaigns : แคมเปญโฆษณา (Facebook / Google)
-- ---------------------------------------------------------------------
create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  platform      text not null check (platform in ('facebook', 'google')),
  objective     text,
  status        text not null default 'active' check (status in ('active', 'paused', 'ended')),
  daily_budget  numeric(14, 2) not null default 0,
  external_id   text,
  start_date    date,
  end_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists campaigns_user_id_idx on public.campaigns (user_id);
create index if not exists campaigns_platform_idx on public.campaigns (user_id, platform);

-- ---------------------------------------------------------------------
-- 3) ตาราง ad_metrics : ตัวเลขผลลัพธ์รายวันของแต่ละแคมเปญ
-- ---------------------------------------------------------------------
create table if not exists public.ad_metrics (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  campaign_id  uuid not null references public.campaigns (id) on delete cascade,
  date         date not null,
  impressions  bigint  not null default 0 check (impressions >= 0),
  clicks       bigint  not null default 0 check (clicks >= 0),
  spend        numeric(14, 2) not null default 0 check (spend >= 0),
  conversions  bigint  not null default 0 check (conversions >= 0),
  revenue      numeric(14, 2) not null default 0 check (revenue >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (campaign_id, date)
);

create index if not exists ad_metrics_user_date_idx on public.ad_metrics (user_id, date desc);
create index if not exists ad_metrics_campaign_idx on public.ad_metrics (campaign_id, date desc);

-- ---------------------------------------------------------------------
-- 4) Row Level Security : ผู้ใช้เห็นเฉพาะข้อมูลของตัวเองเท่านั้น
-- ---------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.campaigns  enable row level security;
alter table public.ad_metrics enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "campaigns_all_own" on public.campaigns;
create policy "campaigns_all_own" on public.campaigns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ad_metrics_all_own" on public.ad_metrics;
create policy "ad_metrics_all_own" on public.ad_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5) Trigger : สร้าง profile อัตโนมัติเมื่อมีการสมัครสมาชิกใหม่
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6) Trigger : อัปเดต updated_at ทุกครั้งที่แก้ไขแถว
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists campaigns_touch_updated_at on public.campaigns;
create trigger campaigns_touch_updated_at before update on public.campaigns
  for each row execute function public.touch_updated_at();

drop trigger if exists ad_metrics_touch_updated_at on public.ad_metrics;
create trigger ad_metrics_touch_updated_at before update on public.ad_metrics
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 7) View สรุปรายวันรวมทุกแพลตฟอร์ม (ใช้ทำกราฟได้เร็วขึ้น)
--    security_invoker = on  ทำให้ RLS ของตารางต้นทางยังมีผลอยู่
-- ---------------------------------------------------------------------
create or replace view public.daily_summary
with (security_invoker = on) as
select
  m.user_id,
  m.date,
  c.platform,
  sum(m.impressions) as impressions,
  sum(m.clicks)      as clicks,
  sum(m.spend)       as spend,
  sum(m.conversions) as conversions,
  sum(m.revenue)     as revenue
from public.ad_metrics m
join public.campaigns c on c.id = m.campaign_id
group by m.user_id, m.date, c.platform;
