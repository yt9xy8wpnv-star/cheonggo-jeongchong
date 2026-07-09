"use client";

import { FormEvent, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { CommunityNoticeCard } from "@/components/community/CommunityNoticeCard";
import {
  PoliceImageUploader,
  type PolicePendingImage
} from "@/components/service/police/PoliceImageUploader";
import { ReportSubmitSuccess } from "@/components/service/police/ReportSubmitSuccess";
import { ReportTargetPicker, type SelectedPoliceTarget } from "@/components/service/police/ReportTargetPicker";
import { ReportTypeSelector } from "@/components/service/police/ReportTypeSelector";
import { useCommunityAuth } from "@/components/community/useCommunityAuth";
import {
  getPoliceReportTypeLabel,
  policeReasons,
  policeReportTypes,
  validatePoliceAccusedName,
  validatePoliceDetail
} from "@/lib/police";
import type { PoliceReportType } from "@/lib/supabase/types";

type ReportMutationPayload = {
  message?: string;
  report_id?: string;
};

const warningMessage =
  "※ 악의적인 목적의 허위 제보는 청주고정시파이터총연맹의 업무를 방해하는 행위로 간주되며, 법적 조치가 취해질 수 있음을 안내드립니다.";

const behaviorFormConfig = {
  early_admission_behavior: {
    nameLabel: "이름",
    namePlaceholder: "신고 대상자의 이름을 입력하세요",
    detailLabel: "신고 내용",
    detailPlaceholder: "수시행동으로 판단한 이유를 구체적으로 작성해주세요.",
    nameRequired: true
  },
  study_disruption: {
    nameLabel: "이름",
    namePlaceholder: "신고 대상자의 이름을 입력하세요",
    detailLabel: "신고 내용",
    detailPlaceholder: "어떤 방식으로 공부를 방해했는지 구체적으로 작성해주세요.",
    nameRequired: true
  },
  delivery_behavior: {
    nameLabel: "이름",
    namePlaceholder: "신고 대상자의 이름을 입력하세요",
    detailLabel: "신고 내용",
    detailPlaceholder: "딸배짓으로 판단한 행동을 구체적으로 작성해주세요.",
    nameRequired: true
  },
  other: {
    nameLabel: "이름",
    namePlaceholder: "관련자 이름을 입력하세요.",
    detailLabel: "신고 내용",
    detailPlaceholder: "신고 내용을 구체적으로 작성해주세요.",
    nameRequired: false
  }
} satisfies Record<
  Exclude<PoliceReportType, "post_comment">,
  {
    nameLabel: string;
    namePlaceholder: string;
    detailLabel: string;
    detailPlaceholder: string;
    nameRequired: boolean;
  }
>;

function FormWarning() {
  return (
    <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold leading-6 text-brand-red">
      {warningMessage}
    </p>
  );
}

async function submitPoliceReport({
  token,
  formData
}: {
  token: string;
  formData: FormData;
}) {
  const response = await fetch("/api/police/reports", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  const payload = (await response.json().catch(() => ({}))) as ReportMutationPayload;

  return { response, payload };
}

function PostCommentReportForm({
  token,
  onSuccess
}: {
  token: string;
  onSuccess: () => void;
}) {
  const [target, setTarget] = useState<SelectedPoliceTarget | null>(null);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!target) {
      setMessage("신고 대상을 선택해 주세요.");
      return;
    }

    if (!reason) {
      setMessage("신고 사유를 선택해 주세요.");
      return;
    }

    const detailValidation = validatePoliceDetail(detail);

    if (!detailValidation.ok) {
      setMessage(detailValidation.message);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("report_type", "post_comment");
    formData.append("target_type", target.target_type);
    formData.append("target_id", target.target_id);
    formData.append("target_label", target.target_label);
    formData.append("target_author_name", target.target_author_name);
    formData.append("reason", reason);
    formData.append("detail", detail);

    const { response, payload } = await submitPoliceReport({ token, formData });

    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "신고를 접수하지 못했습니다.");
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <ReportTargetPicker
        token={token}
        selectedTarget={target}
        onSelect={setTarget}
        onError={setMessage}
      />

      <label className="grid gap-2">
        <span className="text-sm font-black text-brand-ink">신고 사유</span>
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="focus-ring rounded-md border border-brand-line bg-white px-4 py-3 text-sm font-bold text-brand-ink"
        >
          <option value="">신고 사유 선택</option>
          {policeReasons.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-brand-ink">세부 신고 사항</span>
        <textarea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          maxLength={1000}
          placeholder="신고 사유를 구체적으로 작성해주세요."
          className="focus-ring min-h-44 resize-y rounded-md border border-brand-line px-4 py-3 text-sm leading-7 text-brand-ink placeholder:text-slate-400"
        />
      </label>

      <FormWarning />

      {message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-black text-brand-red">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="focus-ring w-full rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {submitting ? "접수 중" : "신고 접수하기"}
      </button>
    </form>
  );
}

function GeneralBehaviorReportForm({
  token,
  reportType,
  onSuccess
}: {
  token: string;
  reportType: Exclude<PoliceReportType, "post_comment">;
  onSuccess: () => void;
}) {
  const config = behaviorFormConfig[reportType];
  const [accusedName, setAccusedName] = useState("");
  const [detail, setDetail] = useState("");
  const [image, setImage] = useState<PolicePendingImage | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameValidation = validatePoliceAccusedName(
      accusedName,
      config.nameRequired
    );

    if (!nameValidation.ok) {
      setMessage(nameValidation.message);
      return;
    }

    const detailValidation = validatePoliceDetail(detail);

    if (!detailValidation.ok) {
      setMessage(detailValidation.message);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("report_type", reportType);
    formData.append("accused_name", accusedName);
    formData.append("detail", detail);

    if (image) {
      formData.append("image", image.file);
    }

    const { response, payload } = await submitPoliceReport({ token, formData });

    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "신고를 접수하지 못했습니다.");
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <label className="grid gap-2">
        <span className="text-sm font-black text-brand-ink">
          {config.nameLabel}{" "}
          <span className="text-xs font-bold text-brand-muted">
            {config.nameRequired ? "필수" : "선택"}
          </span>
        </span>
        <input
          value={accusedName}
          onChange={(event) => setAccusedName(event.target.value)}
          maxLength={30}
          placeholder={config.namePlaceholder}
          className="focus-ring rounded-md border border-brand-line px-4 py-3 text-sm font-bold text-brand-ink placeholder:text-slate-400"
        />
      </label>

      <PoliceImageUploader image={image} onImageChange={setImage} onError={setMessage} />

      <label className="grid gap-2">
        <span className="text-sm font-black text-brand-ink">{config.detailLabel}</span>
        <textarea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          maxLength={1000}
          placeholder={config.detailPlaceholder}
          className="focus-ring min-h-44 resize-y rounded-md border border-brand-line px-4 py-3 text-sm leading-7 text-brand-ink placeholder:text-slate-400"
        />
      </label>

      <FormWarning />

      {message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-black text-brand-red">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="focus-ring w-full rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {submitting ? "접수 중" : "신고 접수하기"}
      </button>
    </form>
  );
}

export function PoliceReportClient() {
  const auth = useCommunityAuth();
  const [selectedType, setSelectedType] = useState<PoliceReportType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const selectedMeta = selectedType
    ? policeReportTypes.find((type) => type.value === selectedType)
    : null;

  const handleSelectType = (type: PoliceReportType) => {
    setSelectedType(type);
    setSubmitted(false);
  };

  const resetHome = () => {
    setSelectedType(null);
    setSubmitted(false);
  };

  const renderForm = () => {
    if (!selectedType) {
      return (
        <div className="rounded-xl border border-brand-line bg-slate-50 p-6 text-sm font-bold leading-7 text-brand-muted">
          위 신고 유형을 선택하면 접수 양식이 열립니다.
        </div>
      );
    }

    if (submitted) {
      return <ReportSubmitSuccess onReset={resetHome} />;
    }

    if (auth.status === "loading") {
      return (
        <CommunityNoticeCard
          title="회원 정보를 확인하는 중입니다"
          description="잠시만 기다려 주세요."
        />
      );
    }

    if (auth.status === "config") {
      return <CommunityNoticeCard title="설정이 필요합니다" description={auth.message} />;
    }

    if (auth.status === "signed-out") {
      return (
        <CommunityNoticeCard
          title="로그인 후 이용할 수 있습니다"
          description="정시파출소 신고 접수는 승인된 회원만 가능합니다."
          actionHref="/login"
          actionLabel="로그인"
        />
      );
    }

    if (auth.status === "approval") {
      return (
        <CommunityNoticeCard
          title="회원가입 승인 후 이용할 수 있습니다"
          description="회원가입 승인 후 정시파출소를 이용할 수 있습니다."
        />
      );
    }

    if (auth.status !== "ready" || !auth.token) {
      return (
        <CommunityNoticeCard
          title="회원 정보를 확인하지 못했습니다"
          description={auth.message || "다시 로그인한 뒤 이용해 주세요."}
          actionHref="/login"
          actionLabel="로그인"
        />
      );
    }

    return (
      <div className="rounded-xl border border-brand-line bg-white p-6">
        <div className="flex items-start gap-3 border-b border-brand-line pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand-red">
            <ShieldAlert aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-blue">Police Report</p>
            <h2 className="mt-1 text-2xl font-black text-brand-ink">
              {selectedMeta?.label ?? getPoliceReportTypeLabel(selectedType)}
            </h2>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              {selectedMeta?.description}
            </p>
          </div>
        </div>

        {selectedType === "post_comment" ? (
          <PostCommentReportForm
            key={selectedType}
            token={auth.token}
            onSuccess={() => setSubmitted(true)}
          />
        ) : (
          <GeneralBehaviorReportForm
            key={selectedType}
            token={auth.token}
            reportType={selectedType}
            onSuccess={() => setSubmitted(true)}
          />
        )}
      </div>
    );
  };

  return (
    <main className="bg-white">
      <section className="border-b border-brand-line bg-brand-deep text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-bold text-blue-100">Jeongsi Police</p>
          <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
            정시파출소
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-blue-50">
            청고정총 질서 유지를 위한 신고 및 제보를 접수합니다.
          </p>
          <p className="mt-2 text-sm font-bold text-blue-100">
            접수된 신고는 운영진 검토 후 처리됩니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ReportTypeSelector selectedType={selectedType} onSelect={handleSelectType} />
        <div className="mt-8">{renderForm()}</div>
      </section>
    </main>
  );
}
