import { requireStaff } from "@/lib/session";
import { StaffShell } from "@/components/StaffShell";
import { getDashboardData } from "@/lib/queries";

export default async function LeaderboardPage() {
  const session = await requireStaff();
  const { leaderboard } = await getDashboardData(session.user.companyId!);
  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-sm text-slate-500">Sales this week</p>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {leaderboard.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No sales this week.</div>}
          {leaderboard.map((entry, i) => (
            <div key={entry.userId} className="px-5 py-3.5 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{i + 1}</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{entry.name}</div>
                <div className="text-xs text-slate-500">{entry.jobsSold} jobs sold</div>
              </div>
              <div className="font-semibold text-slate-900">${entry.salesAmount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
