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
    target_type in ('post', 'comment', 'answer')
  ),
  constraint community_reactions_reaction_type_check check (
    reaction_type in ('like', 'dislike', 'helpful')
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

create table if not exists public.police_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid null references public.profiles(id) on delete set null,
  report_type text not null,
  target_type text null,
  target_id uuid null,
  target_label text null,
  target_author_name text null,
  accused_name text null,
  reason text not null,
  detail text not null,
  image_url text null,
  storage_path text null,
  status text not null default 'received',
  admin_note text null,
  handled_by uuid null references public.profiles(id) on delete set null,
  handled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint police_reports_report_type_check check (
    report_type in (
      'post_comment',
      'early_admission_behavior',
      'study_disruption',
      'delivery_behavior',
      'other'
    )
  ),
  constraint police_reports_target_type_check check (
    target_type is null or target_type in ('post', 'comment', 'answer')
  ),
  constraint police_reports_reason_check check (
    reason in (
      '수시행동 신고',
      '공부 방해 신고',
      '딸배짓 신고',
      '욕설 및 비방',
      '기타'
    )
  ),
  constraint police_reports_status_check check (
    status in ('received', 'reviewing', 'resolved', 'rejected')
  ),
  constraint police_reports_detail_length_check check (
    char_length(detail) between 5 and 1000
  ),
  constraint police_reports_accused_name_length_check check (
    accused_name is null
    or char_length(accused_name) between 2 and 30
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

create table if not exists public.community_questions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  subject_area text not null,
  subject_detail text not null,
  question_status text not null default 'waiting',
  accepted_answer_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_questions_post_unique unique (post_id),
  constraint community_questions_subject_area_check check (
    subject_area in (
      '국어',
      '수학',
      '영어',
      '한국사',
      '사회탐구',
      '과학탐구',
      '직업탐구',
      '제2외국어/한문',
      '기타'
    )
  ),
  constraint community_questions_subject_detail_check check (
    subject_detail in (
      '언어와 매체',
      '화법과 작문',
      '미적분',
      '확률과 통계',
      '기하',
      '영어',
      '한국사',
      '생활과 윤리',
      '윤리와 사상',
      '한국지리',
      '세계지리',
      '동아시아사',
      '세계사',
      '경제',
      '정치와 법',
      '사회·문화',
      '물리학 I',
      '화학 I',
      '생명과학 I',
      '지구과학 I',
      '물리학 II',
      '화학 II',
      '생명과학 II',
      '지구과학 II',
      '성공적인 직업생활',
      '농업 기초 기술',
      '공업 일반',
      '상업 경제',
      '수산·해운 산업 기초',
      '인간 발달',
      '독일어',
      '프랑스어',
      '스페인어',
      '중국어',
      '일본어',
      '러시아어',
      '아랍어',
      '베트남어',
      '한문',
      '기타'
    )
  ),
  constraint community_questions_status_check check (
    question_status in ('waiting', 'answered', 'accepted')
  )
);

create table if not exists public.community_answers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  status text not null default 'published',
  is_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint community_answers_status_check check (
    status in ('published', 'hidden', 'deleted')
  ),
  constraint community_answers_content_length_check check (
    char_length(content) between 2 and 3000
  )
);

create table if not exists public.community_answer_images (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.community_answers(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.community_questions
drop constraint if exists community_questions_accepted_answer_fk;

alter table public.community_questions
add constraint community_questions_accepted_answer_fk
foreign key (accepted_answer_id)
references public.community_answers(id)
on delete set null;

alter table public.community_questions
drop constraint if exists community_questions_post_unique;

alter table public.community_questions
add constraint community_questions_post_unique unique (post_id);

alter table public.community_questions
drop constraint if exists community_questions_subject_detail_check;

alter table public.community_questions
add constraint community_questions_subject_detail_check check (
  subject_detail in (
    '언어와 매체',
    '화법과 작문',
    '미적분',
    '확률과 통계',
    '기하',
    '영어',
    '한국사',
    '생활과 윤리',
    '윤리와 사상',
    '한국지리',
    '세계지리',
    '동아시아사',
    '세계사',
    '경제',
    '정치와 법',
    '사회·문화',
    '물리학 I',
    '화학 I',
    '생명과학 I',
    '지구과학 I',
    '물리학 II',
    '화학 II',
    '생명과학 II',
    '지구과학 II',
    '성공적인 직업생활',
    '농업 기초 기술',
    '공업 일반',
    '상업 경제',
    '수산·해운 산업 기초',
    '인간 발달',
    '독일어',
    '프랑스어',
    '스페인어',
    '중국어',
    '일본어',
    '러시아어',
    '아랍어',
    '베트남어',
    '한문',
    '기타'
  )
);

alter table public.community_reactions
drop constraint if exists community_reactions_target_type_check;

alter table public.community_reactions
add constraint community_reactions_target_type_check check (
  target_type in ('post', 'comment', 'answer')
);

alter table public.community_reactions
drop constraint if exists community_reactions_reaction_type_check;

alter table public.community_reactions
add constraint community_reactions_reaction_type_check check (
  reaction_type in ('like', 'dislike', 'helpful')
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

create index if not exists community_questions_post_idx
on public.community_questions (post_id);

create index if not exists community_questions_subject_idx
on public.community_questions (subject_area, subject_detail);

create index if not exists community_questions_status_idx
on public.community_questions (question_status);

create index if not exists community_answers_post_status_created_idx
on public.community_answers (post_id, status, created_at);

create index if not exists community_answer_images_answer_idx
on public.community_answer_images (answer_id, order_index);

create index if not exists police_reports_type_created_idx
on public.police_reports (report_type, created_at desc);

create index if not exists police_reports_status_created_idx
on public.police_reports (status, created_at desc);

create index if not exists police_reports_reporter_idx
on public.police_reports (reporter_id);

create index if not exists police_reports_target_idx
on public.police_reports (target_type, target_id);

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

drop trigger if exists community_questions_set_updated_at on public.community_questions;

create trigger community_questions_set_updated_at
before update on public.community_questions
for each row
execute function public.set_updated_at();

drop trigger if exists community_answers_set_updated_at on public.community_answers;

create trigger community_answers_set_updated_at
before update on public.community_answers
for each row
execute function public.set_updated_at();

drop trigger if exists police_reports_set_updated_at on public.police_reports;

create trigger police_reports_set_updated_at
before update on public.police_reports
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
alter table public.community_questions enable row level security;
alter table public.community_answers enable row level security;
alter table public.community_answer_images enable row level security;
alter table public.police_reports enable row level security;

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

drop policy if exists police_reports_select_self_or_admin on public.police_reports;
create policy police_reports_select_self_or_admin
on public.police_reports
for select
using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists police_reports_insert_approved_self on public.police_reports;
create policy police_reports_insert_approved_self
on public.police_reports
for insert
with check (
  reporter_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
  )
);

drop policy if exists police_reports_update_admin on public.police_reports;
create policy police_reports_update_admin
on public.police_reports
for update
using (public.is_admin())
with check (public.is_admin());

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

drop policy if exists community_questions_select_published_post on public.community_questions;
create policy community_questions_select_published_post
on public.community_questions
for select
using (
  exists (
    select 1
    from public.community_posts
    where id = post_id
      and status = 'published'
  )
);

drop policy if exists community_questions_insert_owner on public.community_questions;
create policy community_questions_insert_owner
on public.community_questions
for insert
with check (
  exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
      and board_type = 'qna'
  )
);

drop policy if exists community_questions_update_owner_or_admin on public.community_questions;
create policy community_questions_update_owner_or_admin
on public.community_questions
for update
using (
  public.is_admin()
  or exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
      and board_type = 'qna'
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
      and board_type = 'qna'
  )
);

drop policy if exists community_answers_select_published on public.community_answers;
create policy community_answers_select_published
on public.community_answers
for select
using (status = 'published' or user_id = auth.uid() or public.is_admin());

drop policy if exists community_answers_insert_approved_self on public.community_answers;
create policy community_answers_insert_approved_self
on public.community_answers
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
      and board_type = 'qna'
      and status = 'published'
  )
);

drop policy if exists community_answers_update_owner_or_question_owner_or_admin on public.community_answers;
create policy community_answers_update_owner_or_question_owner_or_admin
on public.community_answers
for update
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
      and board_type = 'qna'
  )
)
with check (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.community_posts
    where id = post_id
      and user_id = auth.uid()
      and board_type = 'qna'
  )
);

drop policy if exists community_answer_images_select_published_answer on public.community_answer_images;
create policy community_answer_images_select_published_answer
on public.community_answer_images
for select
using (
  exists (
    select 1
    from public.community_answers
    where id = answer_id
      and status = 'published'
  )
);

drop policy if exists community_answer_images_insert_owner on public.community_answer_images;
create policy community_answer_images_insert_owner
on public.community_answer_images
for insert
with check (
  exists (
    select 1
    from public.community_answers
    where id = answer_id
      and user_id = auth.uid()
  )
);

drop policy if exists community_answer_images_delete_owner_or_admin on public.community_answer_images;
create policy community_answer_images_delete_owner_or_admin
on public.community_answer_images
for delete
using (
  public.is_admin()
  or exists (
    select 1
    from public.community_answers
    where id = answer_id
      and user_id = auth.uid()
  )
);

-- 회원가입 생성은 Next.js 서버 라우트에서 service role key로 처리합니다.
-- 실제 배포 전에는 Supabase Dashboard에서 RLS 정책과 service role key 보관 상태를 다시 확인하세요.
