import { BookOpen, Flag, Megaphone, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionTitle } from "@/components/common/SectionTitle";

const values = [
  {
    title: "설립 목적",
    text: "정시를 준비하는 청주고 학생들이 공지, 자료, 모의고사 정보를 안정적으로 확인할 수 있는 공식 창구를 마련합니다.",
    icon: <Flag className="h-6 w-6" aria-hidden="true" />
  },
  {
    title: "운영 방향",
    text: "중요 공지는 명확하게, 커뮤니티는 적정한 질서 안에서 자유롭게 운영합니다.",
    icon: <ShieldCheck className="h-6 w-6" aria-hidden="true" />
  },
  {
    title: "주요 활동",
    text: "모의고사 운영, 자료 분류, 공부 인증, 정시 일정 안내, 굿즈 수요 조사 등을 진행합니다.",
    icon: <BookOpen className="h-6 w-6" aria-hidden="true" />
  },
  {
    title: "구호",
    text: "자주! 결의! 투쟁! 필요한 순간에는 단순한 구호가 공부를 다시 시작하게 합니다.",
    icon: <Megaphone className="h-6 w-6" aria-hidden="true" />
  }
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About"
        title="청고정총이란?"
        description="청주고정시파이터총연맹은 정시를 준비하는 학생들이 공지, 자료, 모의고사, 커뮤니티를 함께 관리하기 위해 만든 학생 중심 연합체입니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle
          title="운영 원칙"
          description="실제 학교 단체 홈페이지처럼 신뢰할 수 있는 정보 구조를 유지하면서, 청고정총만의 결의감과 유머를 적절히 담습니다."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {values.map((value) => (
            <article key={value.title} className="rounded-lg border border-brand-line bg-white p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-brand-blue">
                {value.icon}
              </div>
              <h2 className="text-xl font-black text-brand-ink">{value.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">{value.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle title="연혁" />
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              ["2026.06", "청고정총 시범 운영 준비"],
              ["2026.07", "공지, 커뮤니티, 모의고사 페이지 공개"],
              ["2026.08", "정시 캘린더와 자료실 정식 운영 예정"]
            ].map(([date, text]) => (
              <li key={date} className="rounded-lg border border-brand-line bg-white p-5">
                <p className="text-sm font-black text-brand-blue">{date}</p>
                <p className="mt-2 text-base font-bold text-brand-ink">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
