"use client";

import Link from "next/link";
import { Bell, Menu, Search, UserCircle } from "lucide-react";
import { useState } from "react";
import { AssetLogo } from "@/components/common/AssetLogo";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex items-center" aria-label="청고정총 홈">
            <AssetLogo
              src="/assets/logo-horizontal.png"
              alt="청주고정시파이터총연맹"
              className="h-14 max-w-[230px] sm:h-16 sm:max-w-[300px] lg:max-w-[340px]"
              imageClassName="max-h-16 w-auto"
              fallback={
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-blue text-base font-black text-brand-blue">
                    정
                  </span>
                  <span className="leading-tight">
                    <span className="block text-lg font-black text-brand-ink">
                      청주고정시파이터총연맹
                    </span>
                    <span className="block text-xs font-bold text-brand-muted">
                      CHEONGGO JEONGCHONG
                    </span>
                  </span>
                </div>
              }
            />
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="focus-ring hidden rounded-md px-3 py-2 text-xs font-bold text-slate-600 hover:text-brand-blue sm:inline-flex"
            >
              로그인
            </Link>
            <button
              type="button"
              aria-label="알림"
              className="focus-ring hidden h-10 w-10 items-center justify-center rounded-md text-slate-800 hover:bg-slate-50 sm:flex"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="검색"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-slate-800 hover:bg-slate-50"
            >
              <Search aria-hidden="true" className="h-5 w-5" />
            </button>
            <Link
              href="/mypage"
              aria-label="마이페이지"
              className="focus-ring hidden h-10 w-10 items-center justify-center rounded-md text-slate-800 hover:bg-slate-50 sm:flex"
            >
              <UserCircle aria-hidden="true" className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="focus-ring flex items-center gap-2 rounded-md px-2.5 py-2 text-brand-blue hover:bg-blue-50"
              aria-label="전체 메뉴 열기"
            >
              <Menu aria-hidden="true" className="h-6 w-6" />
              <span className="hidden text-sm font-black sm:inline">MENU</span>
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
