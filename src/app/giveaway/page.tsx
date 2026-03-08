import React from 'react';
import { prisma } from '@/lib/prisma';
import GiveawayClient from './GiveawayClient';

export const dynamic = 'force-dynamic';

export default async function GiveawayPage() {
    // Φόρτωση όλων των τουρνουά (ता events) με τους εγγεγραμμένους παίκτες (checkins)
    const events = await prisma.event.findMany({
        orderBy: { date: 'desc' },
        include: {
            transactions: {
                where: { type: 'checkin' },
                include: { player: true }
            },
            giveawayWins: {
                include: { player: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    // Formatting δεδομένων για να είναι serializable και συμβατά με Client Components
    const eventsData = events.map(e => ({
        id: e.id,
        name: e.name,
        date: e.date.toISOString(),
        isActive: e.isActive,
        players: e.transactions.map(t => ({
            id: t.player.id,
            firstName: t.player.firstName,
            lastName: t.player.lastName,
            pokemonId: t.player.pokemonId,
        })),
        giveawayWins: e.giveawayWins.map(gw => ({
            id: gw.id,
            playerId: gw.player.id,
            firstName: gw.player.firstName,
            lastName: gw.player.lastName,
            createdAt: gw.createdAt.toISOString()
        }))
    }));

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-900 overflow-hidden flex flex-col">
            <div className="max-w-4xl mx-auto w-full px-4 py-12 flex-grow flex flex-col">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-sm mb-4">
                        Random Giveaway
                    </h1>
                    <p className="text-slate-400 text-lg">Επιλέξτε τουρνουά και βρείτε τον τυχερό νικητή!</p>
                </div>

                <GiveawayClient events={eventsData} />
            </div>

            {/* Background Decorations */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-600/20 blur-[150px] pointer-events-none -z-10" />
        </div>
    );
}
