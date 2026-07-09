# 청주고정시파이터총연맹 공식 홈페이지

Next.js App Router, TypeScript, Tailwind CSS로 제작한 청고정총 공식 홈페이지입니다. Vercel 배포와 Supabase 연동을 기준으로 구성되어 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 확인할 수 있습니다.

## 주요 폴더

- `app/`: 페이지 라우팅
- `components/layout/`: Header, Footer, 모바일 메뉴
- `components/common/`: 공통 UI 컴포넌트
- `components/mock/`: 모의고사 관련 UI
- `components/service/`: 정시타이머, 캘린더 등 서비스 UI
- `components/community/`: 커뮤니티 게시판 UI
- `lib/data.ts`: 공지, 게시글, 모의고사, 상품, 일정 등 mock data
- `public/assets/`: 추후 로고 에셋을 넣을 위치

## 로고 에셋

아래 파일을 `public/assets`에 넣으면 자동으로 사용됩니다. 파일이 없어도 텍스트 fallback으로 레이아웃이 유지됩니다.

- `/assets/logo-symbol.png`
- `/assets/logo-horizontal.png`
- `/assets/logo-slogan.png`
- `/assets/logo-footer.png`
- `/assets/logo-watermark.png`

## Supabase 설정

`.env.local`에 아래 값을 입력합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 라우트에서만 사용하며 클라이언트 컴포넌트에 노출하지 않습니다.

Supabase SQL Editor에서 `supabase/schema.sql`을 실행해 `profiles`, `subject_preferences`, `study_sessions`, 커뮤니티 테이블, RLS 정책, RPC 함수를 생성합니다.

## 자유게시판

`/community/free`는 Supabase의 `community_posts`, `community_post_images`, `community_comments`, `community_reactions` 테이블을 사용합니다.

- 게시글과 댓글 작성은 승인된 회원만 가능합니다.
- 게시글과 댓글 삭제는 실제 삭제가 아니라 `status = deleted`로 숨김 처리합니다.
- 작성자는 본인 게시글을 수정/삭제할 수 있고, 관리자는 전체 게시글과 댓글을 삭제할 수 있습니다.
- 목록은 제목 검색, 최신순/인기순/댓글순/조회순/좋아요순 정렬, 이전/다음 페이지 이동을 지원합니다.
- 라우트는 `/community/free`, `/community/free/write`, `/community/free/[id]`, `/community/free/[id]/edit`입니다.
- 제목은 최대 200자, 본문은 최대 5000자까지 입력할 수 있습니다.
- 목록에서는 본문 미리보기를 표시하지 않고 제목과 메타 정보만 보여줍니다.

이미지 첨부를 사용하려면 Supabase Dashboard → Storage에서 public bucket을 생성합니다.

```txt
Bucket name: community-images
Public bucket: on
```

이미지는 API에서 승인된 회원 요청만 업로드하며, 파일당 5MB 이하 jpg/png/webp/gif만 허용합니다.

정시파출소 신고 이미지 첨부를 사용하려면 별도 public bucket을 생성합니다.

```txt
Bucket name: police-report-images
Public bucket: on
```

정시파출소 신고는 `/service/police`에서 접수하며, 승인된 회원만 사용할 수 있습니다. 신고 데이터는 `police_reports` 테이블에 저장되고, 이미지는 신고당 최대 1장까지 첨부할 수 있습니다.

## 공부 인증

`/community/study`는 자유게시판과 같은 게시판 UI를 사용하되 `community_posts.board_type = 'study'`로 저장합니다.

- 라우트는 `/community/study`, `/community/study/write`, `/community/study/[id]`, `/community/study/[id]/edit`입니다.
- 공부 인증은 게시판의 `공부 인증하기` 버튼 또는 정시타이머 페이지의 `공부 인증하기` 버튼에서 작성할 수 있습니다.
- `community_study_certifications` 테이블에 글 작성 시점의 순공 시간, 과목별 시간, 선택과목, 당시 순위를 snapshot으로 저장합니다.
- 글 작성 이후 공부 시간이 늘어나도 기존 인증 글의 공부 시간은 바뀌지 않습니다.
- 인증 당시 1등이면 목록과 인증 카드에 금색 강조가 적용됩니다.
- 제목은 최대 100자, 본문은 최대 200자입니다.

## 질문 게시판

`/community/qna`는 `community_posts.board_type = 'qna'` 질문과 `community_questions`, `community_answers`, `community_answer_images` 테이블을 사용합니다.

- 라우트는 `/community/qna`, `/community/qna/write`, `/community/qna/[id]`, `/community/qna/[id]/edit`입니다.
- 질문 작성 시 과목 영역과 세부 과목을 반드시 선택합니다.
- 질문 이미지는 `community_post_images`, 답변 이미지는 `community_answer_images`에 저장합니다.
- 답변 채택은 질문 작성자만 할 수 있으며, 채택되면 질문 상태가 `채택 완료`로 표시됩니다.
- 질문에는 좋아요, 답변에는 도움돼요 반응을 사용합니다.
- 제목은 최대 120자, 질문 내용은 최대 2000자, 답변은 최대 3000자입니다.
- 이미지 첨부는 `community-images` public bucket을 사용하며, 파일당 5MB 이하 jpg/png/webp/gif만 허용합니다.

## 정시타이머

`/service/timer`는 Supabase의 `study_sessions` 테이블을 사용합니다.

- 공부 날짜인 `study_date`는 한국 시간 오전 5시를 기준으로 계산합니다.
- 타이머는 매초 DB에 저장하지 않습니다. 시작 시 `started_at`을 저장하고, 정지 시 `ended_at`과 `duration_seconds`를 저장합니다.
- 진행 중인 타이머는 `started_at`과 현재 시각 차이를 화면에서만 1초마다 계산합니다.
- 오늘 랭킹은 완료된 세션과 진행 중 세션을 함께 집계합니다.
- `study_sessions`는 Supabase Realtime INSERT/UPDATE 이벤트를 구독해 다른 사용자의 시작, 정지, 전환 시 랭킹을 다시 불러옵니다.

배포 전 Supabase SQL Editor에서 최신 `supabase/schema.sql`을 다시 실행해 `study_sessions` 테이블과 Realtime 발행 설정을 적용해야 합니다.

## 초기 관리자 계정 설정

1. `/signup`에서 일반 회원가입 신청을 합니다.
2. Supabase Dashboard → Table Editor → `profiles`로 이동합니다.
3. 해당 계정의 `status`를 `approved`로 변경합니다.
4. `role`을 `admin`으로 변경합니다.
5. 해당 계정으로 로그인합니다.
6. `/mypage`에서 `회원가입 관리`로 이동합니다.

SQL로 처리할 수도 있습니다.

```sql
update profiles
set role = 'admin',
    status = 'approved',
    approved_at = now()
where username = '관리자아이디';
```

실제 배포 전에는 Supabase RLS 정책, service role key 보관, 관리자 승인 API 권한을 다시 확인하세요.
