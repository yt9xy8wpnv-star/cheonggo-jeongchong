"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubjectPreferenceForm } from "@/components/auth/SubjectPreferenceForm";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import { getLoginRedirectHref } from "@/lib/redirect";
import { defaultSubjectPreferences } from "@/lib/subjects";
import { validateSubjectPreferences } from "@/lib/subjectValidation";
import type { Profile, SubjectPreferenceInput, SubjectPreferences } from "@/lib/supabase/types";

function toSubjectInput(subjects: SubjectPreferences): SubjectPreferenceInput {
  return {
    korean_subject: subjects.korean_subject,
    math_subject: subjects.math_subject,
    english_subject: subjects.english_subject,
    history_subject: subjects.history_subject,
    inquiry_subject_1: subjects.inquiry_subject_1,
    inquiry_subject_2: subjects.inquiry_subject_2,
    second_language_subject: subjects.second_language_subject
  };
}

export function SubjectsEditor() {
  const [subjects, setSubjects] = useState<SubjectPreferenceInput>(
    defaultSubjectPreferences
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [allowed, setAllowed] = useState(false);

  const validation = useMemo(() => validateSubjectPreferences(subjects), [subjects]);

  useEffect(() => {
    let mounted = true;

    async function loadSubjects() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (mounted) {
          setMessage(getSupabaseConfigMessage());
          setLoading(false);
        }
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
        return;
      }

      const { data: nextProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle<Profile>();

      const { data: nextSubjects } = await supabase
        .from("subject_preferences")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle<SubjectPreferences>();

      if (mounted) {
        setProfile(nextProfile ?? null);
        setAllowed(nextProfile?.status === "approved");
        setSubjects(nextSubjects ? toSubjectInput(nextSubjects) : defaultSubjectPreferences);
        setLoading(false);
      }
    }

    loadSubjects();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !profile || !validation.isValid) {
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("subject_preferences")
      .update({ ...subjects, history_subject: "응시", updated_at: new Date().toISOString() })
      .eq("profile_id", profile.id);

    setSaving(false);
    setMessage(error ? "저장 중 오류가 발생했습니다." : "선택과목이 저장되었습니다.");
  };

  if (loading) {
    return <p className="text-sm font-bold text-brand-muted">정보를 불러오는 중입니다.</p>;
  }

  if (!allowed) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6">
        <h2 className="text-2xl font-black text-brand-ink">로그인이 필요합니다</h2>
        <p className="mt-3 text-sm leading-6 text-brand-muted">
          승인된 회원만 선택과목을 수정할 수 있습니다.
        </p>
        <Link
          href={getLoginRedirectHref("/mypage/profile")}
          className="focus-ring mt-5 inline-flex rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-line bg-white p-6">
      <SubjectPreferenceForm value={subjects} onChange={setSubjects} disabled={saving} />
      {message ? (
        <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-bold text-brand-blue">
          {message}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleSave}
        disabled={!validation.isValid || saving}
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <Save aria-hidden="true" className="h-4 w-4" />
        {saving ? "저장 중" : "선택과목 저장"}
      </button>
    </div>
  );
}
