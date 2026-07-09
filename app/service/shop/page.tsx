import { Package, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { PlaceholderVisual } from "@/components/common/PlaceholderVisual";
import { products } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export default function ShopPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Goods Shop"
        title="굿즈샵"
        description="청고정총 공식 굿즈의 수요 조사와 주문 상태를 확인합니다. 주문하기 버튼은 현재 목업입니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="rounded-lg border border-brand-line bg-white p-4 shadow-soft">
              <PlaceholderVisual title={product.name} label="Goods" className="min-h-44" />
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-brand-ink">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {product.description}
                  </p>
                </div>
                <Badge tone={product.status === "주문 가능" ? "자료" : "운영"}>
                  {product.status}
                </Badge>
              </div>
              <p className="mt-5 text-2xl font-black text-brand-ink">
                {formatNumber(product.price)}원
              </p>
              <button
                type="button"
                className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
              >
                <ShoppingBag aria-hidden="true" className="h-4 w-4" />
                주문하기
              </button>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-brand-line bg-white p-5">
          <Package aria-hidden="true" className="mb-3 h-6 w-6 text-brand-blue" />
          <p className="text-sm leading-7 text-brand-muted">
            실제 결제와 배송 정보 입력은 추후 연결 예정입니다. 현재 화면은 상품
            구성과 주문 상태를 확인하기 위한 목업입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
