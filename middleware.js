import { NextResponse } from "next/server";

export function middleware(request) {
  // Check for 403 errors (access denied)
  // This is a basic example - you might want to add more specific logic
  // based on your authentication/authorization requirements
  
  // For now, we'll let the request pass through
  // You can add specific 403 handling logic here if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    "/((?!api|assets|docs|.*\\..*|_next).*)",
    // Optional: only run on root (/) URL
  ],
};
