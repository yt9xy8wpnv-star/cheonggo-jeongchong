import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { numberStats } from "@/lib/data";

export function NumbersSection() {
  return (
    <section
      className="relative overflow-hidden bg-brand-deep bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/assets/main/numbers-bg.png')" }}
    >
      <div className="absolute inset-0 bg-slate-950/80" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-xl font-black text-sky-300">Numbers</p>
          <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            숫자로 증명하는 정시
          </h2>
        </div>

        <div className="mt-14 grid gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {numberStats.map((stat, index) => (
            <article
              key={stat.title}
              className="px-0 md:px-8 lg:border-l lg:border-white/20 first:lg:border-l-0"
            >
              <p className="text-xl font-black leading-7 text-white">{stat.title}</p>
              <p className="mt-2 text-base font-semibold text-white/70">
                {stat.description}
              </p>
              <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2">
                {stat.values.map((value) => (
                  <p key={`${stat.title}-${value.label}-${value.value}`}>
                    {value.label ? (
                      <span className="mr-2 text-2xl font-black text-sky-400">
                        {value.label}{" "}
                      </span>
                    ) : null}
                    <span className="text-6xl font-black tracking-normal text-sky-400">
                      {value.value}
                    </span>
                  </p>
                ))}
              </div>
              {index === 0 ? (
                <p className="mt-5 text-sm font-semibold text-white/55">
                  청고정총 내부 홍보용 mock 지표
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/admission-results"
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/35 bg-white px-5 py-3 text-sm font-black text-brand-deep hover:bg-sky-50"
          >
            입시 결과 자세히 보기
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <span className="h-2.5 w-12 rounded-full bg-white" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
        </div>
      </div>
    </section>
  );
}
