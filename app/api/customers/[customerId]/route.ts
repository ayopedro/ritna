import { withApi } from '@/app/lib/api/handler';
import { NextResponse } from 'next/server';

async function handleGET() {
  return NextResponse.json({ success: false, message: 'This endpoint is not implemented.' }, { status: 501 });
}

export const GET = withApi('/api/customers/[customerId]', handleGET, true);
