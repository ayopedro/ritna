import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Replace this with your actual authentication logic
    if (email === 'admin@example.com' && password === 'password') {
      return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new NextResponse(JSON.stringify({ success: false }), { status: 401 });
    }
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error?.message }),
      { status: 500 },
    );
  }
}
