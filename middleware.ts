import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/invite");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedClientRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/workouts") ||
    pathname.startsWith("/measurements");

  if (isAuthRoute) {
    if (token) {
      const role = (token as any).role;
      const url = req.nextUrl.clone();
      url.pathname = role === "ADMIN" ? "/admin/invites" : "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAdminRoute || isProtectedClientRoute) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (isAdminRoute) {
      const role = (token as any).role;
      if (role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/workouts/:path*", "/measurements/:path*", "/login", "/invite"],
};
