import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PortalShell, StatusBadge, type PortalBrand } from "@/components/portal/PortalShell";

export default async function PortalJobsPage() {
  const session = await requireCustomer();
  const customerId = session.user.customerId!;
  const companyId = session.user.companyId!;

  const [company, jobs] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.job.findMany({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
      include: { assignedTo: { select: { name: true } }, invoice: true },
    }),
  ]);

  const brand: PortalBrand = {
    name: company.name,
    logoUrl: company.logoUrl,
    primaryColor: company.primaryColor || "#0ea5e9",
    secondaryColor: company.secondaryColor || "#0f172a",
    accentColor: company.accentColor || "#22c55e",
    showPoweredBy: company.showPoweredBy ?? true,
    supportPhone: company.supportPhone || company.phone,
    supportEmail: company.supportEmail || company.email,
  };

  return (
    <PortalShell brand={brand} userName={session.user.name} active="jobs">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your jobs</h1>
        <p className="text-slate-500 text-sm mt-1">Track status, schedule, and details</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {jobs.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            No jobs yet.{" "}
            <Link href="/portal/request" className="font-medium underline" style={{ color: brand.primaryColor }}>
              Request service
            </Link>
          </div>
        )}
        {jobs.map((j) => (
          <Link
            key={j.id}
            href={`/portal/jobs/${j.id}`}
            className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{j.title}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <StatusBadge status={j.status} brand={brand} />
                {j.scheduledDate && (
                  <span className="text-xs text-slate-500">
                    {j.scheduledDate}{j.scheduledTime ? ` · ${j.scheduledTime}` : ""}
                  </span>
                )}
                {j.assignedTo?.name && (
                  <span className="text-xs text-slate-500">· {j.assignedTo.name}</span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-slate-900 tabular-nums">
                ${(j.invoiceAmount || j.estimateAmount || 0).toLocaleString()}
              </div>
              {j.invoice && j.invoice.status !== "paid" && (
                <div className="text-xs text-amber-600 mt-0.5">Invoice open</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
