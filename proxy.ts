import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new NextResponse('Admin access is not configured.', { status: 503 });
  }

  const token = request.headers.get('authorization')?.match(/^Basic\s+(.+)$/i)?.[1];
  const expected = Buffer.from(`${username}:${password}`).toString('base64');
  const receivedBytes = Buffer.from(token ?? '');
  const expectedBytes = Buffer.from(expected);

  if (
    receivedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(receivedBytes, expectedBytes)
  ) {
    return new NextResponse('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="RITNA Admin"',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.next();
}

export const config = { matcher: '/admin/:path*' };
