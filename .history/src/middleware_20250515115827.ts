import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
})

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

  // Get the IP address of the request
  const ip = request.ip ?? '127.0.0.1'
  
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        })
      }

      // Add rate limit headers to the response
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', reset.toString())
      return response
    } catch (error) {
      // If there's an error with rate limiting, allow the request to proceed
      console.error('Rate limiting error:', error)
      return NextResponse.next()
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}; 