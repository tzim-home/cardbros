import React from 'react';
import { History, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TransactionsPage() {
    const transactions = await (prisma.transaction as any).findMany({
        orderBy: { createdAt: 'desc' },
        include: { player: true, event: true },
        take: 50
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between text-xl font-bold">
                    <Link href="/" className="flex items-center gap-2 tracking-tight">TCG Manager</Link>
                    <div className="flex gap-4 text-sm font-medium">
                        <Link href="/" className="hover:text-blue-200">Dashboard</Link>
                        <Link href="/players" className="hover:text-blue-200">Παικτες</Link>
                        <Link href="/transactions" className="underline">Ιστορικο</Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <History className="w-8 h-8 text-slate-700" />
                        <h1 className="text-3xl font-bold text-slate-900">Ιστορικό Συναλλαγών</h1>
                    </div>
                    <p className="text-slate-600">Οι τελευταίες 50 κινήσεις του συστήματος.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Ημερομηνία</th>
                                <th className="px-6 py-4">Παίκτης</th>
                                <th className="px-6 py-4">Κίνηση / Αιτιολογία</th>
                                <th className="px-6 py-4 text-right">Ποσό</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Δεν υπάρχουν συναλλαγές.</td>
                                </tr>
                            ) : transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(tx.createdAt).toLocaleString('el-GR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        {(tx.player as any).firstName} {(tx.player as any).lastName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800 text-sm">
                                            {/* @ts-ignore */}
                                            {tx.reason || (tx.type === 'checkin' ? (tx.event ? `Check-in: ${tx.event.name}` : 'Check-in') : 'Συναλλαγή')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`flex items-center justify-end font-bold ${tx.type.includes('add') || tx.type === 'checkin' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                            {tx.type.includes('add') || tx.type === 'checkin' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                                            {tx.type.includes('credits') ? `${tx.type === 'credits_sub' ? '-' : '+'}${tx.amount} Credits` :
                                                `${tx.type === 'points_sub' ? '-' : '+'}${tx.amount} πόντους`}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
