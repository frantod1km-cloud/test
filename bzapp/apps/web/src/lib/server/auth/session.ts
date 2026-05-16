import { cookies } from 'next/headers';
import { verifyAccessToken } from './jwt';
import type { JwtPayload } from '@bzapp/types';

const ACCESS_TOKEN_COOKIE = 'bzapp_at';
const REFRESH_TOKEN_COOKIE = 'bzapp_rt';

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies() as any; // Next.js 15 cookies() is async in middleware but sync in route handlers
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token — short lived
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 min
  });

  // Refresh token — long lived
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/auth/refresh',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies() as any;
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export function getRefreshTokenFromCookie(): string | null {
  const cookieStore = cookies() as any;
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
