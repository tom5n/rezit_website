import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Dočasně zakázáno kvůli problémům s deployem
  return NextResponse.next()
}

export const config = {
  matcher: []
}
