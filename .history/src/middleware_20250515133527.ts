import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPath = request.nextUrl.pathname === "/admin/login";
  const isAdminRootPath = request.nextUrl.pathname === "/admin";

  // Nếu đang ở trang admin login và đã đăng nhập, chuyển đến trang chủ admin
  if (isAdminLoginPath && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Nếu đang ở trang admin root và đã đăng nhập, chuyển đến dashboard
  if (isAdminRootPath && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Nếu đang ở trang admin và chưa đăng nhập, chuyển đến trang admin login
  if (isAdminPath && !isAdminLoginPath && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'vi'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|en)/:path*']
}; 