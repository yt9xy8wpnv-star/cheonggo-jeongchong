"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getSubPageCategory,
  getSubPageCurrentItem,
  subPageCategories,
  type SubPageCategory
} from "@/lib/navigation";

type DropdownProps = {
  id: string;
  label: string;
  items: SubPageCategory["items"];
  align?: "left" | "right";
};

function DropdownBreadcrumb({ id, label, items, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-bold text-white/90 hover:text-white sm:text-base"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={[
            "h-4 w-4 transition-transform",
            open ? "rotate-180" : ""
          ].join(" ")}
        />
      </button>

      {open ? (
        <div
          id={id}
          className={[
            "absolute top-full z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-white/15 bg-white text-brand-ink shadow-xl",
            align === "right" ? "right-0" : "left-0"
          ].join(" ")}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-100 px-4 py-3 text-sm font-black last:border-b-0 hover:bg-blue-50 hover:text-brand-blue focus:bg-blue-50 focus:text-brand-blue focus:outline-none"
            >
              {item.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SubPageHero() {
  const pathname = usePathname();
  const category = getSubPageCategory(pathname);

  if (!category) {
    return null;
  }

  const currentItem = getSubPageCurrentItem(pathname, category);
  const categoryDropdownItems = subPageCategories.map(({ title, href }) => ({
    title,
    href
  }));

  return (
    <section className="relative isolate overflow-visible bg-brand-deep">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/subpage/subpage-hero-bg.png')",
          backgroundPosition: "center 45%"
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(23,37,84,0.32)_0%,rgba(10,20,45,0.58)_58%,rgba(10,20,45,0.82)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,20,45,0.68)_0%,rgba(10,20,45,0.35)_44%,rgba(10,20,45,0.68)_100%)]"
      />

      <div className="mx-auto flex min-h-[240px] max-w-7xl flex-col justify-center px-4 py-14 sm:min-h-[280px] sm:px-6 lg:min-h-[340px] lg:px-8">
        <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl lg:text-5xl">
          {currentItem.heroTitle ?? category.title}
        </h1>

        <nav aria-label="현재 위치" className="mt-6">
          <ol className="flex flex-wrap items-center gap-2 text-white/80">
            <li>
              <Link
                href="/"
                className="focus-ring inline-flex items-center rounded-md p-1 text-white/90 hover:text-white"
                aria-label="홈으로 이동"
              >
                <Home aria-hidden="true" className="h-4 w-4" />
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <DropdownBreadcrumb
                id="subpage-category-menu"
                label={category.title}
                items={categoryDropdownItems}
              />
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <DropdownBreadcrumb
                id="subpage-current-menu"
                label={currentItem.title}
                items={category.items}
                align="right"
              />
            </li>
          </ol>
        </nav>
      </div>
    </section>
  );
}
