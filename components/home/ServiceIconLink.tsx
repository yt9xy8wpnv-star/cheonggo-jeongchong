"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  AlarmClock,
  CalendarDays,
  FileText,
  ShieldAlert,
  ShoppingBag
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ServiceIconName = "shop" | "police" | "timer" | "calendar" | "resources";

const fallbackIcons = {
  shop: ShoppingBag,
  police: ShieldAlert,
  timer: AlarmClock,
  calendar: CalendarDays,
  resources: FileText
};

type ServiceIconLinkProps = {
  title: string;
  href: string;
  imageSrc: string;
  fallbackIcon: ServiceIconName;
};

export function ServiceIconLink({
  title,
  href,
  imageSrc,
  fallbackIcon
}: ServiceIconLinkProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const Icon = fallbackIcons[fallbackIcon];

  return (
    <Link
      href={href}
      className="focus-ring group flex min-h-28 flex-col items-center justify-center text-center"
    >
      <span className="flex h-20 w-20 items-center justify-center">
        {!failed ? (
          <img
            src={imageSrc}
            alt=""
            className={cn(
              loaded ? "block" : "hidden",
              "h-14 w-14 object-contain transition duration-200 group-hover:-translate-y-1"
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        ) : null}
        {!loaded || failed ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-50 text-brand-blue transition duration-200 group-hover:-translate-y-1 group-hover:bg-blue-100 group-hover:text-brand-deep">
            <Icon aria-hidden="true" className="h-8 w-8 stroke-[1.8]" />
          </span>
        ) : null}
      </span>
      <span className="mt-3 text-base font-semibold text-brand-ink transition group-hover:text-brand-blue">
        {title}
      </span>
    </Link>
  );
}
