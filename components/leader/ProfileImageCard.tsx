"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { UserRound } from "lucide-react";

export function ProfileImageCard() {
  const [failed, setFailed] = useState(false);

  return (
    <aside className="rounded-xl border border-brand-line bg-white p-5">
      <div className="aspect-[3/4] overflow-hidden rounded-xl border border-brand-line bg-slate-50">
        {!failed ? (
          <img
            src="/assets/people/president.png"
            alt="청주고정시파이터총연맹 대표 사진"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound aria-hidden="true" className="h-20 w-20 text-slate-300" />
          </div>
        )}
      </div>
      <div className="mt-5 border-t border-brand-line pt-5">
        <p className="text-sm font-bold text-brand-blue">청주고정시파이터총연맹 총장</p>
        <h2 className="mt-1 text-2xl font-black text-brand-ink">제1·2대 회장</h2>
      </div>
    </aside>
  );
}
