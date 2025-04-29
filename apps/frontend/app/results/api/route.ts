import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    // Example required fields: electionId, userId
    const { electionId, userId } = body;
    if (!electionId || typeof electionId !== "string") {
      return NextResponse.json({ error: "Missing or invalid electionId" }, { status: 400 });
    }
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
    }
    // TODO: Implement your business logic or proxy to backend here
    // For now, just echo the input as a success example
    return NextResponse.json({ status: "ok", data: body }, { status: 200 });
  } catch (err: any) {
    // Handle malformed JSON
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }
    // Unexpected errors
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}