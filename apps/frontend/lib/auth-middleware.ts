import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Type for allowed roles. Extend as needed.
 */
export type AllowedRole = "admin" | "voter" | "election_officer";

/**
 * Wraps a Next.js API handler with Clerk authentication and optional role guard.
 * @param handler The API route handler to wrap
 * @param allowedRoles Optional array of roles allowed to access the endpoint
 */
export function withAuth<
  Req extends NextRequest = NextRequest,
  Res = NextResponse,
>(
  handler: (
    req: Req,
    user: { userId: string; role: AllowedRole; token: string }
  ) => Promise<Res>,
  allowedRoles?: AllowedRole[]
) {
  return async function (req: Req): Promise<Res> {
    const { getToken, sessionClaims, userId } = await auth();
    const token = await getToken();
    // Clerk default role logic: fallback to 'voter' if not present
    const role = (sessionClaims?.role as AllowedRole) || "voter";
    if (!token || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ) as Res;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 }) as Res;
    }
    return handler(req, { userId, role, token });
  };
}
