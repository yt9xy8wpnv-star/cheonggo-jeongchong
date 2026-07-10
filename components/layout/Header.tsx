"use client";

import Link from "next/link";
import { Bell, Menu, Search, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetLogo } from "@/components/common/AssetLogo";
import { MobileNav } from "@/components/layout/MobileNav";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

type HeaderAccountState = {
  label: string;
  href: "/login" | "/mypage";
  signedIn: boolean;
};

const loggedOutAccount: HeaderAccountState = {
  label: "로그인",
  href: "/login",
  signedIn: false
};

export function Header() {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<HeaderAccountState>(loggedOutAccount);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;

    async function loadAccount() {
      const {
        data: { user }
      } = await client.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        setAccount(loggedOutAccount);
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle<Profile>();

      if (!mounted) {
        return;
      }

      if (!profile || profile.status !== "approved") {
        await client.auth.signOut();
        setAccount(loggedOutAccount);
        return;
      }

      setAccount({
        label: profile.name || "마이페이지",
        href: "/mypage",
        signedIn: true
      });
    }

    const timer = window.setTimeout(() => {
      void loadAccount();
    }, 0);

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange(() => {
      void loadAccount();
    });

    return () => {
      mounted = false;
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex items-center" aria-label="청고정총 홈">
            <AssetLogo
              src="/assets/logo-horizontal.png"
              alt="청주고정시파이터총연맹"
              className="h-11 max-w-[190px] sm:h-12 sm:max-w-[260px] lg:max-w-[300px]"
              imageClassName="max-h-12 w-auto"
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
            {account.signedIn ? (
              <Link
                href="/mypage"
                aria-label="마이페이지"
                className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-black text-slate-800 hover:bg-slate-50 hover:text-brand-blue sm:px-3"
              >
                <UserCircle aria-hidden="true" className="h-5 w-5" />
                <span className="hidden max-w-24 truncate sm:inline">{account.label}</span>
              </Link>
            ) : (
              <Link
                href={account.href}
                className="focus-ring inline-flex rounded-md px-2 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-brand-blue sm:px-3"
              >
                로그인
              </Link>
            )}
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
