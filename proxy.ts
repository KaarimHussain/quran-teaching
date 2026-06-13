import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, COOKIE_NAME } from "@/lib/session";
import { roleToBasePath, pathPrefixToRole } from "@/lib/roles";

const protectedPrefixes = ["/admin", "/teacher", "/student", "/parent"];
const authPages = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const session = await decrypt(cookie);

  const matchedPrefix = protectedPrefixes.find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (matchedPrefix && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (authPages.includes(pathname) && session?.userId) {
    return NextResponse.redirect(new URL(roleToBasePath[session.role], req.url));
  }

  if (matchedPrefix && session?.userId && session.role !== pathPrefixToRole[matchedPrefix]) {
    return NextResponse.redirect(new URL(roleToBasePath[session.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/login",
    "/register",
  ],
};
