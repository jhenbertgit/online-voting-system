import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { key: string } }
) {
  try {
    const { key } = await context.params;
    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid key parameter" },
        { status: 400 }
      );
    }
    const { getToken } = await auth();
    const token = await getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const res = await fetch(
      `${backendUrl}/api/v1/cache/${encodeURIComponent(key)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export async function DELETE(
  req: NextRequest,
  context: { params: { key: string } }
) {
  try {
    const { key } = await context.params;
    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid key parameter" },
        { status: 400 }
      );
    }
    const { getToken } = await auth();
    const token = await getToken();
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const res = await fetch(
      `${backendUrl}/api/v1/cache/${encodeURIComponent(key)}`,
      {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
