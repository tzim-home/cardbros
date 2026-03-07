import React from 'react';
import {
  Users,
  Star,
  CalendarCheck,
  UserPlus,
  Trophy,
  History,
  Settings as SettingsIcon,
  LayoutDashboard
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Dashboard() {
  // Fetch real data from database
  const totalPlayers = await prisma.player.count();
  const totalPoints = await prisma.player.aggregate({
    _sum: {
      totalPoints: true,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkinsToday = await prisma.transaction.count({
    where: {
      type: 'checkin',
      createdAt: {
        gte: today,
      },
    },
  });

  const latestTransactions = await (prisma.transaction as any).findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { player: true, event: true },
  });

  const stats = [
    { label: 'Σύνολο Παικτών', value: totalPlayers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Συνολικοί Πόντοι', value: (totalPoints._sum.totalPoints || 0).toString(), icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Check-ins Σήμερα', value: checkinsToday.toString(), icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  const quickActions = [
    { label: 'Νέος Παίκτης', icon: UserPlus, color: 'blue', href: '/players' },
    { label: 'Τουρνουά', icon: Trophy, color: 'emerald', href: '/events' },
    { label: 'Ιστορικό Συναλλαγών', icon: History, color: 'slate', href: '/transactions' },
    { label: 'Ρυθμίσεις Συστήματος', icon: SettingsIcon, color: 'slate', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-900">Ταμπλό Ελέγχου</h1>
          </div>
          <p className="text-slate-600">Καλώς ορίσατε στο σύστημα διαχείρισης Pokemon TCG.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`${stat.bg} p-4 rounded-full`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-800">
                Γρήγορες Ενέργειες
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <action.icon className="w-10 h-10 text-slate-400 group-hover:text-blue-600" />
                      <span className="font-semibold text-slate-700 group-hover:text-blue-700">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-800">
                Πρόσφατη Δραστηριότητα
              </div>
              <div className="p-2 overflow-y-auto max-h-[32rem]">
                {latestTransactions.length === 0 ? (
                  <div className="p-6 flex flex-col items-center justify-center min-h-[16rem] text-slate-400 italic text-center">
                    <History className="w-12 h-12 mb-3 opacity-20" />
                    <p>Δεν υπάρχει πρόσφατη δραστηριότητα.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {latestTransactions.map((tx) => (
                      <div key={tx.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-900 text-sm">
                            {/* @ts-ignore Prisma types may be stale */}
                            {(tx.player as any).firstName} {(tx.player as any).lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-medium line-clamp-1 max-w-[200px]">
                            {/* @ts-ignore */}
                            {tx.reason || (tx.type === 'checkin' ? (tx.event ? `Check-in: ${tx.event.name}` : 'Check-in') : tx.type.replace('_', ' '))}
                          </span>
                          <span className={`font-bold ${tx.type.includes('add') || tx.type === 'checkin' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.type.includes('credits') ? `${tx.type === 'credits_sub' ? '-' : '+'}${tx.amount} Credits` :
                              `${tx.type === 'points_sub' ? '-' : '+'}${tx.amount} πόντους`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
