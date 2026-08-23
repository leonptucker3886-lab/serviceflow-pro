"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useState, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/jobs", label: "Jobs", icon: "🔧" },
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/invoices", label: "Invoices", icon: "💵" },
  { href: "/reviews", label: "Reviews", icon: "⭐" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
];

type Props = {
  children: React.ReactNode;
  userName?: string | null;
  userRole?: string | null;
  companyName?: string | null;
};

export function StaffShell({ children, userName, userRole, companyName }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleLogout = () => startTransition(() => { logoutAction(); });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0">
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-1">{companyName || "Company"}</div>
          <div className="font-medium text-slate-900 text-sm truncate">{userName || "User"}</div>
          <div className="text-xs text-slate-500 capitalize">{userRole || ""}</div>
          <button onClick={handleLogout} disabled={pending}
            className="mt-3 text-sm text-slate-500 hover:text-red-600 transition disabled:opacity-50">
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center px-4 justify-between">
        <Logo size="sm" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Menu">
          <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-4 space-y-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === item.href ? "bg-sky-50 text-sky-700" : "text-slate-600"
                }`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
            <button onClick={handleLogout} disabled={pending} className="w-full text-left px-3 py-2.5 text-sm text-red-600">Sign out</button>
          </div>
        </div>
      )}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
