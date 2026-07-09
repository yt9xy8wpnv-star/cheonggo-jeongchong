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

alter table public.study_sessions replica identity full;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  board_type text not null default 'free',
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  status text not null default 'published',
  is_pinned boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint community_posts_board_type_check check (
    board_type in ('free', 'study', 'qna', 'resources', 'reviews')
  ),
  constraint community_posts_status_check check (
    status in ('published', 'hidden', 'deleted')
  ),
  constraint community_posts_title_length_check check (
    char_length(title) between 2 and 200
  ),
  constraint community_posts_content_length_check check (
    char_length(content) between 2 and 5000
  ),
  constraint community_posts_view_count_check check (view_count >= 0)
);

create table if not exists public.community_post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid null references public.community_comments(id) on delete cascade,
  content text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint community_comments_status_check check (
    status in ('published', 'hidden', 'deleted')
  ),
  constraint community_comments_content_length_check check (
    char_length(content) between 1 and 2000
  )
);

create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null,
  created_at timestamptz not null default now(),
  constraint community_reactions_target_type_check check (
    target_type in ('post', 'comment')
  ),
  constraint community_reactions_reaction_type_check check (
    reaction_type in ('like', 'dislike')
  ),
  constraint community_reactions_unique_target unique (
    target_type,
    target_id,
    user_id
  )
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  constraint community_reports_target_type_check check (
    target_type in ('post', 'comment')
  ),
  constraint community_reports_status_check check (
    status in ('pending', 'resolved', 'rejected')
  )
);

create table if not exists public.community_study_certifications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  study_date date not null,
  captured_at timestamptz not null default now(),
  total_seconds integer not null default 0,
  korean_seconds integer not null default 0,
  math_seconds integer not null default 0,
  english_seconds integer not null default 0,
  history_seconds integer not null default 0,
  inquiry_1_seconds integer not null default 0,
  inquiry_2_seconds integer not null default 0,
  second_language_seconds integer not null default 0,
  korean_subject text null,
  math_subject text null,
  english_subject text null,
  history_subject text null default '응시',
  inquiry_subject_1 text null,
  inquiry_subject_2 text null,
  second_language_subject text null,
  rank_position integer null,
  is_rank_1 boolean not null default false,
  rank_total_users integer null,
  created_at timestamptz not null default now(),
  constraint community_study_certifications_total_check check (total_seconds >= 0),
  constraint community_study_certifications_subject_total_check check (
    korean_seconds >= 0
    and math_seconds >= 0
    and english_seconds >= 0
    and history_seconds >= 0
    and inquiry_1_seconds >= 0
    and inquiry_2_seconds >= 0
    and second_language_seconds >= 0
  ),
  constraint community_study_certifications_rank_check check (
    rank_position is null or rank_position > 0
  ),
  constraint community_study_certifications_rank_total_check check (
    rank_total_users is null or rank_total_users >= 0
  )
);

create index if not exists study_sessions_user_date_idx
on public.study_sessions (user_id, study_date);

create index if not exists study_sessions_date_idx
on public.study_sessions (study_date);

create index if not exists study_sessions_active_idx
on public.study_sessions (user_id, ended_at)
where ended_at is null;

create index if not exists community_posts_board_status_created_idx
on public.community_posts (board_type, status, created_at desc);

create index if not exists community_posts_user_idx
on public.community_posts (user_id);

create index if not exists community_posts_view_count_idx
on public.community_posts (view_count desc);

create index if not exists community_comments_post_created_idx
on public.community_comments (post_id, created_at);

create index if not exists community_reactions_target_idx
on public.community_reactions (target_type, target_id);

create index if not exists community_post_images_post_idx
on public.community_post_images (post_id, order_index);

create index if not exists community_study_certifications_post_idx
on public.community_study_certifications (post_id);

create index if not exists community_study_certifications_user_date_idx
on public.community_study_certifications (user_id, study_date);

create index if not exists community_study_certifications_date_idx
on public.community_study_certifications (study_date);

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

drop trigger if exists community_posts_set_updated_at on public.community_posts;

create trigger community_posts_set_updated_at
before update on public.community_posts
for each row
execute function public.set_updated_at();

drop trigger if exists community_comments_set_updated_at on public.community_comments;

create trigger community_comments_set_updated_at
before update on public.community_comments
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
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.subject_preferences enable row level security;
alter table public.study_sessions enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_post_images enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_study_certifications enable row level security;

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

drop policy if exists community_posts_select_published on public.community_posts;
create policy community_posts_select_published
on public.community_posts
for select
using (status = 'published');

drop policy if exists community_posts_select_self_or_admin on public.community_posts;
create policy community_posts_select_self_or_admin
on public.community_posts
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists community_posts_insert_approved_self on public.community_posts;
create policy community_posts_insert_approved_self
on public.community_posts
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

drop policy if exists community_posts_update_self_or_admin on public.community_posts;
create policy community_posts_update_self_or_admin
on public.community_posts
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists community_post_images_select_published_post on public.community_post_images;
create policy community_post_images_select_published_post
on public.community_post_images
for select
using (
  exists (
    select 1
    from public.community_posts
    where id = post_id
      and status = 'published'
  )
);

drop policy if exists community_post_images_insert_owner on public.community_post_images;
create policy community_post_images_insert_owner
on public.community_post_images
for insert
with check (
  exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
  )
);

drop policy if exists community_post_images_delete_owner_or_admin on public.community_post_images;
create policy community_post_images_delete_owner_or_admin
on public.community_post_images
for delete
using (
  public.is_admin()
  or exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
  )
);

drop policy if exists community_comments_select_published on public.community_comments;
create policy community_comments_select_published
on public.community_comments
for select
using (status = 'published');

drop policy if exists community_comments_select_self_or_admin on public.community_comments;
create policy community_comments_select_self_or_admin
on public.community_comments
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists community_comments_insert_approved_self on public.community_comments;
create policy community_comments_insert_approved_self
on public.community_comments
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

drop policy if exists community_comments_update_self_or_admin on public.community_comments;
create policy community_comments_update_self_or_admin
on public.community_comments
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists community_reactions_select_all on public.community_reactions;
create policy community_reactions_select_all
on public.community_reactions
for select
using (true);

drop policy if exists community_reactions_insert_approved_self on public.community_reactions;
create policy community_reactions_insert_approved_self
on public.community_reactions
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

drop policy if exists community_reactions_update_self on public.community_reactions;
create policy community_reactions_update_self
on public.community_reactions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists community_reactions_delete_self on public.community_reactions;
create policy community_reactions_delete_self
on public.community_reactions
for delete
using (user_id = auth.uid());

drop policy if exists community_reports_insert_approved_self on public.community_reports;
create policy community_reports_insert_approved_self
on public.community_reports
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

drop policy if exists community_study_certifications_select_published_post on public.community_study_certifications;
create policy community_study_certifications_select_published_post
on public.community_study_certifications
for select
using (
  exists (
    select 1
    from public.community_posts
    where id = post_id
      and status = 'published'
  )
);

drop policy if exists community_study_certifications_select_self_or_admin on public.community_study_certifications;
create policy community_study_certifications_select_self_or_admin
on public.community_study_certifications
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists community_study_certifications_insert_approved_self on public.community_study_certifications;
create policy community_study_certifications_insert_approved_self
on public.community_study_certifications
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  )
  and exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
      and board_type = 'study'
  )
);

-- 회원가입 생성은 Next.js 서버 라우트에서 service role key로 처리합니다.
-- 실제 배포 전에는 Supabase Dashboard에서 RLS 정책과 service role key 보관 상태를 다시 확인하세요.
