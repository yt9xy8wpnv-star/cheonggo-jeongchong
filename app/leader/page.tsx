import { ClipboardList, Megaphone, UserRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionTitle } from "@/components/common/SectionTitle";

const roleCards: Array<[string, string, LucideIcon]> = [
  ["공지 관리", "중요 일정과 운영 기준을 빠르게 안내합니다.", ClipboardList],
  ["운영 조율", "부서별 업무와 페이지 업데이트를 점검합니다.", Users],
  ["대외 안내", "문의, 공지, 굿즈 수요 조사 안내를 담당합니다.", Megaphone]
];

export default function LeaderPage() {
  return (
    <main>
      <PageHero
        eyebrow="Leadership"
        title="대표자소개"
        description="청고정총의 운영 방향을 조율하고 공지, 모의고사, 커뮤니티가 안정적으로 운영되도록 관리합니다."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <article className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
          <div className="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <UserRound aria-hidden="true" className="h-20 w-20 text-slate-300" />
          </div>
          <h2 className="mt-6 text-2xl font-black text-brand-ink">대표자</h2>
          <p className="mt-2 text-sm font-bold text-brand-blue">청고정총 운영 총괄</p>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            정확한 공지와 필요한 기능을 우선으로 두고, 정시파이터들이 매일
            들어와도 어색하지 않은 운영 플랫폼을 만드는 역할을 맡고 있습니다.
          </p>
        </article>
        <div>
          <SectionTitle title="인사말" />
          <div className="rounded-lg border border-brand-line bg-white p-6">
            <p className="text-base leading-8 text-brand-muted">
              청고정총은 단순한 홍보 페이지가 아니라, 정시를 준비하는 학생들이
              실제로 쓰는 운영 공간을 목표로 합니다. 공지는 분명하게 남기고,
              자료는 찾기 쉽게 정리하며, 모의고사 결과는 다음 공부로 이어지게
              만들겠습니다. 가벼운 농담은 있어도 운영은 가볍게 하지 않겠습니다.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roleCards.map(([title, text, Icon]) => (
              <article key={String(title)} className="rounded-lg border border-brand-line bg-white p-5">
                {/* Icon is chosen from lucide to keep the official UI consistent. */}
                <Icon aria-hidden="true" className="mb-4 h-6 w-6 text-brand-blue" />
                <h3 className="font-black text-brand-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
