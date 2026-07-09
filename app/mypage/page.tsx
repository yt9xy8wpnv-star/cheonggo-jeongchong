import { MyPageClient } from "@/components/auth/MyPageClient";
import { PageHero } from "@/components/common/PageHero";

export default function MyPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="My Page"
        title="마이페이지"
        description="내 정보, 선택과목, 모의고사 결과, 주문 내역, 신고 내역을 확인합니다."
      />
      <MyPageClient />
    </main>
  );
}
