import { SignupRequestsTable } from "@/components/admin/SignupRequestsTable";
import { PageHero } from "@/components/common/PageHero";

export default function SignupRequestsPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Admin"
        title="회원가입 관리"
        description="가입 신청한 회원을 확인하고 승인 또는 반려할 수 있습니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SignupRequestsTable />
      </section>
    </main>
  );
}
