import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// This assumes you have an API route handler in Next.js 13+ (app directory)
// and a backend endpoint to POST/GET ballot cache (proxy to backend)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    // Mock userId if not present
    const userId = body.userId || "mock-user-123";
    const bodyWithUserId = { ...body, userId };
    // You may want to validate required fields here, e.g. ballotId, value
    // const { ballotId, value } = bodyWithUserId;
    // if (!ballotId || typeof ballotId !== "string") {
    //   return NextResponse.json({ error: "Missing or invalid ballotId" }, { status: 400 });
    // }
    const { getToken } = await auth();
    const token = getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/ballot/cache`, {
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
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Accept either ?userId=... or ?key=... for compatibility
    const userId = searchParams.get("userId") || searchParams.get("key");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }
    const { getToken } = await auth();
    const token = await getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    // Forward as userId to backend
    const res = await fetch(
      `${backendUrl}/api/v1/ballot/cache?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      }
    );
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
