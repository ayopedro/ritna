import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export function requireAdmin(request: Request) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    return NextResponse.json({ success: false, message: 'Admin access is not configured.' }, { status: 503 });
  }
  const received = request.headers.get('authorization')?.match(/^Basic\s+(.+)$/i)?.[1] ?? '';
  const expected = Buffer.from(`${username}:${password}`).toString('base64');
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(hash(received), hash(expected))) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="RITNA Admin"', 'Cache-Control': 'no-store' },
    });
  }
  return null;
}

export function validAdminOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin;
}
