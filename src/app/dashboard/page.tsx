"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";
import Link from "next/link";

export default function DashboardPage() {
  const { isAuthenticated, isStaff, currentUser, jobs, getMetrics, getLeaderboard, company } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  const metrics = getMetrics();
  const leaderboard = getLeaderboard("weekly");
  const recentJobs = [...jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const statusColor: Record<string, string> = {
    estimate: "bg-amber-100 text-amber-800",
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    completed: "bg-emerald-100 text-emerald-800",
    sold: "bg-sky-100 text-sky-800",
    invoiced: "bg-violet-100 text-violet-800",
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-slate-100 text-slate-600",
  };

  return (
    <StaffShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back, {currentUser?.name?.split(" ")[0]} · {company.name}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Sales Today", value: `$${metrics.totalSalesToday.toLocaleString()}`, sub: `${metrics.jobsSoldToday} jobs` },
            { label: "Sales This Week", value: `$${metrics.totalSalesWeek.toLocaleString()}`, sub: `${metrics.jobsSoldWeek} jobs` },
            { label: "Sales This Month", value: `$${metrics.totalSalesMonth.toLocaleString()}`, sub: `${metrics.jobsSoldMonth} jobs` },
            { label: "Avg Job Time", value: `${metrics.avgCompletionMinutes} min`, sub: "completed jobs" },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent jobs */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Jobs</h2>
              <Link href="/jobs" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{job.title}</div>
                    <div className="text-sm text-slate-500 truncate">
                      {job.customerName} · {job.assignedName || "Unassigned"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[job.status] || "bg-slate-100"}`}>
                      {job.status.replace("_", " ")}
                    </span>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                      ${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mini leaderboard */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Weekly Leaders</h2>
              <Link href="/leaderboard" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                Full board
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {leaderboard.slice(0, 4).map((entry, i) => (
                <div key={entry.userId} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{entry.name}</div>
                    <div className="text-xs text-slate-500">{entry.jobsSold} jobs</div>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">
                    ${entry.salesAmount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
