import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id && (trigger === "signIn" || trigger === "signUp" || !token.companyId)) {
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
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.customerId = token.customerId as string | undefined;
        session.user.companyName = token.companyName as string | undefined;
        session.user.companySlug = token.companySlug as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
