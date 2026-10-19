-- ═══════════════════════════════════════════════════════════════════════════
-- Falaj Al-Qari — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Users ─────────────────────────────────────────────────────────────────
create table if not exists app_users (
  id            text primary key default gen_random_uuid()::text,
  full_name     text not null,
  username      text unique not null,
  password      text not null,
  phone         text,
  role          text not null default 'beneficiary'
                  check (role in ('beneficiary','admin','super_admin')),
  status        text not null default 'active'
                  check (status in ('active','suspended')),
  language      text not null default 'ar',
  holder_id     text,
  relation_type text,
  avatar        text,
  created_at    timestamptz default now()
);

-- ── Sessions (custom auth — "remember me") ────────────────────────────────
create table if not exists sessions (
  token      text primary key default gen_random_uuid()::text,
  user_id    text not null references app_users(id) on delete cascade,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '30 days'
);

-- ── Pending registrations ─────────────────────────────────────────────────
create table if not exists pending_registrations (
  id                   text primary key default gen_random_uuid()::text,
  full_name            text not null,
  phone                text,
  requested_holder_id  text,
  relation_type        text,
  relation_note        text,
  submitted_at         timestamptz default now()
);

-- ── Notifications (one row per user) ─────────────────────────────────────
create table if not exists notifications (
  id         text primary key default gen_random_uuid()::text,
  user_id    text references app_users(id) on delete cascade,
  title_ar   text not null,
  body       text,
  type       text not null default 'system',
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- ── Audit logs ────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id         bigserial primary key,
  actor      text,
  action     text not null,
  entity     text,
  at         text,
  created_at timestamptz default now()
);

-- ── Login logs ────────────────────────────────────────────────────────────
create table if not exists login_logs (
  id         bigserial primary key,
  user_id    text,
  full_name  text,
  username   text,
  role       text,
  at         text,
  ts         bigint,
  created_at timestamptz default now()
);

-- ── Holder name overrides ─────────────────────────────────────────────────
create table if not exists holder_name_overrides (
  holder_id  text primary key,
  name       text not null,
  updated_at timestamptz default now()
);

-- ── Name change requests ──────────────────────────────────────────────────
create table if not exists name_change_requests (
  id                text primary key default gen_random_uuid()::text,
  holder_id         text not null,
  current_name      text not null,
  new_name          text not null,
  reason            text,
  note              text,
  requested_by      text references app_users(id) on delete set null,
  requested_by_name text,
  requested_at      text,
  status            text default 'pending'
                      check (status in ('pending','approved','rejected')),
  reviewed_by       text,
  reviewed_at       text,
  created_at        timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Enable Realtime on notifications (for live push across devices)
-- ═══════════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table notifications;

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security — disable for now (demo app)
-- Enable and configure for production
-- ═══════════════════════════════════════════════════════════════════════════
alter table app_users               disable row level security;
alter table sessions                disable row level security;
alter table pending_registrations   disable row level security;
alter table notifications           disable row level security;
alter table audit_logs              disable row level security;
alter table login_logs              disable row level security;
alter table holder_name_overrides   disable row level security;
alter table name_change_requests    disable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: initial accounts
-- ═══════════════════════════════════════════════════════════════════════════
insert into app_users (id, full_name, username, password, phone, role, status, language)
values
  ('u04','فهد الدوسري',              'fahad',  'Athar@2026', '+96895000001', 'super_admin', 'active', 'ar'),
  ('u05','أحمد بن خلفان الرمضاني',   'admin1', 'Admin@2026', '+96896100001', 'admin',       'active', 'ar'),
  ('u06','سيف بن محمد التوبي',        'user1',  'User@2026',  '+96896200001', 'beneficiary', 'active', 'ar'),
  ('u07','خلفان بن علي الحضرمي',      'user2',  'User@2026',  '+96896200002', 'beneficiary', 'active', 'ar'),
  ('u08','هلال بن محمد الجابري',      'user3',  'User@2026',  '+96896200003', 'beneficiary', 'active', 'ar')
on conflict (id) do nothing;

-- Seed: sample pending registrations
insert into pending_registrations (id, full_name, phone, requested_holder_id, relation_type, relation_note, submitted_at)
values
  ('reg01','محمد بن خلفان الحضرمي','+96893333333','sh26','son', 'أنا ابن خلفان بن مراش الحضرمي المتوفى رحمه الله','2024-09-01T08:30:00'),
  ('reg02','سالم بن علي الجابري',  '+96894444444','sh19','heir','من أبناء علي بن هلال الجابري',                   '2024-09-02T10:15:00')
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done ✓
-- ═══════════════════════════════════════════════════════════════════════════
