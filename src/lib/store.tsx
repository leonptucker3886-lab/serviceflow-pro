"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Company, User, Job, Review, Invoice, JobStatus, LeaderboardEntry } from "./types";
import { DEMO_COMPANY, DEMO_USERS, DEMO_JOBS, DEMO_REVIEWS, DEMO_INVOICES } from "./seed";

interface AppState {
  company: Company;
  users: User[];
  jobs: Job[];
  reviews: Review[];
  invoices: Invoice[];
  currentUser: User | null;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateJobStatus: (jobId: string, status: JobStatus, extra?: Partial<Job>) => void;
  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt" | "files">) => void;
  updateJob: (jobId: string, data: Partial<Job>) => void;
  requestReview: (jobId: string) => void;
  submitReview: (reviewId: string, rating: number, comment: string) => void;
  markInvoicePaid: (invoiceId: string) => void;
  getLeaderboard: (period: "daily" | "weekly" | "monthly") => LeaderboardEntry[];
  getMetrics: () => {
    totalSalesToday: number;
    totalSalesWeek: number;
    totalSalesMonth: number;
    jobsSoldToday: number;
    jobsSoldWeek: number;
    jobsSoldMonth: number;
    avgCompletionMinutes: number;
  };
  isAuthenticated: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "serviceflow_demo_v1";

function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      company: DEMO_COMPANY,
      users: DEMO_USERS,
      jobs: DEMO_JOBS,
      reviews: DEMO_REVIEWS,
      invoices: DEMO_INVOICES,
      currentUser: null,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        company: parsed.company || DEMO_COMPANY,
        users: parsed.users || DEMO_USERS,
        jobs: parsed.jobs || DEMO_JOBS,
        reviews: parsed.reviews || DEMO_REVIEWS,
        invoices: parsed.invoices || DEMO_INVOICES,
        currentUser: parsed.currentUser || null,
      };
    }
  } catch {}
  return {
    company: DEMO_COMPANY,
    users: DEMO_USERS,
    jobs: DEMO_JOBS,
    reviews: DEMO_REVIEWS,
    invoices: DEMO_INVOICES,
    currentUser: null,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated]);

  const login = useCallback((email: string, password: string) => {
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      setState((s) => ({ ...s, currentUser: user }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUser: null }));
  }, []);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus, extra: Partial<Job> = {}) => {
    setState((s) => {
      const jobs = s.jobs.map((j) => {
        if (j.id !== jobId) return j;
        const updated: Job = {
          ...j,
          status,
          updatedAt: new Date().toISOString(),
          ...extra,
        };
        if (status === "sold" && !updated.soldAt) {
          updated.soldAt = new Date().toISOString();
          updated.soldBy = s.currentUser?.id;
        }
        if (status === "completed" && !updated.completedAt) {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      });
      return { ...s, jobs };
    });
  }, []);

  const addJob = useCallback((jobData: Omit<Job, "id" | "createdAt" | "updatedAt" | "files">) => {
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
    };
    setState((s) => ({ ...s, jobs: [newJob, ...s.jobs] }));
  }, []);

  const updateJob = useCallback((jobId: string, data: Partial<Job>) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) =>
        j.id === jobId ? { ...j, ...data, updatedAt: new Date().toISOString() } : j
      ),
    }));
  }, []);

  const requestReview = useCallback((jobId: string) => {
    setState((s) => {
      const job = s.jobs.find((j) => j.id === jobId);
      if (!job) return s;
      const existing = s.reviews.find((r) => r.jobId === jobId && r.status === "pending");
      if (existing) return s;
      const review: Review = {
        id: `rev_${Date.now()}`,
        companyId: s.company.id,
        jobId,
        customerName: job.customerName,
        rating: 0,
        comment: "",
        createdAt: new Date().toISOString(),
        requestedAt: new Date().toISOString(),
        status: "pending",
      };
      return { ...s, reviews: [review, ...s.reviews] };
    });
  }, []);

  const submitReview = useCallback((reviewId: string, rating: number, comment: string) => {
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) =>
        r.id === reviewId
          ? { ...r, rating, comment, status: "published" as const, createdAt: new Date().toISOString() }
          : r
      ),
    }));
  }, []);

  const markInvoicePaid = useCallback((invoiceId: string) => {
    setState((s) => ({
      ...s,
      invoices: s.invoices.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "paid" as const, paidAt: new Date().toISOString() }
          : inv
      ),
      jobs: s.jobs.map((j) => {
        const inv = s.invoices.find((i) => i.id === invoiceId);
        if (inv && j.id === inv.jobId) {
          return { ...j, status: "paid" as const, updatedAt: new Date().toISOString() };
        }
        return j;
      }),
    }));
  }, []);

  const getLeaderboard = useCallback(
    (period: "daily" | "weekly" | "monthly"): LeaderboardEntry[] => {
      const now = new Date();
      let start: Date;
      if (period === "daily") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === "weekly") {
        start = new Date(now.getTime() - 7 * 86400000);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const staff = state.users.filter((u) => u.role !== "customer");
      const entries: LeaderboardEntry[] = staff.map((u) => {
        const relevantJobs = state.jobs.filter(
          (j) =>
            j.soldBy === u.id &&
            j.soldAt &&
            new Date(j.soldAt) >= start &&
            (j.status === "sold" || j.status === "invoiced" || j.status === "paid" || j.status === "completed")
        );
        const salesAmount = relevantJobs.reduce((sum, j) => sum + (j.invoiceAmount || j.estimateAmount || 0), 0);
        const jobsSold = relevantJobs.length;
        const times = relevantJobs.filter((j) => j.timeSpentMinutes).map((j) => j.timeSpentMinutes!);
        const avgTimeMinutes = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
        return { userId: u.id, name: u.name, salesAmount, jobsSold, avgTimeMinutes };
      });
      return entries.sort((a, b) => b.salesAmount - a.salesAmount);
    },
    [state.jobs, state.users]
  );

  const getMetrics = useCallback(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(now.getTime() - 7 * 86400000);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const soldJobs = state.jobs.filter(
      (j) => j.soldAt && (j.status === "sold" || j.status === "invoiced" || j.status === "paid" || j.status === "completed")
    );

    const sum = (jobs: Job[]) => jobs.reduce((s, j) => s + (j.invoiceAmount || j.estimateAmount || 0), 0);

    const todayJobs = soldJobs.filter((j) => j.soldAt && new Date(j.soldAt) >= startToday);
    const weekJobs = soldJobs.filter((j) => j.soldAt && new Date(j.soldAt) >= startWeek);
    const monthJobs = soldJobs.filter((j) => j.soldAt && new Date(j.soldAt) >= startMonth);

    const times = soldJobs.filter((j) => j.timeSpentMinutes).map((j) => j.timeSpentMinutes!);
    const avgCompletionMinutes = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return {
      totalSalesToday: sum(todayJobs),
      totalSalesWeek: sum(weekJobs),
      totalSalesMonth: sum(monthJobs),
      jobsSoldToday: todayJobs.length,
      jobsSoldWeek: weekJobs.length,
      jobsSoldMonth: monthJobs.length,
      avgCompletionMinutes,
    };
  }, [state.jobs]);

  const value: AppContextType = {
    ...state,
    login,
    logout,
    updateJobStatus,
    addJob,
    updateJob,
    requestReview,
    submitReview,
    markInvoicePaid,
    getLeaderboard,
    getMetrics,
    isAuthenticated: !!state.currentUser,
    isStaff: !!state.currentUser && state.currentUser.role !== "customer",
    isCustomer: !!state.currentUser && state.currentUser.role === "customer",
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">Loading ServiceFlow…</div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
