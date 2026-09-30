import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/basic';

export function proxy(request: NextRequest) {
  return requireAdmin(request) ?? NextResponse.next();
}

export const config = { matcher: '/admin/:path*' };
