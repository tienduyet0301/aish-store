import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

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

  // Get the response
  const response = NextResponse.next();

  // Add security headers
  const headers = response.headers;

  // Strict-Transport-Security (HSTS)
  // Bắt buộc trình duyệt sử dụng HTTPS
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // X-Content-Type-Options
  // Ngăn chặn MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Ngăn chặn clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  // Bảo vệ khỏi XSS attacks
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  // Kiểm soát thông tin referrer
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  // Kiểm soát các tính năng trình duyệt
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content-Security-Policy (CSP)
  // Kiểm soát nguồn tài nguyên được tải
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
}; 