import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updatePortalBrandingAction } from "@/app/actions/company";
import Link from "next/link";

export default async function PortalBrandingPage() {
  const session = await requireStaff();
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: session.user.companyId! },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Portal branding</h1>
        <p className="text-slate-500 text-sm mt-1">
          White-label your customer portal so it looks like your brand.
        </p>
      </div>

      <form action={updatePortalBrandingAction} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company name</label>
          <input
            name="name"
            defaultValue={company.name}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
          <input
            name="logoUrl"
            defaultValue={company.logoUrl || ""}
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary</label>
            <input
              name="primaryColor"
              type="color"
              defaultValue={company.primaryColor || "#0ea5e9"}
              className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secondary</label>
            <input
              name="secondaryColor"
              type="color"
              defaultValue={company.secondaryColor || "#0f172a"}
              className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Accent</label>
            <input
              name="accentColor"
              type="color"
              defaultValue={company.accentColor || "#22c55e"}
              className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Welcome message</label>
          <input
            name="portalWelcome"
            defaultValue={company.portalWelcome || ""}
            placeholder="Welcome back to Acme HVAC"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Support phone</label>
          <input
            name="supportPhone"
            defaultValue={company.supportPhone || company.phone || ""}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Support email</label>
          <input
            name="supportEmail"
            type="email"
            defaultValue={company.supportEmail || company.email || ""}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Custom portal domain</label>
          <input
            name="portalDomain"
            defaultValue={company.portalDomain || ""}
            placeholder="portal.yourcompany.com"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Point DNS CNAME to our edge; we handle SSL.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="showPoweredBy"
            defaultChecked={company.showPoweredBy ?? true}
            className="rounded border-slate-300"
          />
          Show “Powered by ServiceFlow Pro”
        </label>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700"
        >
          Save branding
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Preview as customer:{" "}
        <Link href="/portal" className="text-sky-600 font-medium hover:underline">
          Open portal
        </Link>
      </p>
    </div>
  );
}
