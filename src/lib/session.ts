import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireStaff() {
  const session = await requireAuth();
  if (!session.user.companyId || session.user.role === "customer") {
    redirect("/portal");
  }
  return session;
}

export async function requireCustomer() {
  const session = await requireAuth();
  if (session.user.role !== "customer") {
    redirect("/dashboard");
  }
  return session;
}
