import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { getDashboardData } from "@/lib/queries";
import { StaffShell } from "@/components/StaffShell";

const statusColor: Record<string, string> = {
  estimate: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  sold: "bg-green-100 text-green-800",
  invoiced: "bg-violet-100 text-violet-800",
  paid: "bg-teal-100 text-teal-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export default async function DashboardPage() {
  const session = await requireStaff();
  const { metrics, recentJobs, leaderboard } = await getDashboardData(session.user.companyId!);

  const cards = [
    { label: "Sales today", value: `$${metrics.totalSalesToday.toLocaleString()}`, sub: `${metrics.jobsSoldToday} jobs` },
    { label: "Sales this week", value: `$${metrics.totalSalesWeek.toLocaleString()}`, sub: `${metrics.jobsSoldWeek} jobs` },
    { label: "Sales this month", value: `$${metrics.totalSalesMonth.toLocaleString()}`, sub: `${metrics.jobsSoldMonth} jobs` },
    { label: "Open jobs", value: String(metrics.openJobs), sub: `${metrics.totalJobs} total` },
  ];

  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
            </p>
          </div>
          <Link href="/jobs" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold">
            View all jobs
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{c.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent jobs</h2>
              <Link href="/jobs" className="text-sm text-sky-600 font-medium">See all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentJobs.length === 0 && <div className="px-5 py-8 text-center text-slate-500 text-sm">No jobs yet.</div>}
              {recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{job.title}</div>
                    <div className="text-sm text-slate-500 truncate">{job.customer.name} · {job.assignedTo?.name || "Unassigned"}</div>
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Weekly leaders</h2>
              <Link href="/leaderboard" className="text-sm text-sky-600 font-medium">Full board</Link>
            </div>
            <div className="p-4 space-y-3">
              {leaderboard.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No sales this week yet.</div>}
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.userId} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{entry.name}</div>
                    <div className="text-xs text-slate-500">{entry.jobsSold} jobs</div>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">${entry.salesAmount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
