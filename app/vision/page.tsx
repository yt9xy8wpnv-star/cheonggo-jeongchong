import type { Metadata } from "next";
import { PageHero } from "@/components/common/PageHero";

const visionItems = [
  {
    title: "자주적인 학습 공동체",
    text: "정시를 선택한 학생들이 스스로 계획하고 기록하며 필요한 정보를 함께 나누는 문화를 만듭니다."
  },
  {
    title: "결의와 지속성",
    text: "하루의 공부 시간을 쌓고 모의고사와 자료를 관리하며 끝까지 흔들리지 않는 흐름을 유지합니다."
  },
  {
    title: "함께 성장하는 정시 문화",
    text: "혼자 버티는 공부가 아니라 서로의 성실함을 확인하고 응원하는 공식 공동체를 지향합니다."
  }
];

export const metadata: Metadata = {
  title: "정총 비전"
};

export default function VisionPage() {
  return (
    <main className="bg-white">
      <PageHero
        eyebrow="Vision"
        title="정총 비전"
        description="청주고정시파이터총연맹이 지향하는 방향과 핵심 가치를 소개합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {visionItems.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-brand-line bg-white p-6"
            >
              <h2 className="text-xl font-black text-brand-ink">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-brand-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
