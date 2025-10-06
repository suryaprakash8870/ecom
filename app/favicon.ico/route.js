import { NextResponse } from 'next/server';

export async function GET() {
  // Return 200 with empty icon to avoid build/runtime issues on some platforms
  return new NextResponse('', {
    status: 200,
    headers: { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' }
  });
}


