import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, History, Trophy, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GiveawayHistoryPage() {
    const history = await prisma.giveawayWinner.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            player: true,
            event: true
        },
        take: 100 // Παίρνουμε τους τελευταίους 100 νικητές
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
                        <History className="w-8 h-8 text-amber-500" />
                        Ιστορικό Κληρώσεων
                    </h1>
                    <p className="text-slate-500 mt-2">Όλοι οι νικητές των κληρώσεων ανά τουρνουά.</p>
                </div>
                <Link
                    href="/giveaway"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Επιστροφή στις Κληρώσεις
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-sm">
                                    <th className="px-6 py-4">Νικητής</th>
                                    <th className="px-6 py-4">Τουρνουά</th>
                                    <th className="px-6 py-4">Ημερομηνία &amp; Ώρα</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((win: any) => (
                                    <tr key={win.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                                    <Trophy className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">
                                                        {win.player.firstName} {win.player.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        {win.player.pokemonId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{win.event.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(win.event.date).toLocaleDateString('el-GR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">
                                                    {new Date(win.createdAt).toLocaleDateString('el-GR')}
                                                </span>
                                                <span className="text-slate-500 text-sm">
                                                    {new Date(win.createdAt).toLocaleTimeString('el-GR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <Trophy className="w-16 h-16 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Δεν υπάρχουν νικητές ακόμα</h3>
                        <p className="text-slate-500">Οι νικητές από τις κληρώσεις θα εμφανίζονται εδώ.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
