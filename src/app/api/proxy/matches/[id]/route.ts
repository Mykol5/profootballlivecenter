// src/app/api/proxy/matches/[id]/route.ts
// src/app/api/proxy/matches/[id]/route.ts
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    // Await the params to handle both Promise and plain object
    const { id } = await params;
    
    const response = await fetch(`https://profootball.srv883830.hstgr.cloud/api/matches/${id}`, {
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}






// import { NextResponse } from 'next/server';

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const response = await fetch(`https://profootball.srv883830.hstgr.cloud/api/matches/${params.id}`, {
//       cache: 'no-store',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
    
//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Proxy error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch match details' },
//       { status: 500 }
//     );
//   }
// }