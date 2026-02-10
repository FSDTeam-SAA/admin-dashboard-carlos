import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import type { JWT } from 'next-auth/jwt';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 30 * 1000;
const DEFAULT_ACCESS_TOKEN_TTL_MS = 10 * 60 * 1000;

type AuthUser = {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  role: string;
  image?: string;
};

let refreshPromise: Promise<JWT> | null = null;

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function getAccessTokenExpires(accessToken?: string): number | null {
  if (!accessToken) return null;
  try {
    const payloadSegment = accessToken.split('.')[1];
    if (!payloadSegment) return null;
    const payload = JSON.parse(base64UrlDecode(payloadSegment));
    if (typeof payload?.exp === 'number') {
      return payload.exp * 1000;
    }
  } catch {
    return null;
  }
  return null;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/reset-refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    );

    const newAccessToken = response.data?.newAccessToken;
    const newRefreshToken = response.data?.newRefreshToken ?? token.refreshToken;

    if (!newAccessToken) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const accessTokenExpires =
      getAccessTokenExpires(newAccessToken) ?? Date.now() + DEFAULT_ACCESS_TOKEN_TTL_MS;

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires,
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data.success && response.data.data) {
            return {
              id: response.data.data._id,
              email: response.data.data.user.email,
              name: response.data.data.user.name,
              accessToken: response.data.data.accessToken,
              refreshToken: response.data.data.refreshToken,
              role: response.data.data.role,
              image: response.data.data.user.avatar?.url || '',
            } satisfies AuthUser;
          }
          return null;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.id = authUser.id;
        token.accessToken = authUser.accessToken;
        token.refreshToken = authUser.refreshToken;
        token.role = authUser.role;
        token.error = undefined;
        token.accessTokenExpires =
          getAccessTokenExpires(authUser.accessToken) ?? Date.now() + DEFAULT_ACCESS_TOKEN_TTL_MS;
        return token;
      }

      if (token.accessToken && !token.accessTokenExpires) {
        const derivedExpiry = getAccessTokenExpires(token.accessToken);
        token.accessTokenExpires = derivedExpiry ?? Date.now() + DEFAULT_ACCESS_TOKEN_TTL_MS;
      }

      const expiresAt = token.accessTokenExpires as number | undefined;
      if (expiresAt && Date.now() < expiresAt - ACCESS_TOKEN_EXPIRY_BUFFER_MS) {
        return token;
      }

      if (token.error === 'RefreshAccessTokenError') {
        return token;
      }

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(token).finally(() => {
          refreshPromise = null;
        });
      }

      return refreshPromise;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as 'RefreshAccessTokenError' | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
