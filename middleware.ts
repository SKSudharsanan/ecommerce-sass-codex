import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const adminOnlyPaths = ['/dashboard', '/management', '/admin'];
const customerOnlyPaths = ['/storefront', '/orders'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAdmin = adminOnlyPaths.some((path) => pathname.startsWith(path));
  const needsCustomer = customerOnlyPaths.some((path) => pathname.startsWith(path));

  if (!needsAdmin && !needsCustomer) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const userRole = (session.user.role as string | undefined) ?? 'customer';

  if (needsAdmin && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (needsCustomer && userRole !== 'customer') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/management/:path*', '/admin/:path*', '/storefront/:path*', '/orders/:path*']
};
