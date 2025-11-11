import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // Delete ALL Supabase cookies to prevent HTTP 431 error
  const allCookies = request.cookies.getAll()
  allCookies.forEach(cookie => {
    // Remove all supabase-related cookies
    if (cookie.name.includes('sb') || cookie.name.includes('supabase') || cookie.name.includes('auth')) {
      response.cookies.delete(cookie.name)
      // Also set max-age to 0 to force deletion
      response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' })
    }
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
