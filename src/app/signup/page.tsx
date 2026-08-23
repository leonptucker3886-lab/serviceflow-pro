"use client";

import { useState, useTransition } from "react";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-sky-50 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><Logo className="justify-center" size="lg" /></Link>
          <p className="mt-3 text-slate-600">Create your company account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your name</label>
              <input name="name" required minLength={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label>
              <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input name="password" type="password" required minLength={6} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company name</label>
              <input name="companyName" required minLength={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
              <input name="phone" type="tel" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
            <button type="submit" disabled={pending}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold">
              {pending ? "Creating account…" : "Create company & continue"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link href="/login" className="text-sky-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
