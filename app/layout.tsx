import type { Metadata } from "next";
import "./globals.css";
import { SubPageHero } from "@/components/common/SubPageHero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: {
    default: "청주고정시파이터총연맹",
    template: "%s | 청고정총"
  },
  description:
    "청주고 정시파이터들의 공지, 모의고사, 자료실, 커뮤니티, 정시 서비스를 운영하는 공식 홈페이지입니다."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <Header />
        <SubPageHero />
        {children}
        <Footer />
      </body>
    </html>
  );
}
