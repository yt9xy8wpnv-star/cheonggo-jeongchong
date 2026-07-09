import type { Metadata } from "next";
import { PoliceReportClient } from "@/components/service/police/PoliceReportClient";

export const metadata: Metadata = {
  title: "정시파출소"
};

export default function PolicePage() {
  return <PoliceReportClient />;
}
