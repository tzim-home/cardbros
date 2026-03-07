import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const user = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (!user || user.passwordHash !== password) {
            return NextResponse.json(
                { message: 'Λανθασμένο όνομα χρήστη ή κωδικός' },
                { status: 401 }
            );
        }

        // Για απλότητα χρησιμοποιούμε ένα απλό cookie 'auth_session'
        const response = NextResponse.json({ success: true });

        // ΣΗΜΕΙΩΣΗ: Σε κανονική εφαρμογή θα χρησιμοποιούσαμε JWT ή κάποιο session store
        (await cookies()).set('auth_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 μέρα
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { message: 'Σφάλμα διακομιστή' },
            { status: 500 }
        );
    }
}
