import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PortalShell, StatusBadge, type PortalBrand } from "@/components/portal/PortalShell";
import { format } from "date-fns";
import { createPortalCheckoutAction } from "@/app/actions/billing";

export default async function PortalInvoicesPage() {
  const session = await requireCustomer();
  const customerId = session.user.customerId!;
  const companyId = session.user.companyId!;

  const [company, invoices] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.invoice.findMany({
      where: { customerId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
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
    <PortalShell brand={brand} userName={session.user.name} active="invoices">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-500 text-sm mt-1">View and pay invoices securely</p>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            No invoices yet.
          </div>
        )}
        {invoices.map((inv) => {
          const canPay = ["sent", "overdue"].includes(inv.status);
          return (
            <div
              key={inv.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/portal/jobs/${inv.jobId}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {inv.job.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <StatusBadge status={inv.status} brand={brand} />
                    {inv.dueDate && (
                      <span className="text-xs text-slate-500">
                        Due {format(new Date(inv.dueDate), "MMM d, yyyy")}
                      </span>
                    )}
                    {inv.paidAt && (
                      <span className="text-xs text-emerald-600">
                        Paid {format(new Date(inv.paidAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-900 tabular-nums">
                    ${inv.amount.toLocaleString()}
                  </div>
                  {canPay && (
                    <form action={createPortalCheckoutAction} className="mt-2">
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: brand.accentColor }}
                      >
                        Pay now
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
