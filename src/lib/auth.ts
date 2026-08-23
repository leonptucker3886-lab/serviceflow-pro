import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Attach primary membership on every request
      if (token.id) {
        const membership = await prisma.membership.findFirst({
          where: { userId: token.id as string },
          include: { company: true },
          orderBy: { createdAt: "asc" },
        });
        if (membership) {
          token.companyId = membership.companyId;
          token.role = membership.role;
          token.companyName = membership.company.name;
          token.companySlug = membership.company.slug;
        } else {
          // Check if customer portal user
          const customer = await prisma.customer.findFirst({
            where: { userId: token.id as string },
            include: { company: true },
          });
          if (customer) {
            token.companyId = customer.companyId;
            token.role = "customer";
            token.customerId = customer.id;
            token.companyName = customer.company.name;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).companyId = token.companyId;
        (session.user as any).role = token.role;
        (session.user as any).customerId = token.customerId;
        (session.user as any).companyName = token.companyName;
        (session.user as any).companySlug = token.companySlug;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
