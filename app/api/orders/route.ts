import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log('🪄 ~ GET ~ request:', request.nextUrl)
  console.log('Orders API called');
  return Response.json({ message: 'Hello Orders!' });
}