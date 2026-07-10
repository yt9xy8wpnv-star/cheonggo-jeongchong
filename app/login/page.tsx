import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageHero } from "@/components/common/PageHero";

export default function LoginPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Login"
        title="로그인"
        description="청고정총 계정으로 로그인합니다. 관리자 승인 후 이용할 수 있습니다."
      />
      <section className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="rounded-xl border border-brand-line bg-white p-6 text-sm font-bold text-brand-muted">
              로그인 화면을 준비하는 중입니다.
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
