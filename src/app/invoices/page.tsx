import { requireStaff } from "@/lib/session";
import { StaffShell } from "@/components/StaffShell";
import { prisma } from "@/lib/prisma";

export default async function InvoicesPage() {
  const session = await requireStaff();
  const invoices = await prisma.invoice.findMany({
    where: { companyId: session.user.companyId! },
    include: { customer: true, job: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {invoices.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No invoices yet.</div>}
          {invoices.map((inv) => (
            <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{inv.job.title}</div>
                <div className="text-sm text-slate-500">{inv.customer.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">${inv.amount.toLocaleString()}</div>
                <div className="text-xs capitalize text-slate-500">{inv.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
