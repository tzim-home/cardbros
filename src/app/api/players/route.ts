import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        let whereClause = {};
        if (query) {
            const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);
            if (terms.length > 0) {
                // If they type multiple words (e.g. "Giannis Pap"), match both
                whereClause = {
                    AND: terms.map(term => ({
                        OR: [
                            { firstName: { contains: term, mode: 'insensitive' } },
                            { lastName: { contains: term, mode: 'insensitive' } },
                            { pokemonId: { contains: term, mode: 'insensitive' } },
                        ]
                    }))
                };
            }
        }

        const players = await (prisma.player as any).findMany({
            where: whereClause,
            orderBy: { lastName: 'asc' },
            take: 20
        });
        // Serialize Decimals for JSON
        const serializedPlayers = players.map((p: any) => ({
            ...p,
            totalCredits: p.totalCredits ? p.totalCredits.toNumber() : 0,
        }));
        return NextResponse.json(serializedPlayers);
    } catch (error) {
        console.error('API Players GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const player = await (prisma.player as any).create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                pokemonId: data.pokemonId,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                ageCategory: data.ageCategory || 'Master',
                totalPoints: 0,
                totalCredits: 0,
            }
        });
        return NextResponse.json(player);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }
}
