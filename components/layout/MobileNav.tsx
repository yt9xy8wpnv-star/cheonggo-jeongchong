"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { notices } from "@/lib/data";
import { mainMenuGroups, utilityMenuLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [activeKey, setActiveKey] = useState(mainMenuGroups[0].key);

  const activeGroup = useMemo(
    () => mainMenuGroups.find((group) => group.key === activeKey) ?? mainMenuGroups[0],
    [activeKey]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const isCurrentPath = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const isCurrentGroup = (patterns: string[]) =>
    patterns.some((pattern) =>
      pattern === "/" ? pathname === "/" : pathname.startsWith(pattern)
    );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-brand-deep bg-cover bg-center text-white transition-all duration-[450ms] ease-out motion-reduce:transform-none motion-reduce:transition-none",
        open
          ? "visible translate-y-0 opacity-100"
          : "invisible pointer-events-none -translate-y-12 opacity-0"
      )}
      aria-hidden={!open}
      style={{
        backgroundImage:
          "linear-gradient(rgba(10, 20, 45, 0.78), rgba(10, 20, 45, 0.82)), url('/assets/menu/menu-bg.png')"
      }}
    >
      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between border-b border-white/20 pb-6">
          <nav
            aria-label="전체 메뉴 빠른 이동"
            className="hidden flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/75 md:flex"
          >
            {utilityMenuLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-5">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="focus-ring hover:text-white"
                >
                  {item.title}
                </Link>
                {index < utilityMenuLinks.length - 1 ? (
                  <span className="text-white/45">·</span>
                ) : null}
              </span>
            ))}
          </nav>
          <span className="text-sm font-black tracking-normal text-white/70 md:hidden">
            MENU
          </span>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-12 w-12 items-center justify-center rounded-md border border-white/25 text-white hover:bg-white/10"
            aria-label="전체 메뉴 닫기"
          >
            <X aria-hidden="true" className="h-7 w-7" />
          </button>
        </div>

        <div className="grid flex-1 gap-8 overflow-y-auto py-10 md:py-14 lg:grid-cols-[250px_minmax(0,1fr)_320px] lg:items-start lg:gap-14 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
          <nav
            aria-label="주요 메뉴"
            className="animate-menu-panel flex gap-2 overflow-x-auto pb-2 motion-reduce:animate-none lg:block lg:space-y-7 lg:overflow-visible lg:pb-0"
          >
            {mainMenuGroups.map((group) => {
              const selected = group.key === activeGroup.key;
              const current = isCurrentGroup(group.active);

              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setActiveKey(group.key)}
                  className={cn(
                    "focus-ring shrink-0 rounded-md border border-white/10 px-4 py-3 text-left text-lg font-black text-white/65 transition hover:bg-white/10 hover:text-white lg:flex lg:w-full lg:items-center lg:gap-4 lg:border-0 lg:bg-transparent lg:px-0 lg:py-1 lg:text-2xl xl:text-3xl",
                    selected && "bg-white/10 text-white lg:bg-transparent",
                    current && !selected && "text-white/90"
                  )}
                  aria-pressed={selected}
                >
                  <span
                    className={cn(
                      "hidden h-9 w-1 rounded-full bg-white transition lg:block",
                      selected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{group.title}</span>
                </button>
              );
            })}
          </nav>

          <section
            key={activeGroup.key}
            className="animate-menu-panel border-y border-white/15 py-8 motion-reduce:animate-none lg:border-y-0 lg:border-l lg:py-0 lg:pl-12"
          >
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              {activeGroup.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/55">
              {activeGroup.description}
            </p>
            <div className="mt-8 space-y-5">
              {activeGroup.items.map((item) => {
                const current = isCurrentPath(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "focus-ring group flex max-w-md items-center justify-between border-b border-white/0 pb-1 text-xl font-bold text-white/55 transition hover:border-white hover:text-white sm:text-2xl",
                      current && "border-white text-white"
                    )}
                    aria-current={current ? "page" : undefined}
                  >
                    <span>{item.title}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 opacity-55 transition group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="hidden animate-menu-panel space-y-3 motion-reduce:animate-none xl:block">
            {notices.slice(0, 2).map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                onClick={onClose}
                className="focus-ring flex min-h-32 items-center justify-between gap-5 border border-white/25 p-6 transition hover:bg-white/10"
              >
                <span>
                  <span className="block text-sm font-bold text-white/70">
                    {notice.tag}
                  </span>
                  <span className="mt-2 block text-base font-black leading-6 text-white">
                    {notice.title}
                  </span>
                </span>
                <ArrowRight aria-hidden="true" className="h-7 w-7 text-white/70" />
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
