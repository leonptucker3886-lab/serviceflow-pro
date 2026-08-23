import { requireStaff } from "@/lib/session";
import { StaffShell } from "@/components/StaffShell";
import { getCompanyJobs } from "@/lib/queries";

export default async function SchedulePage() {
  const session = await requireStaff();
  const jobs = await getCompanyJobs(session.user.companyId!);
  const scheduled = jobs.filter((j) => j.scheduledDate).sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""));
  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
        <p className="text-sm text-slate-500">Lightweight schedule view. Calendar UI coming next.</p>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {scheduled.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No scheduled jobs.</div>}
          {scheduled.map((j) => (
            <div key={j.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{j.title}</div>
                <div className="text-sm text-slate-500">{j.customer.name} · {j.assignedTo?.name || "Unassigned"}</div>
              </div>
              <div className="text-sm font-medium text-slate-700 shrink-0">{j.scheduledDate}{j.scheduledTime ? ` · ${j.scheduledTime}` : ""}</div>
            </div>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
