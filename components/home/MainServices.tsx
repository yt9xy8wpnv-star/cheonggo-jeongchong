import { ServiceIconLink } from "@/components/home/ServiceIconLink";
import { homeServiceLinks } from "@/lib/data";

export function MainServices() {
  return (
    <section className="border-b border-brand-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-xl font-black text-brand-blue sm:text-2xl">
            Cheonggo Service
          </p>
          <h2 className="mt-3 text-4xl font-black text-brand-ink">주요 서비스</h2>
          <p className="mt-4 text-sm leading-6 text-brand-muted sm:text-base">
            청고정총에서 자주 사용하는 기능을 빠르게 찾을 수 있습니다.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {homeServiceLinks.map((service) => (
            <ServiceIconLink key={service.href} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
