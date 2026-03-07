import React from 'react';
import { prisma } from '@/lib/prisma';
import { Trophy, Medal, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function LeaderboardPage() {
    const players = await (prisma.player as any).findMany({
        orderBy: { totalPoints: 'desc' },
        take: 50
    });

    const divisions = ['Master', 'Senior', 'Junior'];

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
                        <Trophy className="w-10 h-10 text-amber-500" />
                        Leaderboard
                    </h1>
                    <p className="text-slate-600 text-lg">Οι κορυφαίοι παίκτες του TCG Manager.</p>
                </div>

                <div className="space-y-12">
                    {divisions.map(division => {
                        const divPlayers = players.filter((p: any) => p.ageCategory === division);

                        return (
                            <div key={division} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                                    <h2 className="text-2xl font-bold uppercase tracking-wider">{division} Division</h2>
                                    <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                                        {divPlayers.length} παίκτες
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                                                <th className="px-8 py-4 text-left w-20">Θέση</th>
                                                <th className="px-8 py-4 text-left">Παίκτης</th>
                                                <th className="px-8 py-4 text-right">Συνολικοί Πόντοι</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {divPlayers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic">
                                                        Δεν υπάρχουν παίκτες σε αυτή την κατηγορία.
                                                    </td>
                                                </tr>
                                            ) : (
                                                divPlayers.map((player: any, index: number) => (
                                                    <tr key={player.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg">
                                                                {index === 0 ? <Medal className="w-8 h-8 text-amber-500" /> :
                                                                    index === 1 ? <Medal className="w-8 h-8 text-slate-400" /> :
                                                                        index === 2 ? <Medal className="w-8 h-8 text-amber-700" /> :
                                                                            <span className="text-slate-400">#{index + 1}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                                {player.firstName} {player.lastName}
                                                            </div>
                                                            <div className="text-sm text-slate-400 font-mono">ID: {player.pokemonId}</div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="text-2xl font-black text-slate-900">
                                                                {player.totalPoints}
                                                                <span className="text-xs font-bold text-slate-400 ml-1 uppercase">pts</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
