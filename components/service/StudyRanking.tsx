"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { RankingTable } from "@/components/service/RankingTable";
import type { StudyRankingResponse } from "@/lib/studyTimer";

type StudyRankingProps = {
  ranking: StudyRankingResponse | null;
  now: Date;
  loading: boolean;
};

export function StudyRanking({ ranking, now, loading }: StudyRankingProps) {
  const [showAllRanking, setShowAllRanking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!ranking) {
      return [];
    }

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko");

    if (!normalizedQuery) {
      return ranking.users;
    }

    return ranking.users.filter((user) =>
      user.name.toLocaleLowerCase("ko").includes(normalizedQuery)
    );
  }, [ranking, searchQuery]);

  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Ranking</p>
          <h2 className="mt-1 text-2xl font-black text-brand-ink">
            오늘의 정시파이터 TOP 5
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            오전 5시 기준 오늘 공부 시간을 바탕으로 집계됩니다.
          </p>
        </div>
        {loading ? (
          <span className="text-xs font-black text-brand-blue">갱신 중</span>
        ) : null}
      </div>

      <div className="mt-6">
        {ranking ? (
          <RankingTable
            users={ranking.top5}
            serverNow={ranking.server_now}
            now={now}
            emptyMessage="아직 오늘 공부 기록이 없습니다."
          />
        ) : (
          <div className="rounded-xl border border-brand-line bg-slate-50 p-6 text-sm font-bold text-brand-muted">
            랭킹을 불러오는 중입니다.
          </div>
        )}
      </div>

      {ranking ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowAllRanking((current) => !current)}
            className="focus-ring rounded-md border border-brand-blue px-4 py-2.5 text-sm font-black text-brand-blue hover:bg-blue-50"
          >
            {showAllRanking ? "전체 순위 접기" : "전체 순위 보기"}
          </button>

          {showAllRanking ? (
            <div className="mt-5 border-t border-brand-line pt-5">
              <label className="relative block max-w-md">
                <span className="sr-only">이름 검색</span>
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="이름으로 검색"
                  className="focus-ring w-full rounded-md border border-brand-line bg-white py-3 pl-10 pr-4 text-sm font-bold text-brand-ink placeholder:text-slate-400"
                />
              </label>
              <div className="mt-4">
                <RankingTable
                  users={filteredUsers}
                  serverNow={ranking.server_now}
                  now={now}
                  emptyMessage="검색 결과가 없습니다."
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
