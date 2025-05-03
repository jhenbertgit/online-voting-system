import { NextRequest, NextResponse } from "next/server";

/**
 * API route to get the count of users with the 'voter' role from Clerk.
 * Returns: { count: number }
 * Requires CLERK_SECRET_KEY in environment variables.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  if (!CLERK_SECRET_KEY) {
    return NextResponse.json(
      { error: "Clerk secret key not set" },
      { status: 500 }
    );
  }

  // Clerk API endpoint for listing users
  const endpoint = "https://api.clerk.com/v1/users";
  let totalVoters = 0;
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const res = await fetch(`${endpoint}?page=${page}&limit=100`, {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch users from Clerk" },
          { status: 500 }
        );
      }
      const data = await res.json();
      // Default role is 'voter' unless otherwise specified
      const voters = (data.data || []).filter(
        (user: any) => (user.public_metadata?.role || "voter") === "voter"
      );
      totalVoters += voters.length;
      hasMore = Boolean(data.has_more);
      page += 1;
    }
    return NextResponse.json({ count: totalVoters });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error fetching voter count",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
