import { PageHero } from "@/components/common/PageHero";
import { ProfileImageCard } from "@/components/leader/ProfileImageCard";
import { TimelineSection } from "@/components/leader/TimelineSection";

const biographyItems = [
  { date: "2023.12", text: "솔밭중학교 졸업" },
  { date: "2024.11", text: "정시파이터 선언" },
  { date: "2026.12", text: "청주고등학교 졸업 예정" },
  { date: "2027.03", text: "서울대학교 경제학부 입학 예정" }
];

const careerItems = [
  { date: "2023.03", text: "솔밭중학교 3학년부 대표" },
  { date: "2024.11", text: "정사모(정시를 사랑하는 모임) 대표" },
  {
    date: "2025.02",
    text: "대한민국 최대의 정시파이터 단체 청주고정시파이터총연맹 결성"
  },
  { date: "2025.02", text: "청주고정시파이터총연맹 제1대 회장 취임" },
  { date: "2026.02", text: "청주고정시파이터총연맹 제2대 회장 취임" },
  {
    date: "2026.06",
    text: "2026년 대비 대학수학능력시험 6월 모의평가 전국 석차 4등, 충북 1등"
  },
  { date: "2026.12", text: "서울대학교 정시전형 합격 예정" }
];

const activityItems = [
  { date: "2026.01 ~ 2026.03", text: "현우진의 뉴런 확률과 통계 수강" },
  { date: "2026.01 ~ 2026.03", text: "강민철의 기출분석 수강" },
  { date: "2026.04 ~ 2026.05", text: "새로운 기출분석 수강" }
];

const greetingParagraphs = [
  "안녕하십니까. 청주고정시파이터총연맹 총장입니다.",
  "청주고정시파이터총연맹은 정시를 준비하는 청주고 학생들의 결의와 질서를 바탕으로 출범한 학생 중심 연합체입니다. 우리는 공지, 자료, 모의고사, 커뮤니티, 정시 일정, 각종 서비스를 한곳에서 관리하며, 흩어져 있던 정시파이터들의 의지와 정보를 하나로 모으고자 합니다. 청고정총은 단순한 친목 단체가 아니라, 정시라는 길을 선택한 학생들이 서로를 독려하고, 필요한 정보를 나누며, 끝까지 흔들리지 않도록 돕는 공동체입니다.",
  "오늘날의 입시는 매우 복잡하고 빠르게 변화하고 있습니다. 수시와 정시, 내신과 수능, 생활기록부와 표준점수, 대학별 전형과 지원 전략이 얽히며 학생들은 매 순간 수많은 선택 앞에 서게 됩니다. 이러한 환경 속에서 정시를 준비한다는 것은 단순히 시험 하나를 준비하는 일이 아닙니다. 긴 시간 동안 자신을 관리하고, 정보를 선별하며, 흔들리는 마음을 붙잡고, 끝까지 자신의 선택을 책임지는 과정입니다.",
  "청고정총은 바로 이 과정에 필요한 최소한의 질서와 최대한의 추진력을 만들기 위해 존재합니다. 수능까지 남은 시간을 기록하고, 모의고사를 통해 실력을 점검하며, 자료실을 통해 필요한 학습 자료를 공유하고, 공지사항을 통해 중요한 일정을 빠르게 전달하겠습니다. 또한 정시 캘린더와 정시타이머를 통해 구성원들이 자신의 학습 흐름을 놓치지 않도록 돕고, 커뮤니티를 통해 혼자 공부하는 과정에서 생기는 고립감과 불안을 줄여나가겠습니다.",
  "우리가 지향하는 청고정총은 무겁기만 한 조직이 아닙니다. 정시파출소와 굿즈샵처럼 청고정총만의 개성을 담은 서비스도 함께 운영하며, 정시를 준비하는 과정 속에서도 웃음과 결속을 잃지 않는 문화를 만들어가고자 합니다. 다만 농담은 가볍게 하되, 운영은 진지하게 하겠습니다. 장난 속에서도 선을 지키고, 재미 속에서도 질서를 세우며, 청고정총이라는 이름에 걸맞은 책임 있는 운영을 이어가겠습니다.",
  "정시의 길은 결코 쉽지 않습니다. 결과가 바로 보이지 않는 시간, 남들과 다른 선택을 했다는 불안, 반복되는 모의고사와 끝없는 자기 점검 속에서 흔들리는 순간도 많을 것입니다. 그러나 우리는 그 길을 피하지 않겠습니다. 정시를 선택했다는 것은 스스로의 가능성을 믿고, 긴 호흡으로 승부하겠다는 선언입니다. 청고정총은 그 선언이 일시적인 다짐에 그치지 않도록, 기록과 시스템과 공동체의 힘으로 뒷받침하겠습니다.",
  "앞으로 청고정총은 청주고 정시파이터들의 공식 작전 본부로서, 더욱 체계적인 운영 플랫폼으로 성장해 나갈 것입니다. 공지사항은 더 정확하게, 자료실은 더 실용적으로, 모의고사 풀서비스는 더 정교하게, 커뮤니티는 더 건강하게 발전시키겠습니다. 또한 구성원 한 사람 한 사람이 자신의 목표를 향해 나아가는 과정을 존중하며, 서로의 노력을 인정하고 응원하는 문화를 만들어가겠습니다.",
  "청고정총의 구호는 분명합니다.",
  "자주! 결의! 투쟁!",
  "자주적으로 자신의 길을 선택하고, 결의로 흔들림을 이겨내며, 끝까지 투쟁하는 자세. 이것이 청고정총이 지켜가고자 하는 정신입니다. 우리는 이 정신을 바탕으로 청주고 정시파이터들의 기록과 열정을 모아 하나의 문화, 하나의 공동체, 하나의 역사로 만들어가겠습니다.",
  "청고정총은 아직 완성된 조직이 아닙니다. 앞으로 더 많은 시행착오와 개선이 필요할 것입니다. 그러나 중요한 것은 우리가 이미 출발했다는 사실입니다. 정시를 준비하는 학생들이 더 이상 흩어진 개인으로만 남지 않고, 함께 정보를 나누고 서로를 밀어주는 공동체로 나아갈 수 있도록 최선을 다하겠습니다.",
  "이 길에 함께해 주십시오. 청고정총은 여러분의 결의와 함께 앞으로 나아가겠습니다.",
  "감사합니다."
];

export default function LeaderPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Leader"
        title="대표 소개"
        description="청주고정시파이터총연맹의 대표를 소개합니다."
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <ProfileImageCard />
        </div>

        <article className="rounded-xl border border-brand-line bg-white p-6 lg:col-span-8 lg:p-8">
          <p className="text-sm font-black text-brand-blue">Greeting</p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-brand-ink">
            정시의 창을 여는 ‘새로운 청고정총’
          </h2>
          <div className="mt-7 space-y-5 text-base font-medium leading-8 text-slate-700">
            {greetingParagraphs.map((paragraph) => (
              <p
                key={paragraph}
                className={
                  paragraph === "자주! 결의! 투쟁!"
                    ? "text-xl font-black text-brand-blue"
                    : undefined
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 border-t border-brand-line pt-6 text-right text-sm font-bold leading-7 text-brand-ink">
            <p>청주고정시파이터총연맹 총장</p>
            <p>제1·2대 회장</p>
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:px-8">
        <TimelineSection title="약력" items={biographyItems} />
        <TimelineSection title="주요 경력" items={careerItems} />
        <TimelineSection title="학술 및 기타 활동" items={activityItems} />
      </section>

      <section className="border-t border-brand-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-black tracking-normal text-brand-blue">
            자주! 결의! 투쟁!
          </p>
        </div>
      </section>
    </main>
  );
}
