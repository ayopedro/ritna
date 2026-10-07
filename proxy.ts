import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/session';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  if (await requireAdmin(request)) return NextResponse.redirect(new URL('/admin/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: '/admin/:path*' };
