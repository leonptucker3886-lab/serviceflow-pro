import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PortalShell, type PortalBrand } from "@/components/portal/PortalShell";
import { requestServiceAction } from "@/app/actions/jobs";

export default async function PortalRequestPage() {
  const session = await requireCustomer();
  const companyId = session.user.companyId!;

  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });

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
    <PortalShell brand={brand} userName={session.user.name} active="request">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Request service</h1>
        <p className="text-slate-500 text-sm mt-1">
          Tell us what you need — we&apos;ll follow up with an estimate or schedule.
        </p>
      </div>

      <form
        action={requestServiceAction}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
            What do you need?
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. AC not cooling, annual furnace tune-up"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ ["--tw-ring-color" as string]: brand.primaryColor }}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Details
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the issue, preferred times, or any access notes..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
            Service address
          </label>
          <input
            id="address"
            name="address"
            placeholder="Street, city, state, zip"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-700 mb-1.5">
            Preferred date (optional)
          </label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Submit request
        </button>
      </form>
    </PortalShell>
  );
}
