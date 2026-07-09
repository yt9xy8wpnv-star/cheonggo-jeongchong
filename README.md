# 청주고정시파이터총연맹 공식 홈페이지

Next.js App Router, TypeScript, Tailwind CSS로 제작한 청고정총 공식 홈페이지 목업입니다. Vercel 배포를 기준으로 구성되어 있으며, 현재 데이터는 `lib/data.ts`의 mock data를 사용합니다.

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

Supabase SQL Editor에서 `supabase/schema.sql`을 실행해 `profiles`, `subject_preferences`, `study_sessions`, RLS 정책, RPC 함수를 생성합니다.

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
