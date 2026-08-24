import Link from "next/link";
import { Logo } from "@/components/Logo";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) {
    if (session.user.role === "customer") redirect("/portal");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/login?demo=1"
              className="text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-sky-100">
          Built for small service businesses
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
          Estimates, invoices & reviews
          <br />
          <span className="text-sky-600">without the enterprise price</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto text-balance">
          Lightweight scheduling, multi-user roles, customer portal, sales leaderboard, and private company notes — everything a service boss needs in one simple dashboard.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?demo=1"
            className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-sky-200 transition text-base"
          >
            Launch Live Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3.5 rounded-xl border border-slate-200 transition text-base"
          >
            See Features
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Demo company pre-loaded · No credit card · Mobile optimized
        </p>
      </section>

      {/* Feature grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-12">
          Everything service owners actually use
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Estimates & Invoices",
              desc: "Create professional estimates, convert to invoices in one click, track payments.",
              icon: "📄",
            },
            {
              title: "Affordable Reviews",
              desc: "Request reviews after jobs. Capture 5-star feedback and route to Google.",
              icon: "⭐",
            },
            {
              title: "Lightweight Scheduling",
              desc: "Assign jobs, set dates & times, see who’s free. No bloated dispatch board.",
              icon: "📅",
            },
            {
              title: "Multi-user Roles",
              desc: "Owner, admin, technician, customer — each sees only what they need.",
              icon: "👥",
            },
            {
              title: "Customer Portal",
              desc: "Clients log in, view jobs & bills, ask questions, and pay online.",
              icon: "🔐",
            },
            {
              title: "Sales Leaderboard",
              desc: "Daily, weekly, monthly rankings by revenue, jobs sold, and avg time.",
              icon: "🏆",
            },
            {
              title: "Private Company Notes",
              desc: "Internal folder on every job — never shared with the customer.",
              icon: "🔒",
            },
            {
              title: "Photo & File Support",
              desc: "Attach before/after photos and documents to jobs and reports.",
              icon: "📷",
            },
            {
              title: "Sales Dashboard",
              desc: "Real-time view of revenue, jobs closed, and performance metrics.",
              icon: "📊",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 text-lg">{f.title}</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo accounts */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold mb-2">Try the live demo now</h2>
          <p className="text-slate-300 mb-6">
            Sample company “Apex Home Services” is fully loaded with jobs, invoices, reviews, and team members.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-8">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wide">Owner / Admin</div>
              <div className="mt-1 font-mono text-sm">owner@apex.com</div>
              <div className="font-mono text-sm text-slate-400">password: demo123</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wide">Customer Portal</div>
              <div className="mt-1 font-mono text-sm">john.smith@email.com</div>
              <div className="font-mono text-sm text-slate-400">password: demo123</div>
            </div>
          </div>
          <Link
            href="/login?demo=1"
            className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Open Demo Login
          </Link>
        </div>
      </section>


      {/* Demo walkthrough */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">How to try the full demo</h2>
          <ol className="space-y-3 text-slate-700 text-sm list-decimal list-inside">
            <li><strong>Log in as Owner</strong> — owner@apex.com / demo123</li>
            <li>Go to <strong>Jobs</strong> → tap <strong>+ New Estimate / Job</strong> and fill the form</li>
            <li>Open any job → change status to <strong>sold</strong> (it appears in the customer portal)</li>
            <li>Use the status buttons, private notes, and Request Review</li>
            <li>Sign out → log in as <strong>Customer</strong> john.smith@email.com / demo123 to see the portal, bills & pay</li>
            <li>Check <strong>Leaderboard</strong> and <strong>Dashboard</strong> for sales rankings</li>
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-slate-500">
            © 2026 Service-Link · Prototype demo for small service businesses
          </p>
        </div>
      </footer>
    </div>
  );
}
