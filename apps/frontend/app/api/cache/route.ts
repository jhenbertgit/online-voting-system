import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    // Required fields: key, value, ttlSeconds
    const { key, value, ttlSeconds } = body;
    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid key" },
        { status: 400 }
      );
    }
    if (typeof value === "undefined") {
      return NextResponse.json({ error: "Missing value" }, { status: 400 });
    }
    if (ttlSeconds !== undefined && typeof ttlSeconds !== "number") {
      return NextResponse.json(
        { error: "ttlSeconds must be a number if provided" },
        { status: 400 }
      );
    }
    const { getToken } = await auth();
    const token = await getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const res = await fetch(`${backendUrl}/api/v1/cache`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(body),
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
