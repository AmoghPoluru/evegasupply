import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config });
  
  // Get cookies from request
  const cookies = request.cookies.getAll();
  
  // Try to get user from auth
  let authUser = null;
  try {
    const expressReq = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        host: request.headers.get('host') || '',
      },
    } as any;
    
    const { user } = await payload.auth({ headers: expressReq.headers as any });
    authUser = user;
  } catch (error) {
    console.error('Auth error:', error);
  }
  
  return NextResponse.json({
    cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
    cookieHeader: request.headers.get('cookie'),
    authUser: authUser ? {
      id: authUser.id,
      email: authUser.email,
    } : null,
    allHeaders: Object.fromEntries(request.headers.entries()),
  });
}
