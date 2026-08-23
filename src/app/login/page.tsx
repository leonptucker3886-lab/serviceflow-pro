"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useApp } from "@/lib/store";
import Link from "next/link";

function LoginForm() {
  const { login } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const [email, setEmail] = useState(isDemo ? "owner@apex.com" : "");
  const [password, setPassword] = useState(isDemo ? "demo123" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), password);
      if (ok) {
        const user = email.toLowerCase().includes("john.smith") || email.toLowerCase().includes("emily")
          ? "customer"
          : "staff";
        router.push(user === "customer" ? "/portal" : "/dashboard");
      } else {
        setError("Invalid email or password. Try the demo accounts below.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-sky-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Logo className="justify-center" size="lg" />
          </Link>
          <p className="mt-3 text-slate-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-slate-900"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-slate-900"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition shadow-sm"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Demo accounts (password: demo123)
            </p>
            <div className="space-y-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEmail("owner@apex.com");
                  setPassword("demo123");
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition flex justify-between"
              >
                <span className="font-medium text-slate-800">Marcus Rivera</span>
                <span className="text-slate-500">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("mike@apex.com");
                  setPassword("demo123");
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition flex justify-between"
              >
                <span className="font-medium text-slate-800">Mike Torres</span>
                <span className="text-slate-500">Technician</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("john.smith@email.com");
                  setPassword("demo123");
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition flex justify-between"
              >
                <span className="font-medium text-slate-800">John Smith</span>
                <span className="text-slate-500">Customer</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/" className="hover:text-sky-600">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
