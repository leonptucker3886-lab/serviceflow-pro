"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";

export default function SchedulePage() {
  const { isAuthenticated, isStaff, jobs } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  const scheduled = jobs
    .filter((j) => j.scheduledDate && ["scheduled", "in_progress"].includes(j.status))
    .sort((a, b) => (a.scheduledDate! + (a.scheduledTime || "")).localeCompare(b.scheduledDate! + (b.scheduledTime || "")));

  return (
    <StaffShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-600 text-sm mt-0.5">Lightweight dispatch view</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {scheduled.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500">No upcoming scheduled jobs.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scheduled.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 hover:bg-slate-50 transition"
                >
                  <div className="sm:w-32 shrink-0">
                    <div className="font-semibold text-slate-900">{job.scheduledDate}</div>
                    <div className="text-sm text-sky-600">{job.scheduledTime || "TBD"}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-sm text-slate-500">
                      {job.customerName} · {job.address}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {job.assignedName || "Unassigned"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffShell>
  );
}
