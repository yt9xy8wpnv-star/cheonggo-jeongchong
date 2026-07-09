-- 청고정총 Supabase Auth / Profile schema
-- Supabase SQL Editor에 그대로 실행할 수 있는 초안입니다.

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

-- 회원가입 생성은 Next.js 서버 라우트에서 service role key로 처리합니다.
-- 실제 배포 전에는 Supabase Dashboard에서 RLS 정책과 service role key 보관 상태를 다시 확인하세요.
