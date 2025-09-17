import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Google OAuth returned an error", error);
    return NextResponse.redirect(new URL("/connect?error=oauth", request.url));
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  console.info("Received Google OAuth code", code);
  // TODO: exchange code for tokens and persist to Supabase.

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
