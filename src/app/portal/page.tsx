import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PortalShell, StatusBadge, type PortalBrand } from "@/components/portal/PortalShell";
import { format } from "date-fns";

export default async function PortalHomePage() {
  const session = await requireCustomer();
  const customerId = session.user.customerId!;
  const companyId = session.user.companyId!;

  const [company, jobs, invoices, openInvoiceCount] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.job.findMany({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { customerId, status: { in: ["sent", "overdue"] } },
      include: { job: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.invoice.count({
      where: { customerId, status: { in: ["sent", "overdue"] } },
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

  const activeJobs = jobs.filter((j) =>
    ["scheduled", "in_progress", "estimate"].includes(j.status)
  );

  return (
    <PortalShell brand={brand} userName={session.user.name} active="home">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {company.portalWelcome || `Welcome back${session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}`}
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm sm:text-base">
          Track jobs, pay invoices, and request service — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{activeJobs.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active jobs</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{openInvoiceCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Open invoices</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm col-span-2 sm:col-span-1">
          <Link
            href="/portal/request"
            className="block text-center font-semibold text-sm py-2 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand.primaryColor }}
          >
            Request service
          </Link>
        </div>
      </div>

      {invoices.length > 0 && (
        <section className="mb-8">
          <div
            className="rounded-2xl p-4 sm:p-5 text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">Payment due</h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {invoices.length} invoice{invoices.length > 1 ? "s" : ""} awaiting payment
                </p>
              </div>
              <Link
                href="/portal/invoices"
                className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{inv.job.title}</div>
                    <div className="text-xs text-white/70">
                      {inv.dueDate
                        ? `Due ${format(new Date(inv.dueDate), "MMM d, yyyy")}`
                        : "Due on receipt"}
                    </div>
                  </div>
                  <div className="font-bold tabular-nums">${inv.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Recent jobs</h2>
          <Link
            href="/portal/jobs"
            className="text-sm font-medium hover:underline"
            style={{ color: brand.primaryColor }}
          >
            See all
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {jobs.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              No jobs yet.{" "}
              <Link href="/portal/request" className="font-medium underline" style={{ color: brand.primaryColor }}>
                Request your first service
              </Link>
            </div>
          )}
          {jobs.map((j) => (
            <Link
              key={j.id}
              href={`/portal/jobs/${j.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">{j.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={j.status} brand={brand} />
                  {j.scheduledDate && (
                    <span className="text-xs text-slate-500">
                      {j.scheduledDate}
                      {j.scheduledTime ? ` · ${j.scheduledTime}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-slate-900 tabular-nums">
                  ${(j.invoiceAmount || j.estimateAmount || 0).toLocaleString()}
                </div>
                {j.assignedTo?.name && (
                  <div className="text-xs text-slate-500 mt-0.5">{j.assignedTo.name}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
