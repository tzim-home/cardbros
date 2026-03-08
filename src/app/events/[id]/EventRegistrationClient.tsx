'use client';

import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { registerPlayerToEvent } from '@/lib/actions';
import { toast } from 'react-hot-toast';

export default function EventRegistrationClient({ eventId, isActive }: { eventId: number, isActive: boolean }) {
    const [search, setSearch] = useState('');
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isActive) {
        return (
            <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">Οι εγγραφές είναι κλειστές. Το τουρνουά δεν είναι ενεργό.</p>
            </div>
        );
    }

    const handleSearch = async (val: string) => {
        setSearch(val);
        if (val.length < 2) {
            setPlayers([]);
            return;
        }

        setLoading(true);
        const res = await fetch(`/api/players?query=${val}`);
        const data = await res.json();
        setPlayers(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const handleRegister = async (playerId: number) => {
        try {
            await registerPlayerToEvent(playerId, eventId);
            setSearch('');
            setPlayers([]);
            toast.success('Ο παίκτης εγγράφηκε επιτυχώς!');
        } catch (err: any) {
            toast.error(err.message || 'Σφάλμα κατά την εγγραφή');
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <h3 className="font-bold text-slate-900 whitespace-nowrap">Νέα Εγγραφή</h3>
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Όνομα ή Pokemon ID..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-white text-slate-900 text-sm placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-4 text-slate-400 text-sm animate-pulse">Αναζήτηση...</div>
                ) : players.length > 0 ? (
                    players.map(player => (
                        <button
                            key={player.id}
                            onClick={() => handleRegister(player.id)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all group text-left"
                        >
                            <div>
                                <div className="font-bold text-slate-900 group-hover:text-black text-sm">{player.firstName} {player.lastName}</div>
                                <div className="text-xs text-slate-500 font-mono">{player.pokemonId}</div>
                            </div>
                            <UserPlus className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                        </button>
                    ))
                ) : search.length >= 2 ? (
                    <div className="text-center py-4 text-slate-400 text-sm italic">Δεν βρέθηκαν παίκτες.</div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">Αναζητήστε για να προσθέσετε παίκτη.</div>
                )}
            </div>
        </div>
    );
}
