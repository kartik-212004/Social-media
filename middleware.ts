import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const isAuthPage =
    req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup";

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token && !isAuthPage) {
    const signinUrl = new URL("/signin", req.url);
    signinUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
