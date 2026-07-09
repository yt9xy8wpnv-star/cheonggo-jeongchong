"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const questions = Array.from({ length: 20 }, (_, index) => index + 1);
const choices = [1, 2, 3, 4, 5];

export function AnswerSheet() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="rounded-lg border border-brand-line bg-white p-5 shadow-soft">
      <div className="mb-6 flex flex-col gap-3 border-b border-brand-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-ink">답안 입력</h2>
          <p className="mt-1 text-sm text-brand-muted">
            객관식 20문항 기준 목업입니다. 제출 후 결과 페이지로 이동합니다.
          </p>
        </div>
        <p className="text-sm font-bold text-brand-blue">{answeredCount}/20 입력</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {questions.map((question) => (
          <fieldset
            key={question}
            className="rounded-lg border border-brand-line p-3"
          >
            <legend className="px-1 text-sm font-black text-brand-ink">
              {question}번
            </legend>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {choices.map((choice) => {
                const selected = answers[question] === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question]: choice
                      }))
                    }
                    className={cn(
                      "focus-ring flex aspect-square items-center justify-center rounded-md border text-sm font-black transition",
                      selected
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-brand-line bg-white text-slate-700 hover:bg-slate-50"
                    )}
                    aria-pressed={selected}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/mock/result")}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
        >
          <Send aria-hidden="true" className="h-4 w-4" />
          제출하고 결과 보기
        </button>
      </div>
    </div>
  );
}
