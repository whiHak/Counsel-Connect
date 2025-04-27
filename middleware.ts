import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/counselors', '/how-it-works']

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path === route)

  // Allow access to public routes regardless of authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verify the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // If not a public route and no session exists, redirect to home page
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check role-based access and profile completion
  const userRole = token.role as string
  const isProfileComplete = token.isProfileComplete as boolean

  console.log('Token in middleware:', token) // For debugging

  // Profile completion check for clients
  if (
    userRole === 'CLIENT' && 
    !isProfileComplete &&
    !path.startsWith('/profile/complete') &&
    (path.startsWith('/counselors') ||
     path.startsWith('/appointments') ||
     path.startsWith('/messages') ||
     path.startsWith('/profile'))
  ) {
    return NextResponse.redirect(new URL('/profile/complete', request.url))
  }

  // Counselor-only routes
  if (path.startsWith('/dashboard') && userRole !== 'COUNSELOR') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Client-only routes
  if (path.startsWith('/become-counselor') && userRole !== 'CLIENT') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If there's a valid session, allow the request to proceed
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
    '/counselors/:path*',
    '/appointments/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/become-counselor',
  ],
} 