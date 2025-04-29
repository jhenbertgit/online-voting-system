import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const body = await req.text();
    const res = await fetch(`${backendUrl}/positions`, {
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
}

export async function GET(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/positions`, {
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
}
