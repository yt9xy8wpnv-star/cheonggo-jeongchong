import {
  BarChart3,
  ClipboardList,
  FileCheck2,
  Megaphone,
  Package,
  ShieldAlert,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";

const adminCards: Array<[string, string, LucideIcon]> = [
  ["공지 관리", "필독 공지와 운영 안내를 작성하고 수정합니다.", Megaphone],
  ["게시글 관리", "게시판별 글, 댓글, 신고 상태를 확인합니다.", ClipboardList],
  ["회원 관리", "회원 상태와 권한 부여 구조를 확인합니다.", Users],
  ["굿즈 주문 관리", "상품별 수요 조사와 주문 상태를 관리합니다.", Package],
  ["모의고사 정답 관리", "회차별 정답, 채점 상태, 결과 공개를 설정합니다.", FileCheck2],
  ["신고 접수 관리", "정시파출소 접수 상태와 처리 결과를 기록합니다.", ShieldAlert]
];

export default function AdminPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Admin"
        title="관리자 페이지 목업"
        description="공지, 게시글, 회원, 굿즈 주문, 모의고사 정답, 신고 접수 관리를 위한 대시보드입니다. 실제 권한 체크는 추후 연결합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["오늘 방문", "428"],
            ["신규 글", "17"],
            ["채점 대기", "34"],
            ["신고 접수", "3"]
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-brand-line bg-white p-5">
              <p className="text-sm font-bold text-brand-muted">{label}</p>
              <p className="mt-2 text-3xl font-black text-brand-ink">{value}</p>
            </article>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminCards.map(([title, text, Icon]) => (
            <article key={String(title)} className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
              <Icon aria-hidden="true" className="mb-5 h-7 w-7 text-brand-blue" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-brand-ink">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{text}</p>
                </div>
                <Badge tone="운영">목업</Badge>
              </div>
            </article>
          ))}
        </div>
        <section className="mt-8 rounded-lg border border-brand-line bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 aria-hidden="true" className="h-5 w-5 text-brand-blue" />
            <h2 className="text-xl font-black text-brand-ink">운영 메모</h2>
          </div>
          <p className="text-sm leading-7 text-brand-muted">
            관리자 기능은 현재 UI 구조만 잡아둔 상태입니다. 추후 DB, 인증,
            권한, 파일 업로드, 채점 로직을 연결할 때 이 화면을 기준으로 API를
            분리하면 됩니다.
          </p>
        </section>
      </section>
    </main>
  );
}
