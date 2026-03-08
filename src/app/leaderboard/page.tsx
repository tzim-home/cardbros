import React from 'react';
import { prisma } from '@/lib/prisma';
import { Trophy, Medal } from 'lucide-react';
import LeaderboardFilter from './LeaderboardFilter';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({
    searchParams
}: {
    searchParams: { month?: string }
}) {
    const selectedMonth = searchParams.month;

    // Fetch all players
    const allPlayers = await prisma.player.findMany({
        include: {
            transactions: true
        }
    });

    // 1. Βρίσκουμε όλους τους μήνες που έχουν υπάρξει transactions
    const uniqueMonthsSet = new Set<string>();
    allPlayers.forEach(p => {
        p.transactions.forEach(tx => {
            const date = new Date(tx.createdAt);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            uniqueMonthsSet.add(yearMonth);
        });
    });

    // Ταξινομούμε φθίνουσα
    const availableMonths = Array.from(uniqueMonthsSet).sort((a, b) => b.localeCompare(a));

    // 2. Υπολογισμός Πόντων ανάλογα με το φίλτρο
    let processedPlayers = allPlayers.map(p => {
        let displayPoints = p.totalPoints; // Default: All Time

        if (selectedMonth && selectedMonth !== 'all') {
            const [yearStr, monthStr] = selectedMonth.split('-');
            const year = parseInt(yearStr);
            const monthIndex = parseInt(monthStr) - 1; // 0-11

            // Βρίσκουμε start & end του επιλεγμένου μήνα
            const startOfMonth = new Date(year, monthIndex, 1);
            const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

            // Φιλτράρισμα transactions αυτού του μήνα
            const monthTxs = p.transactions.filter(tx => {
                const txDate = new Date(tx.createdAt);
                return txDate >= startOfMonth && txDate <= endOfMonth;
            });

            // Άθροισμα / Αφαίρεση πόντων
            displayPoints = monthTxs.reduce((sum, tx) => {
                const amount = Number(tx.amount);
                if (tx.type === 'checkin' || tx.type === 'points_add') {
                    return sum + amount;
                } else if (tx.type === 'points_sub') {
                    return sum - amount;
                }
                return sum;
            }, 0);
        }

        return { ...p, displayPoints };
    });

    // Αν έχει επιλεγεί συγκεκριμένος μήνας, ΚΡΥΒΟΥΜΕ όσους έχουν 0 (ή λιγότερους) πόντους αυτό το μήνα
    if (selectedMonth && selectedMonth !== 'all') {
        processedPlayers = processedPlayers.filter(p => p.displayPoints > 0);
    }

    // Sort by points
    processedPlayers.sort((a, b) => b.displayPoints - a.displayPoints);

    // Filter Top 50 limits globally
    processedPlayers = processedPlayers.slice(0, 50);



    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
                            <Trophy className="w-10 h-10 text-amber-500" />
                            Leaderboard
                        </h1>
                        <p className="text-slate-600 text-lg">Οι κορυφαίοι παίκτες του TCG Manager.</p>
                    </div>

                    {/* Φίλτρο Μήνα */}
                    <LeaderboardFilter availableMonths={availableMonths} />
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Top Παίκτες</h2>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                            {processedPlayers.length} παίκτες
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                                    <th className="px-4 py-3 sm:px-8 sm:py-4 text-left w-12 sm:w-20">Θέση</th>
                                    <th className="px-4 py-3 sm:px-8 sm:py-4 text-left">Παίκτης</th>
                                    <th className="px-4 py-3 sm:px-8 sm:py-4 text-left hidden sm:table-cell">Κατηγορία</th>
                                    <th className="px-4 py-3 sm:px-8 sm:py-4 text-right">Πόντοι</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {processedPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-slate-400 italic">
                                            Δεν υπάρχουν παίκτες για αυτή την κατάταξη.
                                        </td>
                                    </tr>
                                ) : (
                                    processedPlayers.map((player, index: number) => (
                                        <tr key={player.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-4 sm:px-8 sm:py-6">
                                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold text-base sm:text-lg">
                                                    {index === 0 ? <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" /> :
                                                        index === 1 ? <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" /> :
                                                            index === 2 ? <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700" /> :
                                                                <span className="text-slate-400">#{index + 1}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 sm:px-8 sm:py-6">
                                                <div className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-slate-600 transition-colors">
                                                    {player.firstName} {player.lastName}
                                                </div>
                                                <div className="text-xs sm:text-sm text-slate-400 font-mono">ID: {player.pokemonId}</div>
                                                {/* Εμφανίζουμε την κατηγορία στο mobile view απευθείας στο όνομα */}
                                                <div className="sm:hidden mt-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${player.ageCategory === 'Master' ? 'bg-slate-100 text-slate-700' :
                                                        player.ageCategory === 'Senior' ? 'bg-slate-200 text-slate-800' :
                                                            'bg-slate-50 text-slate-500'
                                                        }`}>
                                                        {player.ageCategory}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 sm:px-8 sm:py-6 hidden sm:table-cell">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${player.ageCategory === 'Master' ? 'bg-slate-100 text-slate-700' :
                                                    player.ageCategory === 'Senior' ? 'bg-slate-200 text-slate-800' :
                                                        'bg-slate-50 text-slate-500'
                                                    }`}>
                                                    {player.ageCategory}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 sm:px-8 sm:py-6 text-right">
                                                <div className="text-xl sm:text-2xl font-black text-slate-900">
                                                    {player.displayPoints}
                                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 ml-1 uppercase block sm:inline">pts</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
