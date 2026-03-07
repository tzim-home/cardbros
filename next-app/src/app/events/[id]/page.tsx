import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Calendar, Users, Trophy, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import EventRegistrationClient from './EventRegistrationClient';
import EventDeleteClient from './EventDeleteClient';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) return notFound();

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            transactions: {
                where: { type: 'checkin' },
                include: { player: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!event) return notFound();

    const registeredPlayers = event.transactions.map(t => t.player);

    return (
        <div className="min-h-screen bg-slate-50">


            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 font-medium">
                        <ChevronLeft className="w-5 h-5" />
                        Πίσω στα Τουρνουά
                    </Link>
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-xl ${event.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900">{event.name}</h1>
                            </div>
                            <div className="flex items-center gap-4 text-slate-600">
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString('el-GR')}</span>
                                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {registeredPlayers.length} Συμμετοχές</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-xl font-bold border-2 ${event.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                                {event.isActive ? 'Ενεργό Τουρνουά' : 'Ολοκληρωμένο/Ανενεργό'}
                            </div>
                            <EventDeleteClient eventId={eventId} eventName={event.name} />
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    <EventRegistrationClient eventId={eventId} isActive={event.isActive} />

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Συμμετέχοντες
                        </h2>
                        {registeredPlayers.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                Δεν υπάρχουν εγγραφές ακόμα.
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {registeredPlayers.map((player, idx) => (
                                    <li key={idx} className="py-4 flex items-center justify-between hover:bg-slate-50 px-4 -mx-4 rounded-xl transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-slate-300 min-w-[1.5rem] text-right">{idx + 1}.</span>
                                            <div>
                                                <div className="font-bold text-slate-900">{player.firstName} {player.lastName}</div>
                                                <div className="text-sm font-mono text-slate-500">{player.pokemonId}</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                                            Εγγράφηκε
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
