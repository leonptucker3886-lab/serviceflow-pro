import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const staffPaths = [
  "/dashboard",
  "/jobs",
  "/schedule",
  "/invoices",
  "/reviews",
  "/leaderboard",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token?.id;
  const role = token?.role as string | undefined;

  const isStaffRoute = staffPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isPortal = pathname === "/portal" || pathname.startsWith("/portal/");

  if (isStaffRoute && !isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isStaffRoute && role === "customer") {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  if (isPortal && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    if (role === "customer") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/schedule/:path*",
    "/invoices/:path*",
    "/reviews/:path*",
    "/leaderboard/:path*",
    "/portal/:path*",
    "/login",
    "/signup",
  ],
};
