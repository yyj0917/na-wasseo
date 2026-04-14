import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // 이미 로그인된 유저가 /login 접근 시 /team으로 이동
  if (pathname === "/login") {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/team", request.url));
      }
    }
    return NextResponse.next();
  }

  // /admin 경로: layout.tsx에서 세션 체크 후 AdminLoginForm 또는 어드민 UI 렌더링
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // /mentor 경로: 인증 없이 접근 가능 (읽기 전용 멘토 뷰)
  if (pathname.startsWith("/mentor")) {
    return NextResponse.next();
  }

  // /team 경로: 로그인 필요
  if (pathname.startsWith("/team")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/team/:path*", "/admin/:path*", "/mentor/:path*"],
};
