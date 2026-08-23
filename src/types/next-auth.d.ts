import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId?: string;
      role?: string;
      customerId?: string;
      companyName?: string;
      companySlug?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    companyId?: string;
    role?: string;
    customerId?: string;
    companyName?: string;
    companySlug?: string;
  }
}
