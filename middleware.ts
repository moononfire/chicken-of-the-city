import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-client-slug', payload.clientSlug);
  return response;
}

export const config = {
  matcher: '/admin/dashboard/:path*',
};
