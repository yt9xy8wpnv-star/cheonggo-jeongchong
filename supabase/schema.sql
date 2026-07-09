-- 청고정총 Supabase Auth / Profile schema
-- Supabase SQL Editor에 그대로 실행할 수 있는 초안입니다.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  grade integer not null,
  class_number integer not null,
  student_number integer not null,
  role text not null default 'user',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz null,
  rejected_at timestamptz null,
  constraint profiles_role_check check (role in ('user', 'admin')),
  constraint profiles_status_check check (status in ('pending', 'approved', 'rejected')),
  constraint profiles_grade_check check (grade between 1 and 3),
  constraint profiles_class_check check (class_number between 1 and 20),
  constraint profiles_number_check check (student_number between 1 and 40)
);

create table if not exists public.subject_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  korean_subject text not null default '미응시',
  math_subject text not null default '미응시',
  english_subject text not null default '미응시',
  history_subject text not null default '응시',
  inquiry_subject_1 text not null default '미응시',
  inquiry_subject_2 text not null default '미응시',
  second_language_subject text not null default '미응시',
  updated_at timestamptz not null default now(),
  constraint subject_preferences_history_check check (history_subject = '응시')
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  study_date date not null,
  subject_key text not null,
  subject_label text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz null,
  duration_seconds integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_sessions_subject_key_check check (
    subject_key in (
      'korean',
      'math',
      'english',
      'history',
      'inquiry_1',
      'inquiry_2',
      'second_language'
    )
  ),
  constraint study_sessions_duration_check check (
    duration_seconds is null or duration_seconds >= 0
  ),
  constraint study_sessions_end_check check (
    ended_at is null or ended_at >= started_at
  )
);

create index if not exists study_sessions_user_date_idx
on public.study_sessions (user_id, study_date);

create index if not exists study_sessions_date_idx
on public.study_sessions (study_date);

create index if not exists study_sessions_active_idx
on public.study_sessions (user_id, ended_at)
where ended_at is null;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table public.study_sessions;
  end if;
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subject_preferences_set_updated_at on public.subject_preferences;

create trigger subject_preferences_set_updated_at
before update on public.subject_preferences
for each row
execute function public.set_updated_at();

drop trigger if exists study_sessions_set_updated_at on public.study_sessions;

create trigger study_sessions_set_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  );
$$;

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(trim(p_username))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.subject_preferences enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists subject_preferences_select_self_or_admin on public.subject_preferences;
create policy subject_preferences_select_self_or_admin
on public.subject_preferences
for select
using (profile_id = auth.uid() or public.is_admin());

drop policy if exists subject_preferences_update_self_or_admin on public.subject_preferences;
create policy subject_preferences_update_self_or_admin
on public.subject_preferences
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists study_sessions_select_self_or_admin on public.study_sessions;
drop policy if exists study_sessions_select_approved on public.study_sessions;
create policy study_sessions_select_approved
on public.study_sessions
for select
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  )
);

drop policy if exists study_sessions_insert_approved_self on public.study_sessions;
create policy study_sessions_insert_approved_self
on public.study_sessions
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  )
);

drop policy if exists study_sessions_update_self_or_admin on public.study_sessions;
create policy study_sessions_update_self_or_admin
on public.study_sessions
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- 회원가입 생성은 Next.js 서버 라우트에서 service role key로 처리합니다.
-- 실제 배포 전에는 Supabase Dashboard에서 RLS 정책과 service role key 보관 상태를 다시 확인하세요.
