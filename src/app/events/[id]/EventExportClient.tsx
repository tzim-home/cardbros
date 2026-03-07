'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface EventExportClientProps {
    eventName: string;
    players: any[];
}

export default function EventExportClient({ eventName, players }: EventExportClientProps) {
    const handleExport = () => {
        const headers = ['A/A', 'Όνομα', 'Επώνυμο', 'Pokemon ID', 'Division'];
        const rows = players.map((p, idx) => [
            idx + 1,
            p.firstName,
            p.lastName,
            `"${p.pokemonId}"`,
            p.ageCategory
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `participants_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm"
        >
            <Download className="w-4 h-4" />
            Εξαγωγή Λίστας (CSV)
        </button>
    );
}
