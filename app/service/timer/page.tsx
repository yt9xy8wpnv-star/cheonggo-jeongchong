import { PageHero } from "@/components/common/PageHero";
import { TimerWidget } from "@/components/service/TimerWidget";

export default function TimerPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Timer"
        title="정시타이머"
        description="수능 D-Day, 다음 모의고사까지의 흐름, 오늘 순공 시간을 한 화면에서 관리합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <TimerWidget />
      </section>
    </main>
  );
}
