import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { getApiUrl } from "@/lib/api";

export const POST = withAuth(async (req, { token }) => {
  try {
    // Parse and validate the request body
    const body = await req.json();
    console.log("[CACHE][POST] Parsed body:", body);
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
    const res = await fetch(getApiUrl("/cache"), {
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
      console.log("[CACHE][POST] Backend response:", data);
    } catch (e) {
      data = { error: "Invalid response from backend" };
      console.error("[CACHE][POST] Failed to parse backend response", e);
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

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("[CACHE][POST] Error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
