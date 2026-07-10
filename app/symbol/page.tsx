import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { Download, Info, Ruler } from "lucide-react";
import { AssetLogo } from "@/components/common/AssetLogo";

const guideGridStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
  backgroundSize: "24px 24px"
};

const colorMeaningItems = [
  {
    name: "청고정총 블루",
    hex: "#0D4DB8",
    description: "지성, 집중, 신념, 공식성을 상징한다.",
    darkText: false
  },
  {
    name: "청고정총 블랙",
    hex: "#111111",
    description: "원칙, 절제, 무게감, 책임을 상징한다.",
    darkText: false
  },
  {
    name: "청고정총 레드",
    hex: "#E52323",
    description: "결의, 열정, 투쟁의 기세를 상징한다.",
    darkText: false
  },
  {
    name: "청고정총 골드",
    hex: "#D4AF37",
    description: "성취, 명예, 목표 달성을 상징한다.",
    darkText: true
  },
  {
    name: "청고정총 실버",
    hex: "#9CA3AF",
    description: "균형, 정교함, 냉정한 판단을 상징한다.",
    darkText: true
  },
  {
    name: "스크린 그레이",
    hex: "#6B7280",
    description: "실무적 활용, 보조 정보, 안정감을 상징한다.",
    darkText: false
  }
];

const colorUsageItems = [
  {
    title: "BLUE",
    src: "/assets/brand/symbol-blue.png",
    color: "#0D4DB8",
    alt: "청고정총 블루 심벌 색상 활용"
  },
  {
    title: "BLACK",
    src: "/assets/brand/symbol-black.png",
    color: "#111111",
    alt: "청고정총 블랙 심벌 색상 활용"
  }
];

const specialColorItems = [
  {
    title: "GOLD",
    src: "/assets/brand/symbol-gold.png",
    alt: "청고정총 골드 심벌"
  },
  {
    title: "SILVER",
    src: "/assets/brand/symbol-silver.png",
    alt: "청고정총 실버 심벌"
  },
  {
    title: "SCREEN GRAY",
    src: "/assets/brand/symbol-screen-gray.png",
    alt: "청고정총 스크린 그레이 심벌"
  }
];

const lockupItems = [
  {
    title: "국문",
    src: "/assets/brand/logo-lockup-kor.png",
    alt: "청고정총 국문 좌우조합형 로고"
  },
  {
    title: "국영문",
    src: "/assets/brand/logo-lockup-kor-eng.png",
    alt: "청고정총 국영문 좌우조합형 로고"
  },
  {
    title: "한문",
    src: "/assets/brand/logo-lockup-hanja.png",
    alt: "청고정총 한문 좌우조합형 로고"
  },
  {
    title: "한영문",
    src: "/assets/brand/logo-lockup-hanja-eng.png",
    alt: "청고정총 한영문 좌우조합형 로고"
  },
  {
    title: "영문",
    src: "/assets/brand/logo-lockup-eng.png",
    alt: "청고정총 영문 좌우조합형 로고"
  },
  {
    title: "시그니처/구호형",
    src: "/assets/brand/logo-signature-kor.png",
    alt: "청고정총 시그니처 구호형 로고"
  }
];

export const metadata: Metadata = {
  title: "정총 상징"
};

function SymbolFallback({ label = "정" }: { label?: string }) {
  return (
    <span className="flex h-full min-h-28 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-2xl font-black text-brand-blue">
      {label}
    </span>
  );
}

function BrandAsset({
  src,
  alt,
  className,
  imageClassName,
  fallbackLabel = "정"
}: {
  src: string;
  alt: string;
  className: string;
  imageClassName?: string;
  fallbackLabel?: string;
}) {
  return (
    <AssetLogo
      src={src}
      alt={alt}
      className={className}
      imageClassName={imageClassName}
      fallback={<SymbolFallback label={fallbackLabel} />}
    />
  );
}

function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-sm font-black uppercase tracking-[0.08em] text-brand-blue">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-normal text-brand-ink sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-3xl text-base leading-7 text-brand-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function GuideCanvas({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex min-h-[300px] items-center justify-center rounded-xl border border-brand-line bg-white p-8",
        className
      ].join(" ")}
      style={guideGridStyle}
    >
      {children}
    </div>
  );
}

function GuideAssetCard({
  title,
  src,
  alt,
  downloadHref,
  children
}: {
  title: string;
  src: string;
  alt: string;
  downloadHref?: string;
  children?: ReactNode;
}) {
  return (
    <article>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-black text-brand-blue">{title}</h3>
        {downloadHref ? (
          <a
            href={downloadHref}
            download
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-brand-blue px-3 py-2 text-sm font-black text-brand-blue hover:bg-blue-50"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            다운로드
          </a>
        ) : null}
      </div>
      <GuideCanvas>
        {children ?? (
          <BrandAsset
            src={src}
            alt={alt}
            className="h-40 w-40 sm:h-48 sm:w-48"
            imageClassName="h-full w-full object-contain"
          />
        )}
      </GuideCanvas>
    </article>
  );
}

function ColorMeaningCard({
  item
}: {
  item: (typeof colorMeaningItems)[number];
}) {
  return (
    <article
      className={[
        "flex min-h-44 flex-col justify-between rounded-xl border border-brand-line p-5",
        item.darkText ? "text-brand-ink" : "text-white"
      ].join(" ")}
      style={{ backgroundColor: item.hex }}
    >
      <div>
        <h3 className="text-lg font-black">{item.name}</h3>
        <p className="mt-1 font-mono text-sm font-bold opacity-85">{item.hex}</p>
      </div>
      <p className="mt-8 text-sm font-bold leading-6 opacity-90">{item.description}</p>
    </article>
  );
}

function ColorUsageCard({
  item
}: {
  item: (typeof colorUsageItems)[number];
}) {
  return (
    <article>
      <h3 className="mb-4 text-3xl font-black tracking-normal text-brand-blue">
        {item.title}
      </h3>
      <div className="grid overflow-hidden rounded-xl border border-brand-line bg-white md:grid-cols-2">
        <div className="flex min-h-[280px] items-center justify-center p-8">
          <BrandAsset
            src={item.src}
            alt={`${item.alt} 흰 배경`}
            className="h-36 w-36 sm:h-44 sm:w-44"
            imageClassName="h-full w-full object-contain"
          />
        </div>
        <div
          className="flex min-h-[280px] items-center justify-center p-8"
          style={{ backgroundColor: item.color }}
        >
          <div className="flex h-44 w-44 items-center justify-center rounded-lg bg-white/92 p-5">
            <BrandAsset
              src={item.src}
              alt={`${item.alt} 컬러 배경`}
              className="h-full w-full"
              imageClassName="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function SpecialColorCard({
  item
}: {
  item: (typeof specialColorItems)[number];
}) {
  return (
    <article>
      <h3 className="mb-4 text-3xl font-black tracking-normal text-brand-blue">
        {item.title}
      </h3>
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-brand-line bg-white p-8">
        <BrandAsset
          src={item.src}
          alt={item.alt}
          className="h-40 w-40 sm:h-48 sm:w-48"
          imageClassName="h-full w-full object-contain"
        />
      </div>
    </article>
  );
}

function LockupCard({ item }: { item: (typeof lockupItems)[number] }) {
  return (
    <article>
      <h3 className="mb-4 text-2xl font-black text-brand-blue">{item.title}</h3>
      <GuideCanvas className="min-h-[240px] p-6">
        <BrandAsset
          src={item.src}
          alt={item.alt}
          className="h-36 w-full"
          imageClassName="h-full w-full object-contain"
          fallbackLabel="청고정총"
        />
      </GuideCanvas>
    </article>
  );
}

export default function SymbolPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(320px,440px)_1fr] lg:items-center">
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-brand-line bg-white p-8">
            <BrandAsset
              src="/assets/brand/symbol-blue.png"
              alt="청고정총 기본 심벌"
              className="h-64 w-64 sm:h-72 sm:w-72"
              imageClassName="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-brand-blue">
              Symbol
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-brand-blue sm:text-4xl">
              심벌의 의미
            </h2>
            <div className="mt-8 h-0.5 w-16 bg-brand-ink" />
            <div className="mt-8 space-y-5 text-lg leading-9 text-brand-ink">
              <p>
                청주고정시파이터총연맹의 심벌은 깃발을 움켜쥔 손,
                톱니바퀴, 그리고 정시 문구로 구성되어 있습니다. 깃발은 하나의
                목표 아래 모인 정시파이터 공동체를, 손은 그 목표를 끝까지
                붙잡는 결의를 의미합니다.
              </p>
              <p>
                톱니바퀴는 매일의 학습 루틴과 시간 관리, 자료 공유, 모의고사
                분석이 맞물려 돌아가는 체계적인 정시 시스템을 상징합니다. 중앙의
                정시 문구는 자신의 선택을 실력으로 증명하겠다는 청고정총의
                선언입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8">
          <div className="rounded-xl border border-brand-line bg-slate-50 p-4 sm:p-6">
            <BrandAsset
              src="/assets/brand/symbol-component-meaning.png"
              alt="청고정총 심벌 요소별 의미"
              className="h-auto min-h-[220px] w-full"
              imageClassName="h-full w-full object-contain"
              fallbackLabel="심벌 의미"
            />
          </div>
          <div className="rounded-xl border border-brand-line bg-slate-50 p-4 sm:p-6">
            <BrandAsset
              src="/assets/brand/symbol-meaning-diagram.png"
              alt="청고정총 심벌 조합 다이어그램"
              className="h-auto min-h-[220px] w-full"
              imageClassName="h-full w-full object-contain"
              fallbackLabel="조합도"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-brand-line bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeader
            eyebrow="Color Meaning"
            title="색의 의미"
            description="청고정총의 상징색은 정체성, 태도, 방향성을 시각적으로 드러내는 핵심 요소입니다."
          />
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
            <div className="flex min-h-[340px] items-center justify-center rounded-xl border border-brand-line bg-white p-8">
              <BrandAsset
                src="/assets/brand/symbol-blue.png"
                alt="청고정총 대표 블루 심벌"
                className="h-56 w-56"
                imageClassName="h-full w-full object-contain"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {colorMeaningItems.map((item) => (
                <ColorMeaningCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeader
          eyebrow="Basic System"
          title="기본형"
          description="심벌은 청고정총을 대표하는 가장 기본적인 시각 자산입니다. 비율과 최소 크기를 지켜 일관된 이미지를 유지합니다."
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <GuideAssetCard
            title="기본형"
            src="/assets/brand/symbol-blue.png"
            alt="청고정총 기본형 심벌"
            downloadHref="/assets/brand/symbol-blue.png"
          />
          <article>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-2xl font-black text-brand-blue">최소 사용 규격</h3>
              <Ruler aria-hidden="true" className="h-5 w-5 text-brand-blue" />
            </div>
            <GuideCanvas>
              <div className="flex flex-col items-center gap-8 sm:flex-row">
                <div className="relative">
                  <BrandAsset
                    src="/assets/brand/symbol-blue.png"
                    alt="청고정총 최소 사용 규격 심벌"
                    className="h-28 w-28 sm:h-32 sm:w-32"
                    imageClassName="h-full w-full object-contain"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-5 top-0 h-full border-l border-slate-400"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-8 top-0 w-6 border-t border-slate-400"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-8 bottom-0 w-6 border-t border-slate-400"
                  />
                </div>
                <div className="max-w-sm text-center sm:text-left">
                  <span className="inline-flex rounded-full bg-slate-700 px-4 py-2 text-lg font-black text-white">
                    10mm
                  </span>
                  <p className="mt-5 text-base font-bold leading-8 text-brand-ink">
                    심벌의 가독성과 일관된 이미지를 확보하기 위해 인쇄물에서는
                    세로 10mm 미만 사용을 지양합니다.
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-7 text-brand-muted">
                    디지털 환경에서는 최소 높이 24px 이상 사용을 권장합니다.
                  </p>
                </div>
              </div>
            </GuideCanvas>
          </article>
        </div>
      </section>

      <section className="border-t border-brand-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeader
            eyebrow="Color Usage"
            title="색상 활용"
            description="기본 색상 활용은 BLUE와 BLACK을 중심으로 운영합니다."
          />
          <div className="grid gap-10 lg:grid-cols-2">
            {colorUsageItems.map((item) => (
              <ColorUsageCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-brand-line bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeader
            eyebrow="Special Color"
            title="별색 활용"
            description="특별한 목적의 제작물에서는 골드, 실버, 스크린 그레이 버전을 제한적으로 사용할 수 있습니다."
          />
          <div className="grid gap-8 lg:grid-cols-3">
            {specialColorItems.map((item) => (
              <SpecialColorCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeader
          eyebrow="Lockup"
          title="좌우조합형"
          description="심벌과 명칭을 함께 사용하는 조합형 로고입니다. 적용 매체의 폭과 언어 환경에 맞춰 선택합니다."
        />
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2">
          {lockupItems.map((item) => (
            <LockupCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-slate-50 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
              <Info aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-ink">
                상징물 사용 안내
              </h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
                <p>
                  청주고정시파이터총연맹의 로고, 심벌, 구호 및 관련 상징물은
                  청고정총을 대표하는 공식 이미지입니다. 해당 상징물은 청고정총의
                  공지, 행사, 자료, 모의고사, 굿즈, 커뮤니티 운영 등 단체의
                  공식적인 목적에 맞게 사용되어야 합니다.
                </p>
                <p>
                  로고의 비율을 임의로 변형하거나, 색상을 무단으로 변경하거나,
                  청고정총의 명예를 훼손할 수 있는 방식으로 사용하는 것은
                  지양합니다. 특히 상업적 목적, 비방 목적, 허위 홍보, 사칭,
                  조롱성 편집 등 단체의 신뢰를 해칠 수 있는 사용은 제한될 수
                  있습니다.
                </p>
              </div>
              <div className="mt-7 space-y-3 text-base font-black leading-8 text-brand-blue">
                <p>
                  청고정총 로고 및 상징물은 청주고정시파이터총연맹의 공식 활동과
                  관련된 범위 안에서 사용하는 것을 원칙으로 합니다.
                </p>
                <p>
                  공식 자료 제작, 행사 홍보, 굿즈 제작 등 별도 활용이 필요한
                  경우 운영진에게 문의해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
