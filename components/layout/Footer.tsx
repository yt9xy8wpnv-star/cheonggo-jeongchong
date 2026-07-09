import Link from "next/link";
import { AssetLogo } from "@/components/common/AssetLogo";

const footerLinks = [
  { label: "단체소개", href: "/about" },
  { label: "공지사항", href: "/notice" },
  { label: "커뮤니티", href: "/community" },
  { label: "모의고사", href: "/mock" },
  { label: "자료실", href: "/service/resources" },
  { label: "관리자", href: "/admin" }
];

export function Footer() {
  return (
    <footer className="border-t border-brand-line bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <AssetLogo
            src="/assets/logo-footer.png"
            alt="청주고정시파이터총연맹 푸터 로고"
            className="h-16"
            fallback={
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-lg font-black">
                  정
                </span>
                <div>
                  <p className="text-xl font-black">청주고정시파이터총연맹</p>
                  <p className="text-sm font-semibold text-white/60">청 · 고 · 정 · 총</p>
                </div>
              </div>
            }
          />
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
            청고정총은 정시를 준비하는 청주고 학생들이 공지, 자료, 모의고사,
            커뮤니티를 함께 관리하기 위해 만든 학생 중심 운영 플랫폼입니다.
          </p>
          <p className="mt-5 text-sm font-black text-white">
            청 · 고 · 정 · 총&nbsp;&nbsp; 자주! 결의! 투쟁!
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-black text-white">바로가기</h2>
            <nav className="mt-4 grid gap-2" aria-label="푸터 메뉴">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring text-sm text-white/65 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="text-sm font-black text-white">운영 안내</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              본 사이트는 시범 운영 목업입니다. 실제 로그인, 결제, DB, 채점
              로직은 추후 연결할 수 있도록 페이지 구조와 UI를 먼저 구성했습니다.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45">
        © 2026 Cheongju High School Jeongsi Fighter Federation. All rights reserved.
      </div>
    </footer>
  );
}
