import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/common/Badge";

export function MainHero() {
  return (
    <section className="overflow-hidden bg-white">
      <div
        className="relative min-h-[340px] bg-slate-50 bg-cover bg-[center_top] sm:min-h-[420px] lg:min-h-[500px] xl:min-h-[540px]"
        style={{ backgroundImage: "url('/assets/main/hero-flag.png')" }}
        aria-label="청고정총 깃발 배경"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-white/0 to-white sm:h-28" />
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 pb-16 pt-0 sm:-mt-12 sm:px-6 lg:-mt-14 lg:px-8 lg:pb-20">
        <div className="max-w-3xl">
          <Badge tone="모의고사" className="w-fit">
            공식 홈페이지
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-brand-ink sm:text-5xl lg:text-6xl">
            청주고정시파이터총연맹
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
            청주고 정시파이터들의 공지, 자료, 모의고사, 서비스를 한곳에서
            관리하는 공식 홈페이지입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/notice"
              className="focus-ring inline-flex items-center rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
            >
              공지사항 보기
            </Link>
            <Link
              href="/service/calendar"
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-brand-blue px-5 py-3 text-sm font-black text-brand-blue hover:bg-blue-50"
            >
              정시 일정 확인
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
