import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/invite");
  const isProtectedClientRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/workouts") ||
    pathname.startsWith("/measurements");

  if (isAuthRoute) {
    if (token) {
      const role = (token as any).role;
      const url = req.nextUrl.clone();
      url.pathname = role === "ADMIN" ? "/dashboard" : "/dashboard"; // Updated to redirect to dashboard
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtectedClientRoute) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workouts/:path*", "/measurements/:path*", "/login", "/invite"],
};
