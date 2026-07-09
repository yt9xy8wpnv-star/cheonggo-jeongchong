"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { cn } from "@/lib/utils";

type AssetLogoProps = {
  src: string;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
  imageClassName?: string;
};

export function AssetLogo({
  src,
  alt,
  fallback,
  className,
  imageClassName
}: AssetLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "max-h-full max-w-full object-contain",
            imageClassName
          )}
          onError={() => setFailed(true)}
        />
      ) : null}
      {failed ? (
        fallback
      ) : null}
    </span>
  );
}
