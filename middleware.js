import { NextResponse } from "next/server";

export function middleware(request) {
  // No language redirection needed - allow direct access to routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    "/((?!api|assets|docs|.*\\..*|_next).*)",
    // Optional: only run on root (/) URL
  ],
};
