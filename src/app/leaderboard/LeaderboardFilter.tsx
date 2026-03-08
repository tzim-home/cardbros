'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface LeaderboardFilterProps {
    availableMonths: string[]; // π.χ. '2026-03', '2026-02'
}

export default function LeaderboardFilter({ availableMonths }: LeaderboardFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get('month') || 'all';

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'all') {
            router.push('/leaderboard');
        } else {
            router.push(`/leaderboard?month=${val}`);
        }
    };

    // Helper formatter
    const formatMonthYear = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <Calendar className="w-5 h-5 text-slate-400" />
            <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="bg-transparent border-none text-slate-700 font-semibold focus:ring-0 cursor-pointer outline-none"
            >
                <option value="all">Συνολική Κατάταξη (All-Time)</option>
                {availableMonths.map((m) => (
                    <option key={m} value={m}>
                        {formatMonthYear(m)}
                    </option>
                ))}
            </select>
        </div>
    );
}
