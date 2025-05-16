import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPath = request.nextUrl.pathname === "/admin/login";

  // Nếu đang ở trang admin login và đã đăng nhập, chuyển đến trang chủ admin
  if (isAdminLoginPath && token) {
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