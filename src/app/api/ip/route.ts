import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Try to get the IP from x-forwarded-for or x-real-ip headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || null;
  return NextResponse.json({ ip });
} 