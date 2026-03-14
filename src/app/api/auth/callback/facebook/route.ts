import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('OAuth authentication failed')}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', request.url)
    );
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/facebook`;

    // Exchange code for token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId!);
    tokenUrl.searchParams.set('client_secret', appSecret!);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Get user info from Facebook
    const userInfoUrl = new URL('https://graph.facebook.com/v18.0/me');
    userInfoUrl.searchParams.set('fields', 'id,name,email,picture');
    userInfoUrl.searchParams.set('access_token', accessToken);

    const userInfoResponse = await fetch(userInfoUrl.toString());

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const facebookUser = await userInfoResponse.json();

    if (!facebookUser.email) {
      throw new Error('Facebook account does not have an email address');
    }

    // Create or find user in Payload
    const payload = await getPayload({ config });
    
    // Check if user exists by email or oauthId
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        or: [
          { email: { equals: facebookUser.email } },
          { and: [
            { oauthProvider: { equals: 'facebook' } },
            { oauthId: { equals: facebookUser.id } }
          ]}
        ],
      },
      limit: 1,
    });

    let user;
    let tempPassword: string | undefined;
    
    if (existingUsers.docs.length > 0) {
      // For existing users, update OAuth info and set temp password
      user = await payload.update({
        collection: 'users',
        id: existingUsers.docs[0].id,
        data: {
          oauthProvider: 'facebook',
          oauthId: facebookUser.id,
          avatar: facebookUser.picture?.data?.url,
          name: facebookUser.name || existingUsers.docs[0].name,
        },
      });
      
      // Generate temp password for login
      tempPassword = crypto.randomUUID() + crypto.randomUUID();
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password: tempPassword,
        },
      });
    } else {
      // Generate a secure random password for OAuth users
      tempPassword = crypto.randomUUID() + crypto.randomUUID();
      
      // Create new user
      user = await payload.create({
        collection: 'users',
        data: {
          email: facebookUser.email,
          name: facebookUser.name || facebookUser.email.split('@')[0],
          password: tempPassword, // Temporary password for OAuth users
          oauthProvider: 'facebook',
          oauthId: facebookUser.id,
          avatar: facebookUser.picture?.data?.url,
          role: 'user',
        },
      });
    }

    // Create an Express-like request object for Payload's login
    const expressReq = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        host: request.headers.get('host') || '',
        'user-agent': request.headers.get('user-agent') || '',
      },
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
    } as any;

    // Create session using Payload's login with the temp password
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: user.email,
        password: tempPassword!,
      },
      req: expressReq,
    });

    // Get Users collection config for cookie settings
    const usersCollection = payload.collections['users'];
    const authConfig = usersCollection.config.auth || {};
    const cookiePrefix = payload.config.cookiePrefix || 'payload';
    const cookieName = `${cookiePrefix}-token`;
    
    // Get cookie settings from auth config or use defaults
    // IMPORTANT: In development, secure must be false for HTTP
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieSecure = authConfig.cookies?.secure ?? isProduction;
    const cookieSameSite = typeof authConfig.cookies?.sameSite === 'string' 
      ? authConfig.cookies.sameSite 
      : authConfig.cookies?.sameSite 
        ? 'strict' 
        : 'lax';
    const tokenExpiration = authConfig.tokenExpiration || 2592000; // 30 days default
    
    // Create redirect response
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set the session cookie exactly as Payload would
    if (loginResult.token) {
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + tokenExpiration);
      
      const cookieOptions: any = {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite as 'lax' | 'strict' | 'none',
        path: '/',
        expires: expirationDate,
      };
      
      // In development, ensure secure is false
      if (!isProduction) {
        cookieOptions.secure = false;
      }
      
      response.cookies.set(cookieName, loginResult.token, cookieOptions);
      
      console.log('OAuth login successful:', {
        tokenSet: !!loginResult.token,
        cookieName,
        cookieSecure: cookieOptions.secure,
        cookieSameSite,
        isProduction,
        expirationDate: expirationDate.toISOString(),
        tokenLength: loginResult.token.length,
      });
      
      // Also log the Set-Cookie header to verify
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('Set-Cookie header:', setCookieHeader);
    } else {
      console.error('OAuth login failed: No token returned');
    }
    
    return response;
  } catch (error: any) {
    console.error('Facebook OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`, request.url)
    );
  }
}
