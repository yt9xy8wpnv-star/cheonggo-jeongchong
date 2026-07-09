import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { policeReports } from "@/lib/data";

const reportTypes = [
  "수시 발언",
  "내신 언급",
  "공부 방해",
  "자습실 소음",
  "정시 배신 의혹",
  "기강 해이",
  "기타"
];

export default function PolicePage() {
  return (
    <main>
      <PageHero
        eyebrow="Jeongsi Police"
        title="정시파출소"
        description="정시파출소는 청고정총 내부 밈과 재미를 위한 공간입니다. 실명 비방, 개인정보 공개, 모욕적 표현은 운영진에 의해 삭제될 수 있습니다."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <form className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center gap-3">
            <ShieldAlert aria-hidden="true" className="h-7 w-7 text-brand-red" />
            <h2 className="text-2xl font-black text-brand-ink">신고 작성</h2>
          </div>
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-ink">신고 유형</span>
              <select className="focus-ring rounded-md border border-brand-line px-3 py-3 text-sm">
                {reportTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-ink">제목</span>
              <input
                type="text"
                placeholder="예: 자습실 소음 신고"
                className="focus-ring rounded-md border border-brand-line px-3 py-3 text-sm"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-brand-ink">내용</span>
              <textarea
                rows={6}
                placeholder="개인정보 없이 상황만 적어주세요."
                className="focus-ring rounded-md border border-brand-line px-3 py-3 text-sm"
              />
            </label>
            <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-brand-muted">
              실명 입력은 필수가 아닙니다. 개인을 특정할 수 있는 정보, 연락처,
              사진, 과도한 조롱 표현은 작성하지 말아주세요.
            </div>
            <button
              type="button"
              className="focus-ring rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-red-800"
            >
              접수하기
            </button>
          </div>
        </form>
        <aside className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-brand-ink">최근 접수 현황</h2>
          <div className="mt-5 space-y-4">
            {policeReports.map((report) => (
              <article key={report.id} className="border-b border-brand-line pb-4 last:border-b-0 last:pb-0">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge tone={report.status as "검토 중" | "주의" | "훈방"}>
                    {report.status}
                  </Badge>
                  <span className="text-xs font-semibold text-brand-muted">
                    {report.date}
                  </span>
                </div>
                <p className="text-sm font-bold text-brand-blue">{report.type}</p>
                <h3 className="mt-1 font-black text-brand-ink">{report.title}</h3>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
