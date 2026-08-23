"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  companyName: z.string().min(2).max(100),
  phone: z.string().optional(),
});

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "company";
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw e;
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
  });
  if (membership) {
    redirect("/dashboard");
  }
  const customer = await prisma.customer.findFirst({
    where: { userId: user.id },
  });
  if (customer) {
    redirect("/portal");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please check your details and try again." };
  }

  const { name, email, password, companyName, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let slug = slugify(companyName);
  const slugTaken = await prisma.company.findUnique({ where: { slug } });
  if (slugTaken) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash,
      memberships: {
        create: {
          role: "owner",
          company: {
            create: {
              name: companyName,
              slug,
              phone: phone || null,
              email: normalizedEmail,
              plan: "free",
              planStatus: "active",
            },
          },
        },
      },
    },
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: null, created: true };
    }
    throw e;
  }

  redirect("/dashboard");
}
