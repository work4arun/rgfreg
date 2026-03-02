import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

const protectedRoutes = ['/admin', '/counter'];

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    if (isProtectedRoute) {
        const session = req.cookies.get('session')?.value;
        const payload = await decrypt(session);

        if (!payload?.id) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }

        if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/counter', req.url));
        }

        if (path.startsWith('/counter') && payload.role !== 'COUNTER' && payload.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
