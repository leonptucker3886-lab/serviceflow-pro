import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "ServiceFlow – Estimates, Invoices, Scheduling & Reviews for Service Businesses",
  description:
    "Affordable all-in-one platform for small service businesses. Estimates, invoicing, lightweight scheduling, reviews, customer portal, and sales leaderboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
