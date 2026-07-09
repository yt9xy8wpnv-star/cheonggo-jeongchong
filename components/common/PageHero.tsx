import { AssetLogo } from "@/components/common/AssetLogo";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="border-b border-brand-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-16">
        <div>
          {eyebrow ? (
            <p className="mb-3 text-sm font-bold text-brand-blue">{eyebrow}</p>
          ) : null}
          <h1 className="text-3xl font-black leading-tight text-brand-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-brand-muted">
            {description}
          </p>
          {children ? <div className="mt-7">{children}</div> : null}
        </div>
        <div className="hidden items-center justify-center border-l border-brand-line pl-8 lg:flex">
          <AssetLogo
            src="/assets/logo-watermark.png"
            alt="청고정총 워터마크"
            className="h-32 w-48 opacity-20"
            fallback={
              <div className="flex h-32 w-48 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-sm font-bold leading-6 text-slate-400">
                청 · 고 · 정 · 총
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
