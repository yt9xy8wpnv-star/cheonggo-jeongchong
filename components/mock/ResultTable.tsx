import { answerResults } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ResultTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-line bg-white">
      <div className="grid grid-cols-5 bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-700">
        <span>문항</span>
        <span>정답</span>
        <span>제출</span>
        <span>결과</span>
        <span>정답률</span>
      </div>
      {answerResults.map((row) => {
        const correct = row.answer === row.selected;
        return (
          <div
            key={row.no}
            className="grid grid-cols-5 border-t border-brand-line px-4 py-3 text-center text-sm"
          >
            <span className="font-bold text-brand-ink">{row.no}</span>
            <span>{row.answer}</span>
            <span>{row.selected}</span>
            <span
              className={cn(
                "font-black",
                correct ? "text-emerald-700" : "text-brand-red"
              )}
            >
              {correct ? "정답" : "오답"}
            </span>
            <span className="font-semibold text-brand-blue">{row.rate}%</span>
          </div>
        );
      })}
    </div>
  );
}
