import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { getApiUrl } from "@/lib/api";

// This assumes you have an API route handler in Next.js 13+ (app directory)
// and a backend endpoint to POST/GET ballot cache (proxy to backend)

export const POST = withAuth(async (req, { userId, token }) => {
  console.log("[POST /api/ballot-cache] Incoming request", req.method, req.url);

  try {
    let body;
    try {
      body = await req.json();
      console.log("[POST /api/ballot-cache] Parsed request body:", body);
    } catch (e) {
      console.error("[POST /api/ballot-cache] Error parsing request body:", e);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    // Mock userId if not present
    const bodyWithUserId = { ...body, userId };
    // You may want to validate required fields here, e.g. ballotId, value
    // const { ballotId, value } = bodyWithUserId;
    // if (!ballotId || typeof ballotId !== "string") {
    //   return NextResponse.json({ error: "Missing or invalid ballotId" }, { status: 400 });
    // }
    console.log(
      "[POST /api/ballot-cache] Forwarding to backend:",
      getApiUrl("/ballot/cache")
    );
    const res = await fetch(getApiUrl("/ballot/cache"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(bodyWithUserId),
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
    console.error("[POST /api/ballot-cache] Top-level error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (req, { token }) => {
  console.log("[GET /api/ballot-cache] Incoming request", req.method, req.url);

  try {
    const { searchParams } = new URL(req.url);
    // Accept either ?userId=... or ?key=... for compatibility
    const userId = searchParams.get("userId") || searchParams.get("key");
    console.log("[GET /api/ballot-cache] Extracted userId:", userId);
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }
    // Forward as userId to backend
    const backendUrl = getApiUrl(
      `/ballot/cache?userId=${encodeURIComponent(userId)}`
    );
    console.log("[GET /api/ballot-cache] Forwarding to backend:", backendUrl);
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
    console.error("[GET /api/ballot-cache] Top-level error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
