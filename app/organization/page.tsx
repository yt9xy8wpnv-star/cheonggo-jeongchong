import { Network } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { organizationUnits } from "@/lib/data";

export default function OrganizationPage() {
  return (
    <main>
      <PageHero
        eyebrow="Organization"
        title="조직도"
        description="대표와 운영진을 중심으로 모의고사, 커뮤니티, 굿즈, 자료, 정시파출소 업무를 나누어 관리합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizationUnits.map((unit, index) => (
            <article
              key={unit.name}
              className="rounded-lg border border-brand-line bg-white p-6 shadow-soft"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-brand-blue">
                  <Network aria-hidden="true" className="h-6 w-6" />
                </div>
                <span className="text-sm font-black text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className="text-xl font-black text-brand-ink">{unit.name}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">{unit.role}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
