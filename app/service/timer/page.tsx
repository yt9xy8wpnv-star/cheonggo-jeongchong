import { PageHero } from "@/components/common/PageHero";
import { StudyTimerClient } from "@/components/service/StudyTimerClient";

export default function TimerPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Timer"
        title="정시타이머"
        description="과목별 순공 시간을 기록하고 청고정총 랭킹을 확인합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <StudyTimerClient />
      </section>
    </main>
  );
}
