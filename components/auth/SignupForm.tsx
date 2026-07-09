"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { FormField } from "@/components/common/FormField";
import { SubjectPreferenceForm } from "@/components/auth/SubjectPreferenceForm";
import { defaultSubjectPreferences } from "@/lib/subjects";
import { validateSubjectPreferences } from "@/lib/subjectValidation";
import type { SubjectPreferenceInput } from "@/lib/supabase/types";

type SignupState = {
  name: string;
  grade: string;
  class_number: string;
  student_number: string;
  username: string;
  password: string;
  passwordConfirm: string;
};

const initialSignupState: SignupState = {
  name: "",
  grade: "",
  class_number: "",
  student_number: "",
  username: "",
  password: "",
  passwordConfirm: ""
};

export function SignupForm() {
  const [form, setForm] = useState(initialSignupState);
  const [subjects, setSubjects] = useState<SubjectPreferenceInput>(
    defaultSubjectPreferences
  );
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "available" | "taken">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const subjectValidation = useMemo(
    () => validateSubjectPreferences(subjects),
    [subjects]
  );

  const formWarnings = useMemo(() => {
    const warnings: string[] = [];
    const grade = Number(form.grade);
    const classNumber = Number(form.class_number);
    const studentNumber = Number(form.student_number);

    if (form.password && form.password.length < 6) {
      warnings.push("비밀번호는 6자 이상이어야 합니다.");
    }

    if (form.passwordConfirm && form.password !== form.passwordConfirm) {
      warnings.push("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }

    if (form.grade && (!Number.isInteger(grade) || grade < 1 || grade > 3)) {
      warnings.push("학년은 1~3 사이로 입력해 주세요.");
    }

    if (
      form.class_number &&
      (!Number.isInteger(classNumber) || classNumber < 1 || classNumber > 20)
    ) {
      warnings.push("반은 1~20 사이로 입력해 주세요.");
    }

    if (
      form.student_number &&
      (!Number.isInteger(studentNumber) || studentNumber < 1 || studentNumber > 40)
    ) {
      warnings.push("번호는 1~40 사이로 입력해 주세요.");
    }

    if (usernameStatus !== "available") {
      warnings.push("아이디 중복확인을 완료해 주세요.");
    }

    return warnings;
  }, [form, usernameStatus]);

  const requiredFilled =
    form.name.trim() &&
    form.grade &&
    form.class_number &&
    form.student_number &&
    form.username.trim() &&
    form.password &&
    form.passwordConfirm;

  const canSubmit =
    Boolean(requiredFilled) &&
    usernameStatus === "available" &&
    formWarnings.length === 0 &&
    subjectValidation.isValid &&
    !loading;

  const handleChange = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));

    if (name === "username") {
      setUsernameStatus("idle");
      setUsernameMessage("");
    }
  };

  const handleCheckUsername = async () => {
    setUsernameMessage("");
    setCheckingUsername(true);

    const username = form.username.trim();

    if (!username) {
      setUsernameMessage("아이디를 입력해 주세요.");
      setCheckingUsername(false);
      return;
    }

    const response = await fetch(
      `/api/auth/check-username?username=${encodeURIComponent(username)}`
    );
    const result = (await response.json()) as {
      available?: boolean;
      message?: string;
    };

    if (response.ok && result.available) {
      setUsernameStatus("available");
      setUsernameMessage(result.message ?? "사용 가능한 아이디입니다.");
    } else {
      setUsernameStatus("taken");
      setUsernameMessage(result.message ?? "이미 사용 중인 아이디입니다.");
    }

    setCheckingUsername(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        name: form.name,
        grade: Number(form.grade),
        class_number: Number(form.class_number),
        student_number: Number(form.student_number),
        subjects
      })
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(result.message ?? "회원가입 신청 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setMessage(
      result.message ?? "회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다."
    );
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl border border-brand-line bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <UserPlus aria-hidden="true" className="h-6 w-6 text-brand-blue" />
          <h2 className="text-2xl font-black text-brand-ink">기본 정보</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="이름" name="name" value={form.name} required onChange={handleChange} />
          <FormField
            label="학년"
            name="grade"
            type="number"
            value={form.grade}
            min={1}
            max={3}
            required
            onChange={handleChange}
          />
          <FormField
            label="반"
            name="class_number"
            type="number"
            value={form.class_number}
            min={1}
            max={20}
            required
            onChange={handleChange}
          />
          <FormField
            label="번호"
            name="student_number"
            type="number"
            value={form.student_number}
            min={1}
            max={40}
            required
            onChange={handleChange}
          />
          <div className="grid gap-2 md:col-span-2">
            <span className="text-sm font-bold text-brand-ink">아이디</span>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                name="username"
                value={form.username}
                placeholder="fighter01"
                required
                autoComplete="username"
                onChange={(event) => handleChange("username", event.target.value)}
                className="focus-ring rounded-md border border-brand-line bg-white px-3 py-3 text-sm text-brand-ink placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleCheckUsername}
                disabled={checkingUsername}
                className="focus-ring rounded-md border border-brand-blue px-4 py-3 text-sm font-black text-brand-blue hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                {checkingUsername ? "확인 중" : "중복확인"}
              </button>
            </div>
            {usernameMessage ? (
              <p
                className={
                  usernameStatus === "available"
                    ? "text-sm font-bold text-brand-blue"
                    : "text-sm font-bold text-red-700"
                }
              >
                {usernameMessage}
              </p>
            ) : null}
          </div>
          <FormField
            label="비밀번호"
            name="password"
            type="password"
            value={form.password}
            required
            autoComplete="new-password"
            onChange={handleChange}
          />
          <FormField
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            required
            autoComplete="new-password"
            onChange={handleChange}
          />
        </div>
      </section>

      <section className="rounded-xl border border-brand-line bg-white p-6">
        <h2 className="mb-6 text-2xl font-black text-brand-ink">선택과목 정보</h2>
        <SubjectPreferenceForm value={subjects} onChange={setSubjects} />
      </section>

      {[...formWarnings, ...subjectValidation.warnings].length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
          {[...formWarnings, ...subjectValidation.warnings].map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {message ? (
        <div
          className={
            success
              ? "flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-brand-blue"
              : "rounded-md border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
          }
        >
          {success ? <CheckCircle2 aria-hidden="true" className="h-5 w-5" /> : null}
          <span>{message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="focus-ring w-full rounded-md bg-brand-blue px-5 py-4 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "신청 중" : "회원가입 신청"}
      </button>
    </form>
  );
}
