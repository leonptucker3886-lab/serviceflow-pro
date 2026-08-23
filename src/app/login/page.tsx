"use client";

import { useState, Suspense, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";
  const [email, setEmail] = useState(isDemo ? "owner@apex.com" : "");
  const [password, setPassword] = useState(isDemo ? "demo123" : "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-sky-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><Logo className="justify-center" size="lg" /></Link>
          <p className="mt-3 text-slate-600">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900" required />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
            <button type="submit" disabled={pending}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            No account? <Link href="/signup" className="text-sky-600 font-medium">Create company</Link>
          </p>
        </div>
        <div className="mt-6 bg-white/80 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Demo accounts (password: demo123)</p>
          <div className="grid gap-1 text-sm text-slate-700">
            <button type="button" onClick={() => { setEmail("owner@apex.com"); setPassword("demo123"); }} className="text-left hover:bg-sky-50 px-2 py-1 rounded">Owner · owner@apex.com</button>
            <button type="button" onClick={() => { setEmail("mike@apex.com"); setPassword("demo123"); }} className="text-left hover:bg-sky-50 px-2 py-1 rounded">Tech · mike@apex.com</button>
            <button type="button" onClick={() => { setEmail("john.smith@email.com"); setPassword("demo123"); }} className="text-left hover:bg-sky-50 px-2 py-1 rounded">Customer · john.smith@email.com</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
