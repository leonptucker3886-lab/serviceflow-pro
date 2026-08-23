import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const raw = process.env.DATABASE_URL || "file:./dev.db";
  // Resolve relative file: URLs to absolute paths for libsql
  let url = raw;
  if (raw.startsWith("file:")) {
    const p = raw.replace(/^file:/, "");
    url = `file:${path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)}`;
  }
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
