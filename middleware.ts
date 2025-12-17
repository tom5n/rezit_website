import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Zkontrolovat, jestli je uživatel na admin stránce (kromě admin-login)
  if (request.nextUrl.pathname === '/admin') {
    // Pro admin stránku zkontrolovat cookie
    const adminLoggedIn = request.cookies.get('adminLoggedIn')?.value
    
    if (!adminLoggedIn) {
      // Přesměrovat na login stránku
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin']
}
