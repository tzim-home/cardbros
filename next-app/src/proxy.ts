import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const authSession = request.cookies.get('auth_session');
    const { pathname } = request.nextUrl;

    // Προστασία όλων των σελίδων εκτός από το login
    if (!authSession && pathname !== '/login' && !pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Αν είναι ήδη συνδεδεμένος και πάει στο login, ανακατεύθυνση στο home
    if (authSession && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
