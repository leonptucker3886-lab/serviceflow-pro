"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updatePortalBrandingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId || session.user.role === "customer") {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim() || null;
  const primaryColor = String(formData.get("primaryColor") || "#0ea5e9");
  const secondaryColor = String(formData.get("secondaryColor") || "#0f172a");
  const accentColor = String(formData.get("accentColor") || "#22c55e");
  const portalWelcome = String(formData.get("portalWelcome") || "").trim() || null;
  const supportPhone = String(formData.get("supportPhone") || "").trim() || null;
  const supportEmail = String(formData.get("supportEmail") || "").trim() || null;
  const portalDomain = String(formData.get("portalDomain") || "").trim() || null;
  const showPoweredBy = formData.get("showPoweredBy") === "on";

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: {
      name: name || undefined,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      portalWelcome,
      supportPhone,
      supportEmail,
      portalDomain,
      showPoweredBy,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/dashboard/portal-branding");
  redirect("/dashboard/portal-branding?saved=1");
}
