import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { ReactNode } from "react";

export type PortalBrand = {
  name: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  showPoweredBy: boolean;
  supportPhone?: string | null;
  supportEmail?: string | null;
};

export function PortalShell({
  brand,
  userName,
  children,
  active = "home",
}: {
  brand: PortalBrand;
  userName?: string | null;
  children: ReactNode;
  active?: "home" | "jobs" | "invoices" | "request";
}) {
  const nav = [
    { href: "/portal", id: "home", label: "Home" },
    { href: "/portal/jobs", id: "jobs", label: "Jobs" },
    { href: "/portal/invoices", id: "invoices", label: "Invoices" },
    { href: "/portal/request", id: "request", label: "Request service" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header
        className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur"
        style={{ borderBottomColor: `${brand.primaryColor}22` }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/portal" className="flex items-center gap-2.5 min-w-0">
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-8 w-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {brand.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-slate-900 truncate text-sm sm:text-base">
              {brand.name}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm shrink-0">
            {userName && (
              <span className="text-slate-600 hidden sm:inline truncate max-w-[120px]">
                {userName}
              </span>
            )}
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-slate-500 hover:text-red-600 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2 -mb-px">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                style={
                  isActive
                    ? { backgroundColor: brand.primaryColor }
                    : undefined
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-slate-500 space-y-1">
          {(brand.supportPhone || brand.supportEmail) && (
            <p>
              Need help?{" "}
              {brand.supportPhone && (
                <a
                  href={`tel:${brand.supportPhone}`}
                  className="font-medium hover:underline"
                  style={{ color: brand.primaryColor }}
                >
                  {brand.supportPhone}
                </a>
              )}
              {brand.supportPhone && brand.supportEmail && " · "}
              {brand.supportEmail && (
                <a
                  href={`mailto:${brand.supportEmail}`}
                  className="font-medium hover:underline"
                  style={{ color: brand.primaryColor }}
                >
                  {brand.supportEmail}
                </a>
              )}
            </p>
          )}
          {brand.showPoweredBy && (
            <p className="text-xs text-slate-400">
              Powered by{" "}
              <a
                href="https://serviceflow-pro.com"
                className="hover:text-slate-600"
                target="_blank"
                rel="noreferrer"
              >
                ServiceFlow Pro
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

export function StatusBadge({
  status,
  brand,
}: {
  status: string;
  brand: PortalBrand;
}) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    estimate: { label: "Estimate", bg: "bg-amber-50", text: "text-amber-800" },
    scheduled: {
      label: "Scheduled",
      bg: "bg-sky-50",
      text: "text-sky-800",
    },
    in_progress: {
      label: "In progress",
      bg: "bg-indigo-50",
      text: "text-indigo-800",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-slate-100",
      text: "text-slate-600",
    },
    draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600" },
    sent: { label: "Awaiting payment", bg: "bg-amber-50", text: "text-amber-800" },
    paid: { label: "Paid", bg: "bg-emerald-50", text: "text-emerald-800" },
    overdue: { label: "Overdue", bg: "bg-red-50", text: "text-red-800" },
  };
  const s = map[status] || {
    label: status.replace(/_/g, " "),
    bg: "bg-slate-100",
    text: "text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
