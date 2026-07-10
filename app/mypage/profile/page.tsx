import type { Metadata } from "next";
import { PageHero } from "@/components/common/PageHero";
import { ProfileEditor } from "@/components/auth/ProfileEditor";

export const metadata: Metadata = {
  title: "내 정보 수정"
};

export default function MyProfilePage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Profile"
        title="내 정보 수정"
        description="아이디, 비밀번호, 선택과목 정보를 수정할 수 있습니다."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ProfileEditor />
      </section>
    </main>
  );
}
