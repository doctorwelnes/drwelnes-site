import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Check if user has admin access
 * - If ADMIN_BYPASS=true OR NODE_ENV=development: always returns true (local development)
 * - Otherwise: checks if user is authenticated and has role="ADMIN"
 */
export async function checkAdmin(): Promise<boolean> {
  // Bypass mode for local development (env variable or development mode)
  if (process.env.ADMIN_BYPASS === "true" || process.env.NODE_ENV === "development") {
    return true;
  }

  // Production mode: check session
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

/**
 * Middleware response for unauthorized admin access
 */
export function adminUnauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized - Admin access required" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
