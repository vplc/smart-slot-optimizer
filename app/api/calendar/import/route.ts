import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("text")) {
    return NextResponse.json(
      { error: "Expected text/ics payload" },
      { status: 400 },
    );
  }

  const ics = await request.text();
  console.info("[calendar] received ICS payload", ics.slice(0, 120));

  return NextResponse.json({ status: "queued", message: "Import will run asynchronously" });
}

export function GET() {
  return NextResponse.json({
    instructions: "POST an ICS file body to import appointments.",
  });
}
