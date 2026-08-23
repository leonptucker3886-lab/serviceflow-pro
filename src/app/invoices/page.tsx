"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";

export default function InvoicesPage() {
  const { isAuthenticated, isStaff, invoices, markInvoicePaid, jobs } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  return (
    <StaffShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 text-sm mt-0.5">{invoices.length} invoices</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const job = jobs.find((j) => j.id === inv.jobId);
              return (
                <div key={inv.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{job?.title || inv.jobId}</div>
                    <div className="text-sm text-slate-500">
                      Due {inv.dueDate} · {inv.lineItems.length} line items
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : inv.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <div className="font-bold text-slate-900 w-24 text-right">
                      ${inv.amount.toLocaleString()}
                    </div>
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => markInvoicePaid(inv.id)}
                        className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg"
                      >
                        Mark paid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
