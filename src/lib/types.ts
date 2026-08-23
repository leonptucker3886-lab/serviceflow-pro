export type Role = "owner" | "admin" | "technician" | "customer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string;
  avatar?: string;
  password: string; // for demo only
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  phone: string;
  email: string;
  address: string;
}

export type JobStatus = "estimate" | "scheduled" | "in_progress" | "completed" | "sold" | "invoiced" | "paid" | "cancelled";

export interface JobFile {
  id: string;
  name: string;
  url: string; // data URL or path
  isPrivate: boolean;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Job {
  id: string;
  companyId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  description: string;
  status: JobStatus;
  assignedTo?: string; // user id
  assignedName?: string;
  estimateAmount?: number;
  invoiceAmount?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  completedAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
  address: string;
  notes: string; // public notes
  privateNotes: string; // company only
  files: JobFile[];
  timeSpentMinutes?: number;
  soldBy?: string; // user id who closed the sale
}

export interface Review {
  id: string;
  companyId: string;
  jobId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  requestedAt?: string;
  status: "pending" | "submitted" | "published";
}

export interface Invoice {
  id: string;
  jobId: string;
  companyId: string;
  customerId: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  lineItems: { description: string; amount: number }[];
}

export interface DashboardMetrics {
  totalSalesToday: number;
  totalSalesWeek: number;
  totalSalesMonth: number;
  jobsSoldToday: number;
  jobsSoldWeek: number;
  jobsSoldMonth: number;
  avgCompletionMinutes: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  salesAmount: number;
  jobsSold: number;
  avgTimeMinutes: number;
}
