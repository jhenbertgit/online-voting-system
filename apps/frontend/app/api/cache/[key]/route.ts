import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AllowedRole } from "@/lib/auth-middleware";
import { getApiUrl } from "@/lib/api";

/**
 * API route for cache key operations (GET, DELETE)
 * Uses centralized withAuth middleware for Clerk authentication.
 */

export const GET = withAuth(
  async (
    req: NextRequest,
    user: { userId: string; role: AllowedRole; token: string }
  ) => {
    try {
      // Extract 'key' param from the dynamic route
      const { pathname } = new URL(req.url);
      const key = pathname.split("/").pop();
      if (!key || typeof key !== "string") {
        return NextResponse.json(
          { error: "Missing or invalid key parameter" },
          { status: 400 }
        );
      }
      const res = await fetch(getApiUrl(`/cache/${encodeURIComponent(key)}`), {
        method: "GET",
        headers: user.token ? { Authorization: `Bearer ${user.token}` } : {},
        credentials: "include",
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: "Invalid response from backend" };
      }
      if (!res.ok) {
        return NextResponse.json(
          {
            error: data?.error || "Backend error",
            message: data?.message || undefined,
          },
          { status: res.status }
        );
      }
      return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withAuth(
  async (
    req: NextRequest,
    user: { userId: string; role: AllowedRole; token: string }
  ) => {
    try {
      // Extract 'key' param from the dynamic route
      const { pathname } = new URL(req.url);
      const key = pathname.split("/").pop();
      if (!key || typeof key !== "string") {
        return NextResponse.json(
          { error: "Missing or invalid key parameter" },
          { status: 400 }
        );
      }
      const res = await fetch(getApiUrl(`/cache/${encodeURIComponent(key)}`), {
        method: "DELETE",
        headers: user.token ? { Authorization: `Bearer ${user.token}` } : {},
        credentials: "include",
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: "Invalid response from backend" };
      }
      if (!res.ok) {
        return NextResponse.json(
          {
            error: data?.error || "Backend error",
            message: data?.message || undefined,
          },
          { status: res.status }
        );
      }
      return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
