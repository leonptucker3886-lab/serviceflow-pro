"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";

export default function LeaderboardPage() {
  const { isAuthenticated, isStaff, getLeaderboard } = useApp();
  const router = useRouter();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  const board = getLeaderboard(period);

  return (
    <StaffShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Leaderboard</h1>
            <p className="text-slate-600 text-sm mt-0.5">Who is ahead on sales and jobs closed</p>
          </div>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                  period === p ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Team member</div>
            <div className="col-span-3 text-right">Sales</div>
            <div className="col-span-2 text-right">Jobs sold</div>
            <div className="col-span-2 text-right">Avg time</div>
          </div>
          <div className="divide-y divide-slate-100">
            {board.map((entry, i) => (
              <div
                key={entry.userId}
                className="grid grid-cols-2 sm:grid-cols-12 gap-2 px-5 py-4 items-center"
              >
                <div className="col-span-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-4 font-medium text-slate-900">{entry.name}</div>
                <div className="col-span-1 sm:col-span-3 text-right font-bold text-slate-900">
                  ${entry.salesAmount.toLocaleString()}
                </div>
                <div className="hidden sm:block sm:col-span-2 text-right text-slate-600">
                  {entry.jobsSold}
                </div>
                <div className="hidden sm:block sm:col-span-2 text-right text-slate-600">
                  {entry.avgTimeMinutes ? `${entry.avgTimeMinutes}m` : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
