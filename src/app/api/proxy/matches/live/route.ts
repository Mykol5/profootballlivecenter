// src/app/api/proxy/matches/live/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://profootball.srv883830.hstgr.cloud/api/matches/live', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live matches' },
      { status: 500 }
    );
  }
}