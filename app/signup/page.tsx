import { SignupForm } from "@/components/auth/SignupForm";
import { PageHero } from "@/components/common/PageHero";

export default function SignupPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Sign Up"
        title="회원가입 신청"
        description="청고정총 계정은 관리자 승인 후 사용할 수 있습니다. 아이디와 선택과목 정보를 정확히 입력해 주세요."
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <SignupForm />
      </section>
    </main>
  );
}
