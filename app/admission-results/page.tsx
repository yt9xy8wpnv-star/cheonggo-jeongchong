import type { Metadata } from "next";
import { Award, BarChart3, Info, Medal, Target, TrendingUp, Users } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";

const summaryStats = [
  {
    label: "입시 대상 회원",
    value: "213명",
    description: "2026학년도 청고정총 입시 대상 회원",
    tone: "default"
  },
  {
    label: "목표 대학 진학",
    value: "185명",
    description: "본인 목표 대학군 진학 성공 인원",
    tone: "default"
  },
  {
    label: "목표 대학 진학률",
    value: "86.9%",
    description: "입시 대상 회원 기준 목표 달성률",
    tone: "blue"
  },
  {
    label: "비교군 평균 대비",
    value: "+15.5%p",
    description: "비교군 평균 71.4% 대비 성과",
    tone: "red"
  }
] as const;

const achievementCards = [
  {
    title: "의예과",
    value: "74명",
    description: "서울대·연세대·가톨릭대·성균관대·울산대 등",
    highlight: true
  },
  {
    title: "SKY 일반계열",
    value: "42명",
    description: "서울대 18명 · 연세대 13명 · 고려대 11명",
    highlight: false
  },
  {
    title: "서성한 일반계열",
    value: "58명",
    description: "서강대 14명 · 성균관대 22명 · 한양대 22명",
    highlight: false
  },
  {
    title: "POSTECH",
    value: "2명",
    description: "포항공과대학교 소수 정예 실적",
    highlight: false
  },
  {
    title: "과학기술원",
    value: "9명",
    description: "KAIST 3명 · UNIST 2명 · GIST 2명 · DGIST 2명",
    highlight: false
  }
] as const;

const medicalHighlights = [
  ["서울대 의예과", "5명"],
  ["연세대 의예과", "5명"],
  ["가톨릭대 의예과", "4명"],
  ["성균관대 의예과", "4명"],
  ["울산대 의예과", "3명"]
] as const;

const medicalResults = [
  { category: "최상위 의대", university: "서울대학교 의예과", count: 5 },
  { category: "최상위 의대", university: "연세대학교 의예과", count: 5 },
  { category: "최상위 의대", university: "가톨릭대학교 의예과", count: 4 },
  { category: "최상위 의대", university: "성균관대학교 의예과", count: 4 },
  { category: "최상위 의대", university: "울산대학교 의예과", count: 3 },
  { category: "상위 의대", university: "고려대학교 의예과", count: 4 },
  { category: "인서울 의대", university: "경희대학교 의예과", count: 3 },
  { category: "인서울 의대", university: "중앙대학교 의예과", count: 3 },
  { category: "인서울 의대", university: "한양대학교 의예과", count: 3 },
  { category: "삼룡의", university: "순천향대학교 의예과", count: 4 },
  { category: "삼룡의", university: "한림대학교 의예과", count: 3 },
  { category: "삼룡의", university: "인제대학교 의예과", count: 3 },
  { category: "지거국 의대", university: "충북대학교 의예과", count: 5 },
  { category: "지거국 의대", university: "충남대학교 의예과", count: 3 },
  { category: "지거국 의대", university: "전북대학교 의예과", count: 3 },
  { category: "지거국 의대", university: "전남대학교 의예과", count: 3 },
  { category: "지거국 의대", university: "경북대학교 의예과", count: 3 },
  { category: "지거국 의대", university: "부산대학교 의예과", count: 2 },
  { category: "지거국 의대", university: "경상국립대학교 의예과", count: 2 },
  { category: "지거국 의대", university: "강원대학교 의예과", count: 1 },
  { category: "지거국 의대", university: "제주대학교 의예과", count: 1 },
  { category: "기타 의대", university: "아주대학교 의예과", count: 2 },
  { category: "기타 의대", university: "인하대학교 의예과", count: 1 },
  { category: "기타 의대", university: "가천대학교 의예과", count: 1 },
  { category: "기타 의대", university: "건양대학교 의예과", count: 1 },
  { category: "기타 의대", university: "을지대학교 의예과", count: 1 },
  { category: "기타 의대", university: "단국대학교 천안캠퍼스 의예과", count: 1 }
] as const;

const generalResults = [
  {
    group: "SKY 일반계열",
    total: 42,
    note: "의예과 합격자는 별도 집계",
    universities: [
      { name: "서울대학교", count: 18 },
      { name: "연세대학교", count: 13 },
      { name: "고려대학교", count: 11 }
    ]
  },
  {
    group: "서성한 일반계열",
    total: 58,
    note: "일반계열 기준 합산",
    universities: [
      { name: "서강대학교", count: 14 },
      { name: "성균관대학교", count: 22 },
      { name: "한양대학교", count: 22 }
    ]
  },
  {
    group: "POSTECH",
    total: 2,
    note: "소수 정예 실적",
    universities: [{ name: "포항공과대학교 POSTECH", count: 2 }]
  },
  {
    group: "과학기술원",
    total: 9,
    note: "과학기술원 합산",
    universities: [
      { name: "KAIST", count: 3 },
      { name: "UNIST", count: 2 },
      { name: "GIST", count: 2 },
      { name: "DGIST", count: 2 }
    ]
  }
] as const;

const comparisonResults = [
  {
    name: "청고정총",
    totalMembers: 213,
    successMembers: 185,
    successRate: 86.9,
    highlight: true
  },
  {
    name: "타 정시 커뮤니티 A",
    totalMembers: 176,
    successMembers: 137,
    successRate: 77.8,
    highlight: false
  },
  {
    name: "타 입시 스터디 B",
    totalMembers: 241,
    successMembers: 174,
    successRate: 72.2,
    highlight: false
  },
  {
    name: "일반 독학 관리군",
    totalMembers: 128,
    successMembers: 82,
    successRate: 64.1,
    highlight: false
  }
] as const;

const medicalCategories = [
  "최상위 의대",
  "상위 의대",
  "인서울 의대",
  "삼룡의",
  "지거국 의대",
  "기타 의대"
] as const;

export const metadata: Metadata = {
  title: "입시 결과"
};

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-sm font-black uppercase tracking-[0.08em] text-brand-blue">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-normal text-brand-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-brand-muted">
        {description}
      </p>
    </div>
  );
}

function SummaryCard({ stat }: { stat: (typeof summaryStats)[number] }) {
  const isBlue = stat.tone === "blue";
  const isRed = stat.tone === "red";

  return (
    <article
      className={[
        "rounded-xl border bg-white p-6",
        isBlue
          ? "border-brand-blue bg-blue-50/60"
          : isRed
            ? "border-red-200 bg-red-50/60"
            : "border-brand-line"
      ].join(" ")}
    >
      <p className="text-sm font-black text-brand-muted">{stat.label}</p>
      <p
        className={[
          "mt-4 text-4xl font-black tracking-normal sm:text-5xl",
          isRed ? "text-brand-red" : isBlue ? "text-brand-blue" : "text-brand-ink"
        ].join(" ")}
      >
        {stat.value}
      </p>
      <p className="mt-4 text-sm font-semibold leading-6 text-brand-muted">
        {stat.description}
      </p>
    </article>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-line bg-white px-4 py-3">
      <p className="text-xs font-black text-brand-muted">{label}</p>
      <p className="mt-1 text-lg font-black text-brand-ink">{value}</p>
    </div>
  );
}

function AchievementCard({
  item
}: {
  item: (typeof achievementCards)[number];
}) {
  return (
    <article
      className={[
        "rounded-xl border bg-white p-6",
        item.highlight ? "border-brand-blue bg-blue-50/50" : "border-brand-line"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-brand-ink">{item.title}</h3>
          <p
            className={[
              "mt-4 text-5xl font-black tracking-normal",
              item.highlight ? "text-brand-blue" : "text-brand-ink"
            ].join(" ")}
          >
            {item.value}
          </p>
        </div>
        {item.highlight ? (
          <span className="rounded-full bg-brand-blue px-3 py-1 text-xs font-black text-white">
            핵심
          </span>
        ) : null}
      </div>
      <p className="mt-5 text-sm font-semibold leading-7 text-brand-muted">
        {item.description}
      </p>
    </article>
  );
}

function ComparisonBar({
  result
}: {
  result: (typeof comparisonResults)[number];
}) {
  return (
    <article>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-brand-ink">{result.name}</h3>
          <p className="mt-1 text-xs font-semibold text-brand-muted">
            {result.successMembers}명 / {result.totalMembers}명
          </p>
        </div>
        <p
          className={[
            "text-xl font-black tracking-normal",
            result.highlight ? "text-brand-blue" : "text-slate-500"
          ].join(" ")}
        >
          {result.successRate.toFixed(1)}%
        </p>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className={[
            "h-full rounded-full",
            result.highlight ? "bg-brand-blue" : "bg-slate-300"
          ].join(" ")}
          style={{ width: `${result.successRate}%` }}
        />
      </div>
    </article>
  );
}

export default function AdmissionResultsPage() {
  const medicalTotal = medicalResults.reduce((sum, item) => sum + item.count, 0);

  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Admission Results"
        title="2026 입시 결과"
        description="청주고정시파이터총연맹의 2026학년도 입시 성과를 한눈에 확인할 수 있습니다."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-xl border border-brand-line bg-slate-50 p-6 sm:p-8">
          <p className="text-sm font-black text-brand-blue">2026 Admission Summary</p>
          <h2 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-brand-ink sm:text-4xl">
            2026학년도 입시에서 청고정총 입시 대상 회원 213명 중 185명이 목표
            대학군 진학에 성공했습니다.
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat) => (
            <SummaryCard key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      <section className="border-y border-brand-line bg-slate-50/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8 lg:py-16">
          <div className="rounded-xl border border-brand-blue bg-white p-7 text-center">
            <div
              className="mx-auto flex h-56 w-56 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(#253E8B 0deg 313deg, #E5E7EB 313deg 360deg)"
              }}
              aria-label="목표 대학 진학률 86.9%"
            >
              <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white">
                <p className="text-sm font-black text-brand-muted">목표 진학률</p>
                <p className="mt-2 text-5xl font-black text-brand-blue">86.9%</p>
              </div>
            </div>
            <p className="mt-6 text-sm font-bold text-brand-muted">
              약 87% 목표 대학군 진학
            </p>
          </div>

          <div className="rounded-xl border border-brand-line bg-white p-7">
            <div className="flex items-center gap-3 text-brand-blue">
              <Target aria-hidden="true" className="h-6 w-6" />
              <p className="text-sm font-black uppercase tracking-[0.08em]">
                Target Achievement
              </p>
            </div>
            <h2 className="mt-4 text-3xl font-black text-brand-ink">
              목표 대학 진학률 86.9%
            </h2>
            <p className="mt-5 text-base font-semibold leading-8 text-brand-muted">
              청고정총은 2026학년도 입시에서 입시 대상 회원 213명 중 185명이
              목표 대학군 진학에 성공하며, 목표 대학 진학률 86.9%를
              기록했습니다.
            </p>
            <p className="mt-4 text-base font-black leading-8 text-brand-ink">
              이는 정시를 향한 자주적 선택, 흔들림 없는 결의, 끝까지 밀어붙인
              투쟁의 결과입니다.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <StatPill label="입시 대상" value="213명" />
              <StatPill label="목표 진학" value="185명" />
              <StatPill label="달성률" value="86.9%" />
            </div>
            <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[86.9%] rounded-full bg-brand-blue" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading
          eyebrow="Major Results"
          title="주요 합격 실적"
          description="의예과, SKY, 서성한, POSTECH, 과학기술원 실적을 전체 합계 기준으로 정리했습니다."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {achievementCards.map((item) => (
            <AchievementCard key={item.title} item={item} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-brand-line bg-slate-50 p-5">
          <Award aria-hidden="true" className="h-6 w-6 text-brand-blue" />
          <p className="text-base font-black text-brand-ink">
            주요 합격 실적 합계 <span className="text-brand-blue">185명</span>
          </p>
        </div>
      </section>

      <section className="border-y border-brand-line bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <SectionHeading
            eyebrow="Medical School"
            title="의예과 합격 실적"
            description="의예과 실적은 별도 분류하여 대학별 합격 인원을 표시합니다. SKY·서성한 일반계열 실적에는 중복 포함하지 않습니다."
          />

          <div className="grid gap-4 md:grid-cols-5">
            {medicalHighlights.map(([name, count]) => (
              <article
                key={name}
                className="rounded-xl border border-blue-100 bg-white p-5"
              >
                <p className="text-sm font-black text-brand-blue">{name}</p>
                <p className="mt-3 text-4xl font-black text-brand-ink">{count}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-brand-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line px-5 py-4">
              <h3 className="text-xl font-black text-brand-ink">
                의예과 대학별 합격 현황
              </h3>
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-brand-blue">
                의예과 총 {medicalTotal}명
              </span>
            </div>

            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-brand-line bg-slate-50 text-sm text-brand-muted">
                    <th className="px-5 py-3 font-black">분류</th>
                    <th className="px-5 py-3 font-black">대학명</th>
                    <th className="px-5 py-3 text-right font-black">합격 인원</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalResults.map((item) => (
                    <tr
                      key={`${item.category}-${item.university}`}
                      className="border-b border-brand-line last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm font-black text-brand-blue">
                        {item.category}
                      </td>
                      <td className="px-5 py-4 font-bold text-brand-ink">
                        {item.university}
                      </td>
                      <td className="px-5 py-4 text-right text-lg font-black text-brand-ink">
                        {item.count}명
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-5 p-5 md:hidden">
              {medicalCategories.map((category) => (
                <div key={category}>
                  <h4 className="mb-3 text-sm font-black text-brand-blue">
                    {category}
                  </h4>
                  <div className="grid gap-2">
                    {medicalResults
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <article
                          key={item.university}
                          className="rounded-lg border border-brand-line bg-slate-50 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-black text-brand-ink">
                              {item.university}
                            </p>
                            <p className="shrink-0 text-lg font-black text-brand-blue">
                              {item.count}명
                            </p>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading
          eyebrow="General Track"
          title="주요 대학 일반계열 합격 실적"
          description="의예과 합격자는 별도 집계하며, 아래 수치는 일반계열 기준입니다."
        />
        <div className="grid gap-5 lg:grid-cols-4">
          {generalResults.map((group) => (
            <article
              key={group.group}
              className="rounded-xl border border-brand-line bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-brand-ink">{group.group}</h3>
                  <p className="mt-2 text-sm font-bold text-brand-muted">
                    {group.note}
                  </p>
                </div>
                <p className="text-4xl font-black text-brand-blue">{group.total}명</p>
              </div>
              <dl className="mt-6 grid gap-3">
                {group.universities.map((university) => (
                  <div
                    key={university.name}
                    className="flex items-center justify-between gap-4 border-t border-brand-line pt-3"
                  >
                    <dt className="text-sm font-bold text-brand-ink">
                      {university.name}
                    </dt>
                    <dd className="text-base font-black text-brand-blue">
                      {university.count}명
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-line bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <SectionHeading
            eyebrow="Comparison"
            title="비교군 대비 성과"
            description="목표 대학 진학률 기준으로 청고정총의 성과를 익명 비교군과 비교했습니다."
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl border border-brand-line bg-white p-6">
              <div className="flex items-center gap-3 text-brand-blue">
                <BarChart3 aria-hidden="true" className="h-6 w-6" />
                <h3 className="text-xl font-black text-brand-ink">
                  목표 대학 진학률 비교
                </h3>
              </div>
              <div className="mt-8 grid gap-7">
                {comparisonResults.map((result) => (
                  <ComparisonBar key={result.name} result={result} />
                ))}
              </div>
            </div>

            <aside className="rounded-xl border border-brand-blue bg-white p-6">
              <TrendingUp aria-hidden="true" className="h-8 w-8 text-brand-blue" />
              <h3 className="mt-4 text-2xl font-black text-brand-ink">
                비교군 평균 대비
              </h3>
              <p className="mt-5 text-6xl font-black tracking-normal text-brand-blue">
                +15.5%p
              </p>
              <p className="mt-5 text-base font-bold leading-8 text-brand-muted">
                청고정총 목표 대학 진학률 86.9%
              </p>
              <p className="mt-2 text-base font-bold leading-8 text-brand-muted">
                비교군 평균 71.4% 대비 +15.5%p
              </p>
              <div className="mt-6 grid gap-3">
                <StatPill label="청고정총" value="86.9%" />
                <StatPill label="비교군 평균" value="71.4%" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-xl bg-slate-50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
              <Info aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-ink">집계 기준 안내</h2>
              <ul className="mt-4 grid gap-2 text-sm font-semibold leading-7 text-brand-muted">
                <li>
                  본 페이지의 입시 결과는 2026학년도 청고정총 내부 집계 기준으로
                  구성되었습니다.
                </li>
                <li>
                  의예과 실적은 별도 분류하며, SKY·서성한 일반계열 실적에는
                  의예과 합격자를 중복 포함하지 않습니다.
                </li>
                <li>
                  목표 대학 진학률은 입시 대상 회원 중 본인이 설정한 목표 대학군에
                  진학한 인원을 기준으로 산정했습니다.
                </li>
                <li>
                  비교군 수치는 내부 비교 지표로, 실제 외부 기관의 공식 발표 자료와는
                  다를 수 있습니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-line bg-brand-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black text-sky-300">Total Result</p>
            <p className="mt-2 text-2xl font-black">의예과·주요 대학 합계 185명</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-black">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Users aria-hidden="true" className="h-4 w-4" />
              입시 대상 213명
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Medal aria-hidden="true" className="h-4 w-4" />
              목표 진학 185명
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
