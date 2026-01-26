import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
    const token = (request as any).nextauth?.token;

    // Redirect to login if not authenticated
    if (!token && !request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if already logged in and trying to access login
    if (token && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true;
        }
        // Require token for other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
