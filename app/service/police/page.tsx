import type { Metadata } from "next";
import { PageHero } from "@/components/common/PageHero";
import { PoliceReportClient } from "@/components/service/police/PoliceReportClient";

export const metadata: Metadata = {
  title: "정시파출소"
};

export default function PolicePage() {
  return (
    <>
      <PageHero
        eyebrow="Service"
        title="정시파출소"
        description="청고정총 질서 유지를 위한 신고 및 제보를 접수합니다."
      />
      <PoliceReportClient />
    </>
  );
}
