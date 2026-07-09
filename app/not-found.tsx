import Link from "next/link";
import { PageHero } from "@/components/common/PageHero";

export default function NotFound() {
  return (
    <main>
      <PageHero
        eyebrow="404"
        title="페이지를 찾을 수 없습니다"
        description="주소가 바뀌었거나 아직 준비 중인 페이지입니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring inline-flex items-center rounded-md bg-brand-blue px-5 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          메인으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
