'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { unregisterPlayerFromEvent } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface EventUnregisterClientProps {
    playerId: number;
    eventId: number;
    playerName: string;
}

export default function EventUnregisterClient({ playerId, eventId, playerName }: EventUnregisterClientProps) {
    const handleUnregister = async () => {
        if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την εγγραφή του παίκτη ${playerName}; Οι πόντοι συμμετοχής θα αφαιρεθούν.`)) {
            return;
        }

        try {
            await unregisterPlayerFromEvent(playerId, eventId);
            toast.success('Η εγγραφή διαγράφηκε επιτυχώς!');
        } catch (err: any) {
            toast.error(err.message || 'Σφάλμα κατά τη διαγραφή της εγγραφής');
        }
    };

    return (
        <button
            onClick={handleUnregister}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Διαγραφή Εγγραφής"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
