import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { getApiUrl } from "@/lib/api";

export const POST = withAuth(async (req, { token }) => {
  try {
    const body = await req.text();

    const res = await fetch(getApiUrl("/candidates"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
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
});

export const GET = withAuth(async (req, { token }) => {
  try {
    const res = await fetch(getApiUrl("/candidates"), {
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
