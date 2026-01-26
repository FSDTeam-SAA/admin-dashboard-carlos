import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
            };
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
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
        (session as any).role = token.role;
      }
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
