import { Mail, MapPin, MessageSquare, Navigation, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionTitle } from "@/components/common/SectionTitle";

const locationCards: Array<[LucideIcon, string, string]> = [
  [Navigation, "주소", "충청북도 청주시 청주고등학교 내 활동 공간"],
  [Timer, "활동 시간", "평일 방과 후 및 모의고사 운영일"],
  [Mail, "이메일", "jeongchong@example.com"],
  [MessageSquare, "문의", "공지사항 또는 운영진 문의 채널로 접수"]
];

export default function LocationPage() {
  return (
    <main>
      <PageHero
        eyebrow="Location"
        title="오시는 길"
        description="청고정총 활동 장소와 문의 방법을 안내합니다. 실제 주소와 세부 장소는 운영진 확인 후 업데이트됩니다."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div>
          <SectionTitle title="장소 안내" />
          <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <MapPin aria-hidden="true" className="mx-auto h-12 w-12 text-brand-blue" />
              <p className="mt-4 text-xl font-black text-brand-ink">지도 placeholder</p>
              <p className="mt-2 text-sm text-brand-muted">지도 API 연결 예정</p>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          {locationCards.map(([Icon, title, text]) => (
            <article key={String(title)} className="rounded-lg border border-brand-line bg-white p-5">
              <Icon aria-hidden="true" className="mb-4 h-6 w-6 text-brand-blue" />
              <h2 className="font-black text-brand-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{text}</p>
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
}
